define([
    "chips/registers"
], function (registers) {
    var BUFFER_LENGTH = 2048;

    function Audio(cpu) {
        this.cpu = cpu;
        this.wavetable = new Uint8Array(16);

        if (this.context) {
            this.node = this.context.createJavaScriptNode(BUFFER_LENGTH);
            this.node.onaudioprocess = this.$('process');
        }
    }

    Audio.prototype.clock = function (ticks) {
    };
    
    Audio.prototype.reset = function () {
        var self = this;
        function delegate(i) {
            self.cpu.read[registers.AUD3WAVERAM0+i] = function () {
                return self.wavetable[i];
            };
            self.cpu.write[registers.AUD3WAVERAM0+i] = function (d) {
                self.cpu.catchup();
                self.wavetable[i] = d;
            };
        }
        for (var i = 0; i < 16; i++) { delegate(i); }
        
        this.cpu.read[registers.NR10] = this.$('read_NR10');
        this.cpu.read[registers.NR11] = this.$('read_NR11');
        this.cpu.read[registers.NR12] = this.$('read_NR12');
        this.cpu.read[registers.NR14] = this.$('read_NR14');

        this.cpu.read[registers.NR21] = this.$('read_NR21');
        this.cpu.read[registers.NR22] = this.$('read_NR22');
        this.cpu.read[registers.NR24] = this.$('read_NR24');

        this.cpu.read[registers.NR30] = this.$('read_NR30');
        this.cpu.read[registers.NR31] = this.$('read_NR31');
        this.cpu.read[registers.NR32] = this.$('read_NR32');
        this.cpu.read[registers.NR34] = this.$('read_NR34');

        this.cpu.read[registers.NR41] = this.$('read_NR41');
        this.cpu.read[registers.NR42] = this.$('read_NR42');
        this.cpu.read[registers.NR43] = this.$('read_NR43');
        this.cpu.read[registers.NR44] = this.$('read_NR44');

        this.cpu.read[registers.NR50] = this.$('read_NR50');
        this.cpu.read[registers.NR51] = this.$('read_NR51');
        this.cpu.read[registers.NR52] = this.$('read_NR52');

        this.cpu.write[registers.NR10] = this.$('write_NR10');
        this.cpu.write[registers.NR11] = this.$('write_NR11');
        this.cpu.write[registers.NR12] = this.$('write_NR12');
        this.cpu.write[registers.NR13] = this.$('write_NR13');
        this.cpu.write[registers.NR14] = this.$('write_NR14');

        this.cpu.write[registers.NR21] = this.$('write_NR21');
        this.cpu.write[registers.NR22] = this.$('write_NR22');
        this.cpu.write[registers.NR23] = this.$('write_NR23');
        this.cpu.write[registers.NR24] = this.$('write_NR24');

        this.cpu.write[registers.NR30] = this.$('write_NR30');
        this.cpu.write[registers.NR31] = this.$('write_NR31');
        this.cpu.write[registers.NR32] = this.$('write_NR32');
        this.cpu.write[registers.NR33] = this.$('write_NR33');
        this.cpu.write[registers.NR34] = this.$('write_NR34');

        this.cpu.write[registers.NR41] = this.$('write_NR41');
        this.cpu.write[registers.NR42] = this.$('write_NR42');
        this.cpu.write[registers.NR43] = this.$('write_NR43');
        this.cpu.write[registers.NR44] = this.$('write_NR44');

        this.cpu.write[registers.NR50] = this.$('write_NR50');
        this.cpu.write[registers.NR51] = this.$('write_NR51');
        this.cpu.write[registers.NR52] = this.$('write_NR52');
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

    // --- Register map
    Audio.prototype.write_NR10 = function (d) {};
    Audio.prototype.write_NR11 = function (d) {};
    Audio.prototype.write_NR12 = function (d) {};
    Audio.prototype.write_NR13 = function (d) {};
    Audio.prototype.write_NR14 = function (d) {};

    Audio.prototype.write_NR21 = function (d) {};
    Audio.prototype.write_NR22 = function (d) {};
    Audio.prototype.write_NR23 = function (d) {};
    Audio.prototype.write_NR24 = function (d) {};

    Audio.prototype.write_NR30 = function (d) {};
    Audio.prototype.write_NR31 = function (d) {};
    Audio.prototype.write_NR32 = function (d) {};
    Audio.prototype.write_NR33 = function (d) {};
    Audio.prototype.write_NR34 = function (d) {};

    Audio.prototype.write_NR41 = function (d) {};
    Audio.prototype.write_NR42 = function (d) {};
    Audio.prototype.write_NR43 = function (d) {};
    Audio.prototype.write_NR44 = function (d) {};

    Audio.prototype.write_NR50 = function (d) {};
    Audio.prototype.write_NR51 = function (d) {};
    Audio.prototype.write_NR52 = function (d) {};

    Audio.prototype.read_NR10 = function () { return 0; };
    Audio.prototype.read_NR11 = function () { return 0; };
    Audio.prototype.read_NR12 = function () { return 0; };
    Audio.prototype.read_NR14 = function () { return 0; };

    Audio.prototype.read_NR21 = function () { return 0; };
    Audio.prototype.read_NR22 = function () { return 0; };
    Audio.prototype.read_NR24 = function () { return 0; };

    Audio.prototype.read_NR30 = function () { return 0; };
    Audio.prototype.read_NR31 = function () { return 0; };
    Audio.prototype.read_NR32 = function () { return 0; };
    Audio.prototype.read_NR34 = function () { return 0; };

    Audio.prototype.read_NR41 = function () { return 0; };
    Audio.prototype.read_NR42 = function () { return 0; };
    Audio.prototype.read_NR43 = function () { return 0; };
    Audio.prototype.read_NR44 = function () { return 0; };

    Audio.prototype.read_NR50 = function () { return 0; };
    Audio.prototype.read_NR51 = function () { return 0; };
    Audio.prototype.read_NR52 = function () { return 0; };

    return Audio;
});
