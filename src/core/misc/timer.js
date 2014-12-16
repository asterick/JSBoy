var registers = require("../registers"),
    consts = require("../consts");

function Timer(cpu)
{
    this.cpu = cpu;

    // DIV register (machine time clocked)
    this.div = 0;

    this.scalar = 0;
    this.divider = 0;

    this.timer = 0;
    this.modulo = 0;
    this.enabled = false;
}

Timer.prototype.PRESCALARS = [
        (8 * 1024 * 1024) / 4096,
        (8 * 1024 * 1024) / 262144,
        (8 * 1024 * 1024) / 65536,
        (8 * 1024 * 1024) / 16384
    ];

Timer.prototype.tick = function(cycles)
{
    this.div = (this.div + cycles) & 0xFFFF;
};

Timer.prototype.clock = function(cycles)
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
        this.cpu.trigger( consts.IRQ_TIMER );
    }
};

Timer.prototype.read_TIMA = function()
{
    this.cpu.catchUp();

    return this.timer;
};

Timer.prototype.write_TIMA = function(data)
{
    this.cpu.catchUp();

    this.timer = data;
};

Timer.prototype.read_TAC = function()
{
    return this.scalar | (this.enabled ? 4 : 0);
};

Timer.prototype.write_TAC = function(data)
{
    this.cpu.catchUp();

    this.scalar = data & 3;
    this.enabled = data & 4;
    this.divider = 0;
};

Timer.prototype.read_TMA = function()
{
    return this.modulo;
};

Timer.prototype.write_TMA = function(data)
{
    this.cpu.catchUp();
    this.modulo = data;
};

Timer.prototype.read_DIV = function()
{
    this.cpu.catchUp();
    return this.div >> 8;
};

Timer.prototype.write_DIV = function()
{
    this.cpu.catchUp();
    this.div = 0;
};

Timer.prototype.reset = function()
{
    // Map TIMER
    this.timer = 0;
    this.modulo = 0;
    this.divider = 0;
    this.scalar = 0;
    this.enabled = false;

    this.cpu.registers.read[registers.TIMA] = this.read_TIMA.bind(this);
    this.cpu.registers.write[registers.TIMA] = this.write_TIMA.bind(this);
    this.cpu.registers.read[registers.TMA] = this.read_TMA.bind(this);
    this.cpu.registers.write[registers.TMA] = this.write_TMA.bind(this);
    this.cpu.registers.read[registers.TAC] = this.read_TAC.bind(this);
    this.cpu.registers.write[registers.TAC] = this.write_TAC.bind(this);

    // Map DIV register
    this.div = 0;

    this.cpu.registers.read[registers.DIV] = this.read_DIV.bind(this);
    this.cpu.registers.write[registers.DIV] = this.write_DIV.bind(this);
};

// Determine how many cycles until the next interrupt
Timer.prototype.predict = function()
{
    if( !this.enabled )
        return ;

    return this.PRESCALARS[this.scalar] * (0x100 - this.timer) - this.divider;
};

module.exports = Timer;
