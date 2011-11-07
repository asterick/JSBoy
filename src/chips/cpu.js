include('src/chips/ops/base.js')
include('src/chips/ops/shift.js')
include('src/chips/ops/control.js')
include('src/chips/video/gpu.js');

include('src/chips/registers.js');
include('src/chips/bios.js');
include('src/chips/joypad.js');
include('src/chips/timer.js');
include('src/chips/workram.js');

var IRQ_VBLANK = 1;
var IRQ_LCD_STAT = 2;
var IRQ_TIMER = 4;
var IRQ_SERIAL = 8;
var IRQ_JOYSTICK = 16;

function jsboyCPU(context)
{
    // External hardware
    this.gpu = new jsboyGPU(context, this);
    this.joypad = new jsboyJoypad(this);
    this.wram = new jsboyWorkRam(this);
    this.timer = new jsboyTimer(this);
    this.bios = new jsboyBIOS(this);
    this.rom = null;

    // Our memory delegate holders
    this.read = new Array(0x10000);
    this.write = new Array(0x10000);

    this.reset();
}

jsboyCPU.prototype.close = function()
{
    if( this.rom )
    {
        this.rom.close();
        this.rom = null;
    }
}

jsboyCPU.prototype.insert = function( cartridge )
{
    this.close();
    
    if( cartridge !== undefined )
        this.rom = cartridge;
    
    this.reset();
}

jsboyCPU.prototype.reset = function()
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
    this.frameCycles = 0;
    this.cycles = 0;
    
    function nullBody() { return 0xFF; }

    // Reset memory map
    this.read.fill(nullBody);
    this.write.fill(nullBody);

    // For debugging purposes, alert me when the system accesses a register it does not recognize
//    for( var i = 0xFF00; i < 0xFF80; i++ )
//        this.alertIllegal(i);

    // Ignoring the sound registers for now.
    this.read.fill(nullBody, 0xFF10, 0x30);
    this.write.fill(nullBody, 0xFF10, 0x30);

    // Map external hardware
    if( this.rom )
        this.rom.reset();

    this.gpu.reset();
    this.joypad.reset();
    this.wram.reset();
    this.timer.reset();
    this.bios.reset();        

    // Map IRQ specific registers into CPU
    this.read[REG_IE] = this.$('read_IE');
    this.write[REG_IE] = this.$('write_IE');
    this.read[REG_IF] = this.$('read_IF');        
    this.write[REG_IF] = this.$('write_IF');

    // Hardware lockout register
    this.write[REG_LOCK] = this.$('write_LOCK');
    
    // Map speed control register into CPU
    this.read[REG_KEY1] = this.$('read_KEY1');
    this.write[REG_KEY1] = this.$('write_KEY1');    
}

jsboyCPU.prototype.setCPUSpeed = function(fast) {
    this.doubleSpeed = fast;
    this.prepareSpeed = false;
}

jsboyCPU.prototype.alertIllegal = function( addr )
{
    var addrName = addr.toString(16).toUpperCase();
    
    this.read[addr] = function() {
        log("ILLEGAL READ: ", addrName);
        return 0xFF;
    }
    this.write[addr] = function(data) {
        log("ILLEGAL WRITE: ", addrName, data.toString(16).toUpperCase());
    }
}

jsboyCPU.prototype.update = function()
{
    this.gpu.update();
}

// --- This occurs when the an event causes the IRQ prediction to be invalid
jsboyCPU.prototype.invalidate = function()
{
    this.predictDivided = 0;
};

jsboyCPU.prototype.predictEvent = function()
{
    // Never clock more than the rest of the frame!
    var predict = this.frameCycles;
    
    var b = this.gpu.predict();
    var c = this.timer.predict();
    //TODO: SERIAL?

    if( b < predict )
        predict = b;
    if( c < predict )
        predict = c;
        
    return predict;
}

// --- Send CPU accumulation clock to the external components
jsboyCPU.prototype.catchUp = function()
{
    // Increment it based on the CPU clock, not the system
    var cpuCycles = this.doubleSpeed ? this.cycles : (this.cycles >> 1);
    this.timer.tick(cpuCycles);
    this.timer.clock(this.cycles);

    this.gpu.clock(this.cycles);

    // Flush the cycle buffer
    this.frameCycles -= this.cycles;
    this.invalidate();
    this.cycles = 0;
}

