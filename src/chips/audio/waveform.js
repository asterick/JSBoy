define([], function () {
    function WaveformChannel() {
        this.wavetable = ramBlock(0x16);
    }

    WaveformChannel.prototype.reset = function () {
    };

    WaveformChannel.prototype.clock = function (ticks) {
    };

    // --- Registers
    WaveformChannel.prototype.write_enable = function (d) {
    };
    WaveformChannel.prototype.write_length = function (d) {
    };
    WaveformChannel.prototype.write_level = function (d) {
    };
    WaveformChannel.prototype.write_freq_lo = function (d) {
    };
    WaveformChannel.prototype.write_freq_hi = function (d) {
    };
    WaveformChannel.prototype.read_enable = function () {
        return 0;
    };
    WaveformChannel.prototype.read_length = function () {
        return 0;
    };
    WaveformChannel.prototype.read_level = function () {
        return 0;
    };
    WaveformChannel.prototype.read_freq_hi = function () {
        return 0;
    };

    return WaveformChannel;
});
