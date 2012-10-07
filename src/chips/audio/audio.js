define([
    "chips/registers",
    "chips/audio/square",
    "chips/audio/waveform",
    "chips/audio/noise"
], function (registers, SquareChannel, WaveformChannel, NoiseChannel) {
    var BUFFER_LENGTH = 2048,               // ~91ms buffer
        LONG_BUFFER   = BUFFER_LENGTH * 2;  // Render to a much larger buffer
        WRAP_MASK     = LONG_BUFFER - 1,    // ... and don't get bigger than this value
        CLOCK_RATE    = 8388608;

    /*
    8 cycles between square steps
    4 cycles between wave table steps
    16 cycles between noise table steps
    32768 cycles between length checks
    65535 cycles between sweep counters
    131072 cycles between envelope checks

    Frame counter period (16384 cycles)
    */

    function Audio(cpu) {
        this.cpu = cpu;
        this.square1 = new SquareChannel(cpu);
        this.square2 = new SquareChannel(cpu);
        this.waveform = new WaveformChannel(cpu);
        this.noise = new NoiseChannel(cpu);

        if (this.context) {
            this.node = this.context.createJavaScriptNode(BUFFER_LENGTH);
            this.node.onaudioprocess = this.$('process');
        }

        // Playback buffering
        this.activeSample = 0;      // Next sample written
        this.sampleTime = 0;        // Bresenham sample counter

        this.leftBuffer = new Float32Array(LONG_BUFFER);
        this.rightBuffer = new Float32Array(LONG_BUFFER);
    }

    Audio.prototype.clock = function (ticks) {
        this.sampleTime += ticks * this.context.sampleRate;

        while (this.sampleTime >= CLOCK_RATE) {
            var s = this.activeSample,
                ch0 = this.square1.level(),
                ch1 = this.square2.level(),
                ch2 = this.waveform.level(),
                ch3 = this.noise.level();

            this.sampleTime -= CLOCK_RATE;
            this.activeSample = (this.activeSample+1) & WRAP_MASK;

            if (!this.masterEnable) {
                this.rightBuffer[s] = 0;
                this.leftBuffer[s] = 0;

                continue ;
            }

            this.rightBuffer[s] = (
                ch0*this.ch0right +
                ch1*this.ch1right +
                ch2*this.ch2right +
                ch3*this.ch3right) * this.rightVolume;

            this.leftBuffer[s] = (
                ch0*this.ch0left +
                ch1*this.ch1left +
                ch2*this.ch2left +
                ch3*this.ch3left) * this.leftVolume;

        }

        if (!this.masterEnable) return ;

        this.square1.clock(ticks);
        this.square2.clock(ticks);
        this.waveform.clock(ticks);
        this.noise.clock(ticks);
    };

    Audio.prototype.reset = function () {
        var self = this;

        this.square1.reset();
        this.square2.reset();
        this.waveform.reset();
        this.noise.reset();

        this.NR50 = 0;
        this.NR51 = 0;

        this.leftVolume = 0;
        this.rightVolume = 0;
        this.masterEnable = 0;

        this.ch0right = 0;
        this.ch1right = 0;
        this.ch2right = 0;
        this.ch3right = 0;
        this.ch0left  = 0;
        this.ch1left  = 0;
        this.ch2left  = 0;
        this.ch3left  = 0;

        this.cpu.registers.read.copy(registers.AUD3WAVERAM0, this.waveform.wavetable.read);
        this.cpu.registers.write.copy(registers.AUD3WAVERAM0, this.waveform.wavetable.write);

        // --- Square register channels
        this.cpu.registers.write[registers.NR10] = this.square1.$('write_sweep');
        this.cpu.registers.write[registers.NR11] = this.square1.$('write_length');
        this.cpu.registers.write[registers.NR12] = this.square1.$('write_volume');
        this.cpu.registers.write[registers.NR13] = this.square1.$('write_freq_lo');
        this.cpu.registers.write[registers.NR14] = this.square1.$('write_freq_hi');

        this.cpu.registers.read[registers.NR10] = this.square1.$('read_sweep');
        this.cpu.registers.read[registers.NR11] = this.square1.$('read_length');
        this.cpu.registers.read[registers.NR12] = this.square1.$('read_volume');
        this.cpu.registers.read[registers.NR14] = this.square1.$('read_freq_hi');

        this.cpu.registers.write[registers.NR21] = this.square2.$('write_length');
        this.cpu.registers.write[registers.NR22] = this.square2.$('write_volume');
        this.cpu.registers.write[registers.NR23] = this.square2.$('write_freq_lo');
        this.cpu.registers.write[registers.NR24] = this.square2.$('write_freq_hi');

        this.cpu.registers.read[registers.NR21] = this.square2.$('read_length');
        this.cpu.registers.read[registers.NR22] = this.square2.$('read_volume');
        this.cpu.registers.read[registers.NR24] = this.square2.$('read_freq_hi');

        // --- Waveform Channel
        this.cpu.registers.write[registers.NR30] = this.waveform.$('write_enable');
        this.cpu.registers.write[registers.NR31] = this.waveform.$('write_length');
        this.cpu.registers.write[registers.NR32] = this.waveform.$('write_level');
        this.cpu.registers.write[registers.NR33] = this.waveform.$('write_freq_lo');
        this.cpu.registers.write[registers.NR34] = this.waveform.$('write_freq_hi');

        this.cpu.registers.read[registers.NR30] = this.waveform.$('read_enable');
        this.cpu.registers.read[registers.NR31] = this.waveform.$('read_length');
        this.cpu.registers.read[registers.NR32] = this.waveform.$('read_level');
        this.cpu.registers.read[registers.NR34] = this.waveform.$('read_freq_hi');

        // --- Noise Channel
        this.cpu.registers.write[registers.NR41] = this.noise.$('write_length');
        this.cpu.registers.write[registers.NR42] = this.noise.$('write_volume');
        this.cpu.registers.write[registers.NR43] = this.noise.$('write_poly');
        this.cpu.registers.write[registers.NR44] = this.noise.$('write_control');

        this.cpu.registers.read[registers.NR41] = this.noise.$('read_length');
        this.cpu.registers.read[registers.NR42] = this.noise.$('read_volume');
        this.cpu.registers.read[registers.NR43] = this.noise.$('read_poly');
        this.cpu.registers.read[registers.NR44] = this.noise.$('read_control');

        // --- Control registers
        this.cpu.registers.write[registers.NR50] = this.$('write_NR50');
        this.cpu.registers.write[registers.NR51] = this.$('write_NR51');
        this.cpu.registers.write[registers.NR52] = this.$('write_NR52');

        this.cpu.registers.read[registers.NR50] = this.$('read_NR50');
        this.cpu.registers.read[registers.NR51] = this.$('read_NR51');
        this.cpu.registers.read[registers.NR52] = this.$('read_NR52');
    };

    // Don't assume audio is available
    Audio.prototype.context =
        window.webkitAudioContext && (new webkitAudioContext());

    Audio.prototype.mute = function () {
        if (!this.node) { return ; }

        this.node.disconnect();
    };

    Audio.prototype.play = function () {
        if (!this.node) { return ; }

        this.node.connect(this.context.destination);
    };

    Audio.prototype.process = function (e) {
        var left = e.outputBuffer.getChannelData(0),
            right = e.outputBuffer.getChannelData(1),
            length = left.length,
            s = (this.activeSample & BUFFER_LENGTH) ^ BUFFER_LENGTH,
            i = 0;

        for(; i < length; i++, s++) {
            left[i] = this.leftBuffer[s];
            right[i] = this.rightBuffer[s];
        }
    }

    // --- Control registers
    Audio.prototype.write_NR50 = function (d) {
        this.NR50 = d;

        // Nothing uses VIN, ignored for now
        this.leftVolume =  (d & 0x70) / 112.0;
        this.rightVolume = (d & 0x07) / 7.0;
    };

    Audio.prototype.write_NR51 = function (d) {
        this.NR51 = d;

        this.ch0right = (d >> 0) & 1;
        this.ch1right = (d >> 1) & 1;
        this.ch2right = (d >> 2) & 1;
        this.ch3right = (d >> 3) & 1;
        this.ch0left  = (d >> 4) & 1;
        this.ch1left  = (d >> 5) & 1;
        this.ch2left  = (d >> 6) & 1;
        this.ch3left  = (d >> 7) & 1;
    };

    Audio.prototype.write_NR52 = function (d) {
        this.masterEnable = d & 0x80;
    };

    Audio.prototype.read_NR50 = function () {
        return this.NR50;
    };

    Audio.prototype.read_NR51 = function () {
        return this.NR51;
    };

    Audio.prototype.read_NR52 = function () {
        if (!this.masterEnable) { return 0; }

        return this.masterEnable |
              (this.square1.active() ? 1 : 0) |
              (this.square2.active() ? 2 : 0) |
              (this.waveform.active() ? 4 : 0) |
              (this.noise.active() ? 8 : 0);
    };

    return Audio;
});
