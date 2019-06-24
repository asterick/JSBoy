import * as registers from "../registers";
import * as consts from "../consts";

export default class Timer {
    constructor (cpu) {
        this.cpu = cpu;

        // DIV register (machine time clocked)
        this.div = 0;

        this.scalar = 0;
        this.divider = 0;

        this.timer = 0;
        this.modulo = 0;
        this.enabled = false;
    }

    tick (cycles) {
        this.div = (this.div + cycles) & 0xFFFF;
    }

    clock (cycles) {
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
    }

    read_TIMA () {
        this.cpu.catchUp();

        return this.timer;
    }

    write_TIMA (data) {
        this.cpu.catchUp();

        this.timer = data;
    }

    read_TAC ()
    {
        return this.scalar | (this.enabled ? 4 : 0);
    }

    write_TAC (data)
    {
        this.cpu.catchUp();

        this.scalar = data & 3;
        this.enabled = data & 4;
        this.divider = 0;
    }

    read_TMA ()
    {
        return this.modulo;
    }

    write_TMA (data)
    {
        this.cpu.catchUp();
        this.modulo = data;
    }

    read_DIV () {
        this.cpu.catchUp();
        return this.div >> 8;
    }

    write_DIV () {
        this.cpu.catchUp();
        this.div = 0;
    }

    reset () {
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
    }

    // Determine how many cycles until the next interrupt
    predict () {
        if( !this.enabled )
            return ;

        return this.PRESCALARS[this.scalar] * (0x100 - this.timer) - this.divider;
    }
}

Timer.prototype.PRESCALARS = [
        (8 * 1024 * 1024) / 4096,
        (8 * 1024 * 1024) / 262144,
        (8 * 1024 * 1024) / 65536,
        (8 * 1024 * 1024) / 16384
    ];

