define([
    "chips/timer",
    "chips/workram",
    "chips/joypad",
    "chips/bios",
    "chips/video/gpu",
    "chips/audio",
    "chips/registers"
], function(Timer, WorkRam, Joypad, BIOS, GPU, Audio, registers) {
    function CPU(context)
    {
        Object.defineProperty(this, 'bc', {
            get: this.regBC
        });
        Object.defineProperty(this, 'de', {
            get: this.regDE
        });
        Object.defineProperty(this, 'hl', {
            get: this.regHL
        });
        Object.defineProperty(this, 'f', {
            get: this.getF,
            set: this.setF
        });

        // External hardware
        this.audio = new Audio(this);
        this.gpu = new GPU(context, this);
        this.joypad = new Joypad(this);
        this.wram = new WorkRam(this);
        this.timer = new Timer(this);
        this.bios = new BIOS(this);
        this.rom = null;

        this.reset();
    }

    CPU.prototype.close = function()
    {
        if( this.rom )
        {
            this.rom.close();
            this.rom = null;
        }
    }

    CPU.prototype.insert = function( cartridge )
    {
        this.close();
    
        if( cartridge !== undefined )
            this.rom = cartridge;
    
        this.reset();
    }

    CPU.prototype.reset = function()
    {
        // IF, IE registers
        this.irq_enable = 0;
        this.irq_request = 0;
        this.irq_master = false;
    
        // KEY1 register
        this.setCPUSpeed(false);
        this.invalidate();
    
        // CPU registers
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.h = 0;
        this.l = 0;

        this.pc = 0;
        this.sp = 0;

        this.cf = false;
        this.hf = false;
        this.zf = false;
        this.nf = false;

        this.halted = false;
    
        // CPU timing / runtime variables
        this.cycles = 0;
    
        function nullBody() { return 0xFF; }

        // Reset memory map
        this.read = (new Array(0x10000)).fill(nullBody).chunk(0x100);
        this.write = (new Array(0x10000)).fill(nullBody).chunk(0x100);

        this.registers = {
            read: this.read[0xFF],
            write: this.write[0xFF]
        };

        // For debugging purposes, alert me when the system accesses a register it does not recognize
        for (var i = 0xFF00; i < 0xFF80; i++) {
            this.alertIllegal(i);
        }

        // Map external hardware
        if (this.rom) {
            this.rom.reset();
        }

        this.audio.reset();
        this.gpu.reset();
        this.joypad.reset();
        this.wram.reset();
        this.timer.reset();
        this.bios.reset();        

        // Map IRQ specific registers into CPU
        this.registers.read[registers.IE] = this.$('read_IE');
        this.registers.write[registers.IE] = this.$('write_IE');
        this.registers.read[registers.IF] = this.$('read_IF');        
        this.registers.write[registers.IF] = this.$('write_IF');

        // Hardware lockout register
        this.registers.write[registers.LOCK] = this.$('write_LOCK');
    
        // Map speed control register into CPU
        this.registers.read[registers.KEY1] = this.$('read_KEY1');
        this.registers.write[registers.KEY1] = this.$('write_KEY1');    
    }

    CPU.prototype.setCPUSpeed = function(fast) {
        this.doubleSpeed = fast;
        this.prepareSpeed = false;
    }

    CPU.prototype.alertIllegal = function( addr )
    {
        var addrName = addr.toString(16).toUpperCase();
        var hi = Math.floor(addr>>8),
            lo = addr & 0xFF;
    
        this.read[hi][lo] = function() {
            log("ILLEGAL READ: ", addrName);
            return 0xFF;
        }
        this.write[hi][lo] = function(data) {
            log("ILLEGAL WRITE: ", addrName, data.toString(16).toUpperCase());
        }
    }

    // --- This occurs when the an event causes the IRQ prediction to be invalid
    CPU.prototype.invalidate = function()
    {
        this.predictDivided = 0;
    };

    CPU.prototype.predictEvent = function()
    {
        // Never clock more than the rest of the frame!
        var b = this.gpu.predict();
        var c = this.timer.predict();
        //TODO: SERIAL?

        if( b < c )
            return b;
        else
            return c;
    }

    // --- Send CPU accumulation clock to the external components
    CPU.prototype.catchUp = function()
    {
        this.audio.clock(this.cycles);
        this.timer.clock(this.cycles);
        this.gpu.clock(this.cycles);

        // Increment DIV based on the CPU ticks, not the system clock
        var cpuTicks = this.doubleSpeed ? this.cycles : (this.cycles >> 1);
        this.timer.tick(cpuTicks);

        // Flush the cycle buffer
        this.invalidate();
        this.cycles = 0;
    }

    // --- Interrupt logic
    CPU.prototype.interrupt = function()
    {
        // Absolutely no IRQs are pending, so we simply give up    
        if( !this.irq_request )
            return ;

        this.halted = false;

        // --- Master IRQ enabled?
        if( !this.irq_master )
            return ;

        // --- Any servicable interrupts available
        var masked = this.irq_enable & this.irq_request;        
        if( !masked )
            return ;
    
        // Locate vector
        var vector = 0x40;
        var select = 0x01;
    
        while( !(masked & select) && 0x20 > select )
        {
            select <<= 1;
            vector += 8;
        }

        // Service the IRQ
        this.call(vector);
        this.irq_request &= ~select;
        this.irq_master = false;
        this.cycles += this.doubleSpeed ? 4 : 8;
    }

    // --- Trigger IRQ (auto invalidate prediction)
    CPU.prototype.trigger = function(irq)
    {
        // There is no prediction, the game did, in fact, have an event
        this.irq_request |= irq;
        this.invalidate();
    }

    // --- Step the CPU to the next event point
    CPU.prototype.step = function()
    {
        // Try to run up to the end of the frame
        var frameCycles = this.gpu.predictEndOfFrame();

        while( frameCycles > 0 )
        {
            var clockRate = this.doubleSpeed ? 4 : 8;
            var predict = this.predictEvent() || clockRate;

            if( predict > frameCycles )
                predict = frameCycles;
        
            // CPU is stopped, or halted, simply clock the machine up to
            // the predicted value
            if( this.halted )
            {
                this.cycles += predict;
            }
            else
            {
                this.predictDivided = predict / clockRate;
                var cycles = 0;
            
                // CPU is running, run up until the IRQ prediction mark
                do {
                    cycles += this.stepBase();
                } while( this.predictDivided > cycles );
            
                this.cycles += cycles * clockRate;
            }
        
            frameCycles -= this.cycles;

            this.catchUp();
            this.interrupt();        
        }
    }
    
    CPU.prototype.singleStep = function()
    {
        var clockSpeed = (this.doubleSpeed ? 4 : 8)

        if( this.halted )
            this.cycles += clockSpeed;
        else
            this.cycles += this.stepBase() * clockSpeed;

        this.catchUp();
        this.interrupt();
    }

    // --- Start emulation helpers
    CPU.prototype.regBC = function()
    {
        return (this.b<<8) | this.c;
    }

    CPU.prototype.regDE = function()
    {
        return (this.d<<8) | this.e;
    }

    CPU.prototype.regHL = function()
    {
        return (this.h<<8) | this.l;
    }

    CPU.prototype.setF = function(data)
    {
        this.cf = data & 0x10;
        this.hf = data & 0x20;
        this.nf = data & 0x40;
        this.zf = data & 0x80;
    }

    CPU.prototype.getF = function()
    {
        return (this.zf ? 0x80 : 0) |
            (this.nf ? 0x40 : 0) |
            (this.hf ? 0x20 : 0) |
            (this.cf ? 0x10 : 0);
    }
    
    CPU.prototype.push = function(data)
    {
        this.sp = (this.sp - 1) & 0xFFFF;
        var h = this.sp >> 8,
            l = this.sp & 0xFF;

        this.write[h][l](data);
    }

    CPU.prototype.pop = function()
    {
        var h = this.sp >> 8,
            l = this.sp & 0xFF,
            data = this.read[h][l]();
        this.sp = (this.sp + 1) & 0xFFFF;
        return data;
    }

    CPU.prototype.call = function(addr)
    {
        this.push(this.pc>>8);
        this.push(this.pc&0xFF);
        this.pc = addr;
    }

    CPU.prototype.ret = function()
    {
        this.pc = this.pop();
        this.pc |= this.pop() << 8;
    }

    CPU.prototype.nextByte = function()
    {
        var h = this.pc >> 8,
            l = this.pc & 0xFF;
        var op = this.read[h][l]();
        this.pc = (this.pc + 1) & 0xFFFF;
        return op;
    }

    CPU.prototype.nextSignedByte = function()
    {
        // Sign extend byte
        var b = this.nextByte();
        if( b & 0x80 )
            return b - 0x100;
        return b;
    }

    CPU.prototype.nextRelative = function()
    {
        var o = this.nextSignedByte();
        return (this.pc + o) & 0xFFFF;
    }

    CPU.prototype.nextWord = function()
    {
        var l = this.nextByte();
        var h = this.nextByte();
        return (h<<8) | l;
    }
    
    CPU.prototype.readHL = function () {
        return this.read[this.h][this.l]();
    };
    
    CPU.prototype.writeHL = function (d) {
        this.write[this.h][this.l](d);
    };

    CPU.prototype.delayByte = function()
    {
        // This is a cute way of preventing the CPU from incrementing PC for a
        // clock happens on halts and stops with IME disabled
        this.nextByte = function() {
            var h = this.pc >> 8,
                l = this.pc & 0xFF;
            delete this.nextByte;
            return this.read[h][l]();
        }
    }

    return CPU;
});
