function jsboyTimer(cpu)
{
    this.cpu = cpu;

    // DIV register (machine time clocked)
    this.div = 0;

    this.scalar = 0;
    this.divider = 0;

    this.timer;
    this.modulo;
    this.enabled = false;
}

jsboyTimer.prototype.PRESCALARS = [
        (8 * 1024 * 1024) / 4096,
        (8 * 1024 * 1024) / 262144,
        (8 * 1024 * 1024) / 65536,
        (8 * 1024 * 1024) / 16384
    ];

jsboyTimer.prototype.tick = function(cycles)
{
    this.div = (this.div + cycles) & 0xFFFF;
}
    
jsboyTimer.prototype.clock = function(cycles)
{
    if( !this.enabled )
        return ;
    
    var wrap = this.PRESCALARS[this.scalar];
    
    this.divider += cycles; 
    this.timer += (this.divider / wrap);
    this.divider %= wrap;
    
    // Timer overflow
    if( this.timer >= 0x100 )
    {
        this.timer = ((this.timer - this.modulo) % (0x100 - this.modulo)) + this.modulo;
        this.cpu.trigger( IRQ_TIMER );
    }
}

jsboyTimer.prototype.read_TIMA = function()
{
    this.cpu.catchUp();
    
    return this.timer;
}

jsboyTimer.prototype.write_TIMA = function(data)
{
    this.cpu.catchUp();
    
    this.timer = data;
}

jsboyTimer.prototype.read_TAC = function()
{
    return this.scalar | (this.enabled ? 4 : 0);
}

jsboyTimer.prototype.write_TAC = function(data)
{
    this.cpu.catchUp();
    
    this.scalar = data & 3;
    this.enabled = data & 4;
    this.divider = 0;
}

jsboyTimer.prototype.read_TMA = function()
{
    return this.modulo;
}

jsboyTimer.prototype.write_TMA = function(data)
{
    this.cpu.catchUp();
    this.modulo = data;
}

jsboyTimer.prototype.read_DIV = function()
{
    this.cpu.catchUp();
    return this.div >> 8;
}

jsboyTimer.prototype.write_DIV = function()
{
    this.cpu.catchUp();
    this.div = 0;
}

jsboyTimer.prototype.reset = function()
{
    // Map TIMER
    this.timer = 0;
    this.modulo = 0;
    this.divider = 0;
    this.scalar = 0;
    this.enabled = false;
    
    this.cpu.read[REG_TIMA] = this.$('read_TIMA');
    this.cpu.write[REG_TIMA] = this.$('write_TIMA');
    this.cpu.read[REG_TMA] = this.$('read_TMA');
    this.cpu.write[REG_TMA] = this.$('write_TMA');
    this.cpu.read[REG_TAC] = this.$('read_TAC');
    this.cpu.write[REG_TAC] = this.$('write_TAC');

    // Map DIV register
    this.div = 0;

    this.cpu.read[REG_DIV] = this.$('read_DIV');
    this.cpu.write[REG_DIV] = this.$('write_DIV');
}

// Determine how many cycles until the next interrupt
jsboyTimer.prototype.predict = function()
{
    if( !this.enabled )
        return ;
    
    return this.PRESCALARS[this.scalar] * (0x100 - this.timer) - this.divider;
}
