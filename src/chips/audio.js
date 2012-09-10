define([], function () {
    var BUFFER_LENGTH = 2048;

    function Audio() {
        if (this.context) {
            this.node = this.context.createJavaScriptNode(BUFFER_LENGTH);
            this.node.onaudioprocess = this.$('process');
        }
    }

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

    Audio.prototype.clock = function (ticks) {
    };
    
    Audio.prototype.reset = function () {
    };

    return Audio;
});
