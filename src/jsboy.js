define([
    'chips/cpu',
    'mappers/mapper'
], function (CPU, mapper) {
    function jsboy(context) {
        // Bios will auto reset when the system initializes
        this.cpu = new CPU(context);

        var running = false;
        Object.defineProperty(this, 'running', {
            get: function () {
                return running;
            },
            set: function (state) {
                if (this.running === state) { return ; }

                if (running = state) {
                    var requestAnimationFrame = window.requestAnimationFrame ||
                                                window.mozRequestAnimationFrame ||
                                                window.webkitRequestAnimationFrame ||
                                                window.msRequestAnimationFrame,
                        self = this,
                        nextFrame = function () {
                            self.step();
                            if (running) { requestAnimationFrame(nextFrame); }
                        };

                    requestAnimationFrame(nextFrame);
                }
            }
        });
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

    jsboy.prototype.step = function () {
        this.cpu.step();
    }

    jsboy.prototype.singleStep = function () {
        this.cpu.singleStep();
    }

    return jsboy;
});
