define([], function () {
    function NoiseChannel(cpu) {
        this.cpu = cpu;
    }

    NoiseChannel.prototype.reset = function () {
        this.length = 0;
        this.enabled = false;

        this.envelopeRegister = 0;
        this.envelopeCounter = 0;
        this.envelopeTick = 0;
        this.envelopeDirection = -1;
        this.envelopePeriod = 0;
        this.initalVolume = 0;
    };

    NoiseChannel.prototype.clock = function (ticks) {
        if (!this.enabled) { return ; }

        // Determine our current sample
        // TODO: CALCULATE POLY

        // Length counter
        if (this.lengthEnabled) { 
            this.lengthCounter += ticks; 
            if (this.lengthCounter >= 32768) {
                this.length = (this.length + 1) & 0x3F;
                this.enabled = this.length != 0;
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
    };

    NoiseChannel.prototype.level = function () {
        if (!this.enabled) { return 0; }

        // TODO

        return Math.random(Math.random()) * this.volume;
    };

    NoiseChannel.prototype.active = function () {
        return this.enabled;
    }

    // --- Registers
    NoiseChannel.prototype.write_length = function (d) {
        this.length = d & 0x3F;
    };

    NoiseChannel.prototype.write_volume = function (d) {
        this.volumeRegister = d;

        this.initalVolume = (d >> 4) / 15.0;
        this.envelopeDirection = (d & 8) ? (1.0/15) : (-1.0/15);
        this.envelopePeriod = d & 7;
    };

    NoiseChannel.prototype.write_poly = function (d) {
        this.cpu.catchUp();

        this.polyRegister = d;

        // TODO:
    };

    NoiseChannel.prototype.write_control = function (d) {
        this.lengthEnable = d & 0x40;

        // Sound frequency
        if (d & 0x80) {
            this.cpu.catchUp();

            this.enabled = true;
            this.lengthCounter = 0;

            this.envelopeCounter = 0;
            this.envelopeTick = 0;
            this.volume = this.initalVolume;
        }
    };

    NoiseChannel.prototype.read_volume = function () {
        return this.volumeRegister;
    };

    NoiseChannel.prototype.read_poly = function () {
        return this.polyRegister;
    };

    NoiseChannel.prototype.read_control = function () {
        return 0xBF | this.lengthEnable;
    };

    return NoiseChannel;
});
