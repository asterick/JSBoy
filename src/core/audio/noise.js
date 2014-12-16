class NoiseChannel {
    constructor (cpu) {
        this.cpu = cpu;
    }

    reset() {
        this.length = 0;
        this.enabled = false;

        this.envelopeRegister = 0;
        this.envelopeCounter = 0;
        this.envelopeTick = 0;
        this.envelopeDirection = -1;
        this.envelopePeriod = 0;
        this.initalVolume = 0;

        this.overflow = 128;
        this.polyform = 0;
    }

    clock(ticks) {
        if (!this.enabled) { return ; }

        var shifts, shifted, bit;

        // Determine our current sample
        this.frequencyCounter += ticks;
        shifts = this.frequencyCounter / this.overflow;
        this.frequencyCounter %= this.overflow;

        if (shifts) {
            if (this.polyform) {
                while (shifts-- > 0) {
                    shifted = this.lsfr >>> 1;
                    bit = (this.lsfr ^ shifted) & 1;
                    this.lsfr = (shifted & 0x3FBF) | (bit << 6);
                }
            } else {
                while (shifts-- > 0) {
                    shifted = this.lsfr >>> 1;
                    bit = (this.lsfr ^ shifted) & 1;
                    this.lsfr = shifted | (bit << 14);
                }
            }
        }

        // Length counter
        if (this.lengthEnable) {
            this.lengthCounter += ticks;
            if (this.lengthCounter >= 32768) {
                this.length = (this.length + 1) & 0x3F;
                this.enabled = this.length !== 0;
                this.lengthCounter &= 32767;
            }
        }

        // Envelope system
        if (this.envelopePeriod) {
            this.envelopeCounter += ticks;
            if (this.envelopeCounter >= 131072) {
                if (++this.envelopeTick == this.envelopePeriod) {
                    this.volume += this.envelopeDirection;
                    if (this.volume < 0) {
                        this.volume = 0;
                        this.envelopePeriod = 0;
                    } else if (this.volume > 1) {
                        this.volume = 1;
                        this.envelopePeriod = 0;
                    }

                    this.envelopeTick = 0;
                }
                this.envelopeCounter &= 131071;
            }
        }
    }

    level() {
        if (!this.enabled) { return 0; }

        return (~this.lsfr & 1) * this.volume;
    }

    active() {
        return this.enabled;
    }

    // --- Registers
    write_length(d) {
        this.length = d & 0x3F;
    }

    write_volume(d) {
        this.volumeRegister = d;

        this.initalVolume = (d >> 4) / 15.0;
        this.envelopeDirection = (d & 8) ? (1.0/15) : (-1.0/15);
        this.envelopePeriod = d & 7;
    }

    write_poly(d) {
        this.cpu.catchUp();

        this.polyRegister = d;

        var r = d >> 4,
            s = d & 7;

        this.polyform = d & 8;
        this.overflow = (r+1)*(16<<s);  // THIS IS WRONG
    }

    write_control(d) {
        this.lengthEnable = d & 0x40;

        // Sound frequency
        if (d & 0x80) {
            this.cpu.catchUp();

            this.enabled = true;
            this.lengthCounter = 0;

            this.envelopeCounter = 0;
            this.envelopeTick = 0;
            this.volume = this.initalVolume;

            this.frequencyCounter = 0;

            this.lsfr = 0x7FFF;
        }
    }

    read_volume() {
        return this.volumeRegister;
    }

    read_poly() {
        return this.polyRegister;
    }

    read_control() {
        return 0xBF | this.lengthEnable;
    }
}

module.exports = NoiseChannel;