// --- Interrupt logic
jsboyCPU.prototype.interrupt = function()
{
    // Absolutely no IRQs are pending, so we simply give up    
    if( !this.irq_request )
        return ;

    this.halted = false;

    var masked = this.irq_enable & this.irq_request;        
    if( !masked )
        return ;

    // --- Master IRQ enabled?
    if( !this.irq_master )
        return ;

    // --- Do we have any pending IRQs?
    
    // Locate vector
    var vector = 0x40;
    var select = 0x01;
    
    while( !(masked & select) && 0x20 > select )
    {
        select <<= 1;
        vector += 8;
    }

    // Dispatch the IRQ
    this.irq_request &= ~select;    
    this.irq_master = false;
    this.call(vector);
    this.cycles += this.doubleSpeed ? 4 : 8;
}

// --- Trigger IRQ (auto invalidate prediction)
jsboyCPU.prototype.trigger = function(irq)
{
    // There is no prediction, the game did, in fact, have an event
    this.irq_request |= irq;
    this.invalidate();
}

// --- Step the CPU to the next event point
jsboyCPU.prototype.step = function()
{
    // 114 cycles per scanline, 154 scanlines, double speed
    this.frameCycles = this.gpu.predictEndOfFrame();
            
    while( this.frameCycles > 0 )
    {
        var clockRate = this.doubleSpeed ? 4 : 8;
        var predict = this.predictEvent() || clockRate;
        this.predictDivided = predict / clockRate;
        
        // CPU is stopped, or halted, simply clock the machine up to
        // the predicted value
        if( this.halted )
        {
            this.cycles += predict;
        }
        else
        {
            var cycles = 0;
            
            // CPU is running, run up until the IRQ prediction mark
            while( this.predictDivided > cycles )
                cycles += this.stepBase();
            
            this.cycles += cycles * clockRate;
        }
        
        this.catchUp();
        this.interrupt();
    }
}
    
jsboyCPU.prototype.singleStep = function()
{
    if( this.halted )
        this.cycles += 1;
    else
        this.cycles += this.stepBase() * (this.doubleSpeed ? 4 : 8);

    this.catchUp();
    this.interrupt();
}

// --- Start emulation helpers
jsboyCPU.prototype.bc = function()
{
    return (this.b<<8) | this.c;
}

jsboyCPU.prototype.de = function()
{
    return (this.d<<8) | this.e;
}

jsboyCPU.prototype.hl = function()
{
    return (this.h<<8) | this.l;
}

jsboyCPU.prototype.setF = function(data)
{
    this.cf = data & 0x10;
    this.hf = data & 0x20;
    this.nf = data & 0x40;
    this.zf = data & 0x80;
}

jsboyCPU.prototype.getF = function()
{
    return (this.zf ? 0x80 : 0) |
        (this.nf ? 0x40 : 0) |
        (this.hf ? 0x20 : 0) |
        (this.cf ? 0x10 : 0);
}
    
jsboyCPU.prototype.push = function(data)
{
    this.sp = (this.sp - 1) & 0xFFFF;
    this.write[this.sp](data);
}

jsboyCPU.prototype.pop = function()
{
    var data = this.read[this.sp]();
    this.sp = (this.sp + 1) & 0xFFFF;
    return data;
}

jsboyCPU.prototype.call = function(addr)
{
    this.push(this.pc>>8);
    this.push(this.pc&0xFF);
    this.pc = addr;
}

jsboyCPU.prototype.ret = function()
{
    this.pc = this.pop();
    this.pc |= this.pop() << 8;        
}

jsboyCPU.prototype.nextByte = function()
{
    var op = this.read[this.pc]();
    this.pc = (this.pc + 1) & 0xFFFF;
    return op;
}

jsboyCPU.prototype.nextSignedByte = function()
{
    // Sign extend byte
    var b = this.nextByte();
    if( b & 0x80 )
        return b - 0x100;
    return b;
}

jsboyCPU.prototype.nextRelative = function()
{
    var o = this.nextSignedByte();
    return (this.pc + o) & 0xFFFF;
}

jsboyCPU.prototype.nextWord = function()
{
    var l = this.nextByte();
    var h = this.nextByte();
    return (h<<8) | l;
}

jsboyCPU.prototype.delayByte = function()
{
    // This is a cute way of preventing the CPU from incrementing PC for a
    // clock happens on halts and stops with IME disabled
    this.nextByte = function() {
        delete this.nextByte;
        return this.read[this.pc]();
    }
}
