define([], function () {
    function SquareChannel() {
    }

    SquareChannel.prototype.reset = function () {
        this.enabled = false;
        this.lengthEnable = 0;
        this.frequency = 0;
    };

    SquareChannel.prototype.clock = function (ticks) {
    };
    
    SquareChannel.prototype.level = function () {
        return 0;
    };

    SquareChannel.prototype.active = function () {
        return this.enabled;
    }

    // --- Registers
    SquareChannel.prototype.write_sweep = function (d) {
    };
    
    SquareChannel.prototype.write_length = function (d) {
    };
    
    SquareChannel.prototype.write_volume = function (d) {
    };
    
    SquareChannel.prototype.write_freq_lo = function (d) {
        this.frequency = (this.frequency & 0xFF00) | (d);
    };
    
    SquareChannel.prototype.write_freq_hi = function (d) {
        this.frequency = (this.frequency & 0x00FF) | ((d & 0x07) << 8);
        this.lengthEnable = d & 0x40;

        // Sound frequency
        if (d & 0x80) {
            // TODO
        }
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
        return 0xBF | this.lengthEnable;
    };

    return SquareChannel;
});
