var registers = require("../registers"),
    SquareChannel = require("./square"),
    WaveformChannel = require("./waveform"),
    NoiseChannel = require("./noise");

var BUFFER_LENGTH = 2048,               // ~91ms buffer
    LONG_BUFFER   = BUFFER_LENGTH * 2,  // Render to a much larger buffer
    CLOCK_RATE    = 8388608;

class Sound {
    constructor(cpu) {
        this.cpu = cpu;
        this.square1 = new SquareChannel(cpu);
        this.square2 = new SquareChannel(cpu);
        this.waveform = new WaveformChannel(cpu);
        this.noise = new NoiseChannel(cpu);

        this.context = window.webkitAudioContext && (new webkitAudioContext());

        if (this.context) {
            this.node = this.context.createScriptProcessor(BUFFER_LENGTH, 2, 2);
            this.node.onaudioprocess = this.process.bind(this);
            this.sampleRate = this.context.sampleRate;
        } else {
            this.sampleRate = 0;
        }

        this.leftBuffer = new Float32Array(LONG_BUFFER);
        this.rightBuffer = new Float32Array(LONG_BUFFER);

        // Playback buffering
        this.activeSample = 0;      // Next sample written
        this.sampleTime = 0;        // Bresenham sample counter
    }

    clock(ticks) {
        var s;

        this.sampleTime += ticks * this.sampleRate;

        if (!this.masterEnable) {
            while (this.sampleTime >= CLOCK_RATE) {
                s = this.activeSample;

                this.sampleTime -= CLOCK_RATE;
                this.rightBuffer[s] = 0;
                this.leftBuffer[s] = 0;

                if (++this.activeSample >= LONG_BUFFER) {
                    this.activeSample = 0;
                }
            }
            return ;
        }

        this.square1.clock(ticks);
        this.square2.clock(ticks);
        this.waveform.clock(ticks);
        this.noise.clock(ticks);

        while (this.sampleTime >= CLOCK_RATE) {
            var ch0 = this.square1.level(),
                ch1 = this.square2.level(),
                ch2 = this.waveform.level(),
                ch3 = this.noise.level();

            s = this.activeSample;
            this.sampleTime -= CLOCK_RATE;

            this.rightBuffer[s] = (
                ch0*this.ch0right +
                ch1*this.ch1right +
                ch2*this.ch2right +
                ch3*this.ch3right) * this.rightVolume * 0.25;

            this.leftBuffer[s] = (
                ch0*this.ch0left +
                ch1*this.ch1left +
                ch2*this.ch2left +
                ch3*this.ch3left) * this.leftVolume * 0.25;

            if (++this.activeSample >= LONG_BUFFER) {
                this.activeSample = 0;
            }
        }
    }

