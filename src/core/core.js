import Timer from "./misc/timer";
import WorkRam from "./misc/workram";
import JoyPad from "./misc/joypad";
import BIOS from "./misc/bios";
import GPU from "./video/gpu";
import Audio from "./audio/audio";

import OPs from "./ops";

import * as registers from "./registers";


export default class Core extends OPs {
    constructor () {
        // External hardware
        this.audio = new Audio(this);
        this.gpu = new GPU(this);
        this.joypad = new JoyPad(this);
        this.wram = new WorkRam(this);
        this.timer = new Timer(this);
        this.bios = new BIOS(this);
        this.rom = null;

        this.reset();
    }

    get bc () {
        return this.regBC();
    }

    get de () {
        return this.regDE();
    }

    get hl () {
        return this.regHL();
    }

    get f () {
        return this.regF();
    }

    set f (v) {
        this.setF(v);
    }

    setContext (ctx) {
        this.gpu.setContext(ctx);
    }

    close () {
        if (this.rom) {
            this.rom.close();
            this.rom = null;
        }
    }

    insert (cartridge) {
        this.close();

        if (cartridge !== undefined) {
            this.rom = cartridge;
        }

        this.reset();
    }

    reset () {
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
        this.nullBlock = (new Array(0x100)).fill(nullBody);

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
        this.registers.read[registers.IE] = this.read_IE.bind(this);
        this.registers.write[registers.IE] = this.write_IE.bind(this);
        this.registers.read[registers.IF] = this.read_IF.bind(this);
        this.registers.write[registers.IF] = this.write_IF.bind(this);

        // Hardware lockout register
        this.registers.write[registers.LOCK] = this.write_LOCK.bind(this);

        // Map speed control register into CPU
        this.registers.read[registers.KEY1] = this.read_KEY1.bind(this);
        this.registers.write[registers.KEY1] = this.write_KEY1.bind(this);
    }

    setCPUSpeed (fast) {
        this.doubleSpeed = fast;
        this.prepareSpeed = false;
    }

    alertIllegal (addr) {
        var addrName = addr.toString(16).toUpperCase(),
            hi = addr>>8,
            lo = addr & 0xFF;

        this.read[hi][lo] = function () {
            console.log("ILLEGAL READ: ", addrName);
            return 0xFF;
        };
        this.write[hi][lo] = function (data) {
            console.log("ILLEGAL WRITE: ", addrName, data.toString(16).toUpperCase());
        };
    }

    // --- This occurs when the an event causes the IRQ prediction to be invalid
    invalidate () {
        this.predictDivided = 0;
    }

    predictEvent () {
        // Never clock more than the rest of the frame!
        var b = this.gpu.predict();
        var c = this.timer.predict();
        //TODO: SERIAL?

        return (b < c) ? b : c;
    }

