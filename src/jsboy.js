define([
    'chips/cpu',
    'mappers/mapper'
], function (CPU, mapper) {
    function jsboy(context) {
        // Bios will auto reset when the system initializes
        this.cpu = new CPU(context);
        this.running = false;
    }

    jsboy.prototype.reset = function( name, data ) {
        if (data) {
            this.cpu.close();
            this.cpu.insert(mapper(name, this.cpu, data));
        } else {
            this.cpu.reset();
        }
    }

    jsboy.prototype.close = function () {
        this.cpu.close();
    }

    jsboy.prototype.run = function (state) {
        if (this.running === state) { return ; }

        this.running = state;

        if (this.running) {
            var requestAnimationFrame = window.requestAnimationFrame ||
                                        window.mozRequestAnimationFrame ||
                                        window.webkitRequestAnimationFrame ||
                                        window.msRequestAnimationFrame,
                self = this,
                nextFrame = function () {
                    if (self.step()) { requestAnimationFrame(nextFrame); }
                };

            requestAnimationFrame(nextFrame);
        }
    }

    jsboy.prototype.step = function () {
        this.cpu.step();

        return this.running;
    }

    jsboy.prototype.singleStep = function () {
        this.cpu.singleStep();
    }

    return jsboy;
});