    reset() {
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
        this.cpu.registers.write[registers.NR10] = this.square1.write_sweep.bind(this.square1);
        this.cpu.registers.write[registers.NR11] = this.square1.write_length.bind(this.square1);
        this.cpu.registers.write[registers.NR12] = this.square1.write_volume.bind(this.square1);
        this.cpu.registers.write[registers.NR13] = this.square1.write_freq_lo.bind(this.square1);
        this.cpu.registers.write[registers.NR14] = this.square1.write_freq_hi.bind(this.square1);

        this.cpu.registers.read[registers.NR10] = this.square1.read_sweep.bind(this.square1);
        this.cpu.registers.read[registers.NR11] = this.square1.read_length.bind(this.square1);
        this.cpu.registers.read[registers.NR12] = this.square1.read_volume.bind(this.square1);
        this.cpu.registers.read[registers.NR14] = this.square1.read_freq_hi.bind(this.square1);

        this.cpu.registers.write[registers.NR21] = this.square2.write_length.bind(this.square2);
        this.cpu.registers.write[registers.NR22] = this.square2.write_volume.bind(this.square2);
        this.cpu.registers.write[registers.NR23] = this.square2.write_freq_lo.bind(this.square2);
        this.cpu.registers.write[registers.NR24] = this.square2.write_freq_hi.bind(this.square2);

        this.cpu.registers.read[registers.NR21] = this.square2.read_length.bind(this.square2);
        this.cpu.registers.read[registers.NR22] = this.square2.read_volume.bind(this.square2);
        this.cpu.registers.read[registers.NR24] = this.square2.read_freq_hi.bind(this.square2);

        // --- Waveform Channel
        this.cpu.registers.write[registers.NR30] = this.waveform.write_enable.bind(this.waveform);
        this.cpu.registers.write[registers.NR31] = this.waveform.write_length.bind(this.waveform);
        this.cpu.registers.write[registers.NR32] = this.waveform.write_level.bind(this.waveform);
        this.cpu.registers.write[registers.NR33] = this.waveform.write_freq_lo.bind(this.waveform);
        this.cpu.registers.write[registers.NR34] = this.waveform.write_freq_hi.bind(this.waveform);

        this.cpu.registers.read[registers.NR30] = this.waveform.read_enable.bind(this.waveform);
        this.cpu.registers.read[registers.NR32] = this.waveform.read_level.bind(this.waveform);
        this.cpu.registers.read[registers.NR34] = this.waveform.read_freq_hi.bind(this.waveform);

        // --- Noise Channel
        this.cpu.registers.write[registers.NR41] = this.noise.write_length.bind(this.noise);
        this.cpu.registers.write[registers.NR42] = this.noise.write_volume.bind(this.noise);
        this.cpu.registers.write[registers.NR43] = this.noise.write_poly.bind(this.noise);
        this.cpu.registers.write[registers.NR44] = this.noise.write_control.bind(this.noise);

        this.cpu.registers.read[registers.NR42] = this.noise.read_volume.bind(this.noise);
        this.cpu.registers.read[registers.NR43] = this.noise.read_poly.bind(this.noise);
        this.cpu.registers.read[registers.NR44] = this.noise.read_control.bind(this.noise);

        // --- Control registers
        this.cpu.registers.write[registers.NR50] = this.write_NR50.bind(this);
        this.cpu.registers.write[registers.NR51] = this.write_NR51.bind(this);
        this.cpu.registers.write[registers.NR52] = this.write_NR52.bind(this);

        this.cpu.registers.read[registers.NR50] = this.read_NR50.bind(this);
        this.cpu.registers.read[registers.NR51] = this.read_NR51.bind(this);
        this.cpu.registers.read[registers.NR52] = this.read_NR52.bind(this);
    }

    mute() {
        if (!this.node) { return ; }

        this.node.disconnect();
    }

    play() {
        if (!this.node) { return ; }

        this.node.connect(this.context.destination);
    }

    process(e) {
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
    write_NR50(d) {
        this.NR50 = d;

        // Nothing uses VIN, ignored for now
        this.leftVolume =  ((d & 0x70) >> 4) / 7.0;
        this.rightVolume = (d & 0x07) / 7.0;
    }

    write_NR51(d) {
        this.NR51 = d;

        this.ch0right = (d >> 0) & 1;
        this.ch1right = (d >> 1) & 1;
        this.ch2right = (d >> 2) & 1;
        this.ch3right = (d >> 3) & 1;
        this.ch0left  = (d >> 4) & 1;
        this.ch1left  = (d >> 5) & 1;
        this.ch2left  = (d >> 6) & 1;
        this.ch3left  = (d >> 7) & 1;
    }

    write_NR52(d) {
        this.masterEnable = d & 0x80;
    }

    read_NR50() {
        return this.NR50;
    }

    read_NR51() {
        return this.NR51;
    }

    read_NR52() {
        if (!this.masterEnable) { return 0; }

        this.cpu.catchUp();
        return this.masterEnable |
              (this.square1.active() ? 1 : 0) |
              (this.square2.active() ? 2 : 0) |
              (this.waveform.active() ? 4 : 0) |
              (this.noise.active() ? 8 : 0);
    }
}

module.exports = Sound;