    // --- Send CPU accumulation clock to the external components
    catchUp () {
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
    interrupt () {
        // Absolutely no IRQs are pending, so we simply give up
        if (!this.irq_request) {
            return ;
        }

        this.halted = false;

        // --- Master IRQ enabled?
        if (!this.irq_master) {
            return ;
        }

        // --- Any servicable interrupts available
        var masked = this.irq_enable & this.irq_request;
        if (!masked) {
            return ;
        }

        // Locate vector
        var vector = 0x40;
        var select = 0x01;

        while(!(masked & select) && 0x20 > select) {
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
    trigger (irq) {
        // There is no prediction, the game did, in fact, have an event
        this.irq_request |= irq;
        this.invalidate();
    }

    // --- Step the CPU to the next event point
    step (frameCycles) {
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

    singleStep () {
        var clockSpeed = (this.doubleSpeed ? 4 : 8);

        if( this.halted )
            this.cycles += clockSpeed;
        else
            this.cycles += this.stepBase() * clockSpeed;

        this.catchUp();
        this.interrupt();
    }

    // --- Start emulation helpers
    regBC () {
        return (this.b<<8) | this.c;
    }

    regDE () {
        return (this.d<<8) | this.e;
    }

    regHL () {
        return (this.h<<8) | this.l;
    }

    setF (data) {
        this.cf = data & 0x10;
        this.hf = data & 0x20;
        this.nf = data & 0x40;
        this.zf = data & 0x80;
    }

    getF () {
        return (this.zf ? 0x80 : 0) |
            (this.nf ? 0x40 : 0) |
            (this.hf ? 0x20 : 0) |
            (this.cf ? 0x10 : 0);
    }

    push (data) {
        this.sp = (this.sp - 1) & 0xFFFF;
        var h = this.sp >> 8,
            l = this.sp & 0xFF;

        this.write[h][l](data);
    }

    pop () {
        var h = this.sp >> 8,
            l = this.sp & 0xFF,
            data = this.read[h][l]();
        this.sp = (this.sp + 1) & 0xFFFF;
        return data;
    }

    call (addr) {
        this.push(this.pc>>8);
        this.push(this.pc&0xFF);
        this.pc = addr;
    }

    ret () {
        this.pc = this.pop();
        this.pc |= this.pop() << 8;
    }

    nextByte () {
        var h = this.pc >> 8,
            l = this.pc & 0xFF;
        var op = this.read[h][l]();
        this.pc = (this.pc + 1) & 0xFFFF;
        return op;
    }

    nextSignedByte () {
        // Sign extend byte
        var b = this.nextByte();
        return (b & 0x7F) - (b & 0x80);
    }

    nextRelative () {
        var b = this.nextSignedByte();
        return (this.pc + (b & 0x7F) - (b & 0x80)) & 0xFFFF;
    }

    nextWord () {
        var l = this.nextByte();
        var h = this.nextByte();
        return (h<<8) | l;
    }

    delayByte () {
        // This is a cute way of preventing the CPU from incrementing PC for a
        // clock happens on halts and stops with IME disabled
        this.nextByte = function() {
            var h = this.pc >> 8,
                l = this.pc & 0xFF;
            delete this.nextByte;
            return this.read[h][l]();
        };
    }

    // --- CPU Level hardware registers (IEQ, Speed and CPU dependant timer)
    read_IE ()
    {
        return this.irq_enable;
    }

    write_IE ( data )
    {
        this.catchUp();
        this.irq_enable = data & 0x1F;
    }

    read_IF ()
    {
        this.catchUp();
        return this.irq_request;
    }

    write_IF ( data )
    {
        this.catchUp();
        this.irq_request = data & 0x1F;
    }

    read_KEY1 ()
    {
        return (this.doubleSpeed ? 0x80 : 0) |
               (this.prepareSpeed ? 0x01 : 0);
    }

    write_KEY1 (data)
    {
        this.prepareSpeed = data & 1;
    }

    write_LOCK (data)
    {
        if( data != 1 )
            return ;

        // This perminantly locks down all GBC specfic hardware, preventing it from
        // being inadvertantly accessed by mono gameboy titles
        // BIOS appears to have priviledged access to the hardware, so until
        // it locks, don't disable the advanced registers

        var self = this;
        var lock = this.registers.write[registers.BLCK];

        this.registers.write[registers.BLCK] = function(data)
        {
            if( data != 0x11 )
                return ;

            // --- IR Communication
            self.alertIllegal(registers.RP);

            // --- Video DMA
            self.alertIllegal(registers.HDMA1);
            self.alertIllegal(registers.HDMA2);
            self.alertIllegal(registers.HDMA3);
            self.alertIllegal(registers.HDMA4);
            self.alertIllegal(registers.HDMA5);

            // --- Palette access
            self.alertIllegal(registers.BCPS);
            self.alertIllegal(registers.BCPD);
            self.alertIllegal(registers.OCPS);
            self.alertIllegal(registers.OCPD);

            // --- Memory banking
            self.alertIllegal(registers.VBK);
            self.alertIllegal(registers.SVBK);

            // --- Speed control
            self.alertIllegal(registers.KEY1);

            // --- Lockout controls
            self.alertIllegal(registers.LCD_MODE);
            self.alertIllegal(registers.LOCK);

            lock(0x11);
        };
    }
}
