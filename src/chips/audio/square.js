define([], function () {
    function SquareChannel(cpu) {
        this.cpu = cpu;
    }

    SquareChannel.prototype.reset = function () {
        this.enabled = false;

        // Envelope system
        this.envelopeRegister = 0;
        this.envelopeCounter = 0;
        this.envelopeTick = 0;
        this.envelopeDirection = -1;
        this.envelopePeriod = 0;

        // Sweep system
        this.sweepRegister = 0;
        this.sweepCounter = 0;
        this.sweepTick = 0;
        this.sweepPeriod = 0;

        this.lengthEnable = 0;
        this.lengthCounter = 0;
        this.frequency = 0;

        this.sample = 0;
        this.frequencyCounter = 0;
        
        this.initalVolume = 0;
        this.duty = 0;
        this.length = 0;
        this.waveform = 0x01;
    };

    SquareChannel.prototype.clock = function (ticks) {
        if (!this.enabled) { return ; }

        this.frequencyCounter += ticks;

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

        // Sweep system
        if (this.sweepPeriod) {
            this.sweepCounter += ticks;
            if (this.sweepCounter >= 65535) {
                if (++this.sweepTick == this.sweepPeriod) {
                    this.activeFrequency += (this.activeFrequency >> this.sweepShift) * this.sweepDirection;

                    if (this.activeFrequency >= 2048) { this.enabled = false; }

                    this.overflow = (2048 - this.activeFrequency) * 8;
                    this.sweepTick = 0;
                }

                this.sweepCounter &= 65535;
            }
        }
    };

    SquareChannel.prototype.level = function () {
        if (!this.enabled) { return 0; }

        // Determine our current sample
        this.sample = (this.sample + (this.frequencyCounter / this.overflow)) & 7;
        this.frequencyCounter %= this.overflow;

        return ((this.waveform >> this.sample) & 1) * this.volume;
    };

    SquareChannel.prototype.active = function () {
        return this.enabled;
    }

    // --- Registers
    SquareChannel.prototype.write_sweep = function (d) {
        this.sweepRegister = d;

        this.sweepPeriod = (d >> 4) & 7;
        this.sweepDirection = (d & 8) ? -1 : 1;
        this.sweepShift = d & 7;
    };

    SquareChannel.prototype.write_length = function (d) {
        this.duty = d & 0xC0;
        this.length = d & 0x3F;

        switch(this.duty) {
            case 0x00:
                this.waveform = 0x01;
                break ;
            case 0x40:
                this.waveform = 0x81;
                break ;
            case 0x80:
                this.waveform = 0x87;
                break ;
            case 0xC0:
                this.waveform = 0x7E;
                break ;
        }
    };

    SquareChannel.prototype.write_volume = function (d) {
        this.envelopeRegister = d;

        this.initalVolume = (d >> 4) / 15.0;
        this.envelopeDirection = (d & 8) ? (1.0/15) : (-1.0/15);
        this.envelopePeriod = d & 7;
    };

    SquareChannel.prototype.write_freq_lo = function (d) {
        this.frequency = (this.frequency & 0xFF00) | (d);
    };

    SquareChannel.prototype.write_freq_hi = function (d) {
        this.frequency = (this.frequency & 0x00FF) | ((d & 0x07) << 8);
        this.lengthEnable = d & 0x40;

        // Sound frequency
        if (d & 0x80) {
            this.cpu.catchUp();

            this.enabled = true;
            this.activeFrequency = this.frequency;
            this.overflow = (2048 - this.activeFrequency) * 8;

            this.frequencyCounter = 0;
            this.lengthCounter = 0;

            this.envelopeCounter = 0;
            this.envelopeTick = 0;

            this.sweepCounter = 0;
            this.sweepTick = 0;

            this.volume = this.initalVolume;
        }
    };

    SquareChannel.prototype.read_sweep = function () {
        return 0x80  | this.sweepRegister;
    };

    SquareChannel.prototype.read_length = function () {
        return 0x3F | this.duty;
    };

    SquareChannel.prototype.read_volume = function () {
        return this.envelopeRegister;
    };

    SquareChannel.prototype.read_freq_hi = function () {
        return 0xBF | this.lengthEnable;
    };

    return SquareChannel;
});
