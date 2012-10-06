define([], function () {
    function NoiseChannel() {
        this.wavetable = ramBlock(0x16);
    }

    NoiseChannel.prototype.reset = function () {
    };

    NoiseChannel.prototype.clock = function (ticks) {
    };

    NoiseChannel.prototype.level = function () {
        return 0;
    };

    NoiseChannel.prototype.active = function () {
        return false;
    }

    // --- Registers
    NoiseChannel.prototype.write_length = function (d) {
    };
    NoiseChannel.prototype.write_volume = function (d) {
    };
    NoiseChannel.prototype.write_poly = function (d) {
    };
    NoiseChannel.prototype.write_control = function (d) {
    };
    NoiseChannel.prototype.read_length = function () {
        return 0;
    };
    NoiseChannel.prototype.read_volume = function () {
        return 0;
    };
    NoiseChannel.prototype.read_poly = function () {
        return 0;
    };
    NoiseChannel.prototype.read_control = function () {
        return 0;
    };

    return NoiseChannel;
});
