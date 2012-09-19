define([
    "chips/registers",
    "chips/audio/square",
    "chips/audio/waveform",
    "chips/audio/noise"
], function (registers, SquareChannel, WaveformChannel, NoiseChannel) {
    var BUFFER_LENGTH = 2048,
        FRAME_COUNTER = 16384;

    /*
    8 cycles between frequency steps
    4 cycles between wave table steps
    16 cycles between noise table steps
    32768 cycles between length checks
    65535 cycles between sweep counters
    131072 cycles between envelope checks

    Frame counter period (16384 cycles)
    */

    function Audio(cpu) {
        this.cpu = cpu;
        this.square1 = new SquareChannel();
        this.square2 = new SquareChannel();
        this.waveform = new WaveformChannel();
        this.noise = new NoiseChannel();

        if (this.context) {
            this.node = this.context.createJavaScriptNode(BUFFER_LENGTH);
            this.node.onaudioprocess = this.$('process');
        }
    }

    Audio.prototype.clock = function (ticks) {
    };

    Audio.prototype.reset = function () {
        var self = this;

        this.NR50 = 0;
        this.NR51 = 0;

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

    // Don't assume audio is available, 
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
            length = left.length;

        for (var i = 0; i < length; i++) { left[i] = right[i] = 0; }
    }

    // --- Control registers
    Audio.prototype.write_NR50 = function (d) {
        this.NR50 = d;
    };
    Audio.prototype.write_NR51 = function (d) {
        this.NR51 = d;
    };
    Audio.prototype.write_NR52 = function (d) {
    };

    Audio.prototype.read_NR50 = function () { 
        return this.NR50;
    };
    Audio.prototype.read_NR51 = function () { 
        return this.NR51;
    };
    Audio.prototype.read_NR52 = function () { 
        return 0; 
    };

    return Audio;
});
