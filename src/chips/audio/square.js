define([], function () {
    function SquareChannel() {
    }

    SquareChannel.prototype.reset = function () {
    };

    SquareChannel.prototype.clock = function (ticks) {
    };
    
    SquareChannel.prototype.level = function () {
        return 0;
    };

    // --- Registers
    SquareChannel.prototype.write_sweep = function (d) {
    };
    SquareChannel.prototype.write_length = function (d) {
    };
    SquareChannel.prototype.write_volume = function (d) {
    };
    SquareChannel.prototype.write_freq_lo = function (d) {
    };
    SquareChannel.prototype.write_freq_hi = function (d) {
    };

    SquareChannel.prototype.read_sweep = function () {
        return 0;
    };
    SquareChannel.prototype.read_length = function () {
        return 0;
    };
    SquareChannel.prototype.read_volume = function () {
        return 0;
    };
    SquareChannel.prototype.read_freq_hi = function () {
        return 0;
    };

    return SquareChannel;
});
