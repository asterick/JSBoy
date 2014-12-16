var memory = require("../../util/memory");

class WaveformChannel {
    constructor(cpu) {
        this.cpu = cpu;
        this.wavetable = memory.ramBlock(0x16);
        this.waveform = this.wavetable.data;
    }

    reset() {
        this.enabled = false;
        this.channelEnable = 0;

        this.frequency = 0;
        this.overflow = 0;

        this.lengthEnable = 0;
        this.lengthCounter = 0;
        this.length = 0;

        this.frequencyCounter = 0;
        this.sample = 0;

        this.outputRegister = 0;
        this.volume = 0;
    }

    clock(ticks) {
        if (!this.enabled || !this.channelEnable) { return ; }

        this.frequencyCounter += ticks;

        // Length counter
        if (this.lengthEnable) {
            this.lengthCounter += ticks;
            if (this.lengthCounter >= 32768) {
                this.length = (this.length + 1) & 0xFF;
                this.enabled = this.length !== 0;
                this.lengthCounter &= 32767;
            }
        }
    }

    level() {
        if (!this.enabled || !this.channelEnable) { return 0; }

        this.sample = (this.sample + (this.frequencyCounter / this.overflow)) & 31;
        this.frequencyCounter %= this.overflow;

        // Determine our current sample
        var i = this.sample,
            shift = (i & 1) ? 0 : 4,
            sample = (this.waveform[i>>1] >> shift) & 0xF;

        return sample * this.volume;
    }

    active() {
        return this.enabled && this.channelEnable;
    }

    // --- Registers
    write_enable(d) {
        this.channelEnable = d & 0x80;
    }

    write_length(d) {
        this.length = d;
    }

    write_level(d) {
        this.outputRegister = d;

        switch (d & 0x60) {
        case 0x00:
            this.volume = 0;
            break ;
        case 0x20:
            this.volume = 1.00 / 15;
            break ;
        case 0x40:
            this.volume = 0.50 / 15;
            break ;
        case 0x60:
            this.volume = 0.25 / 15;
            break ;
        }
    }

    write_freq_lo(d) {
        this.frequency = (this.frequency & 0xFF00) | (d);
    }

    write_freq_hi(d) {
        this.frequency = (this.frequency & 0x00FF) | ((d & 0x07) << 8);
        this.lengthEnable = d & 0x40;

        // Sound frequency
        if (d & 0x80) {
            this.cpu.catchUp();

            this.enabled = true;
            this.frequencyCounter = 0;
            this.sample = 0;

            this.lengthCounter = 0;
            this.overflow = (2048 - this.frequency) * 4;
        }
    }

    read_enable() {
        return 0x7F | this.channelEnable;
    }

    read_level() {
        return 0x9F | this.outputRegister;
    }

    read_freq_hi() {
        return 0xBF | this.lengthEnable;
    }
}

module.exports = WaveformChannel;
