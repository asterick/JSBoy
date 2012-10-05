define([
    'chips/cpu',
    'mappers/mapper'
], function (CPU, mapper) {
    function jsboy(context) {
        // Bios will auto reset when the system initializes
        this.cpu = new CPU(context);

        var running = false;
        Object.defineProperty(jsboy.prototype, 'running', {
            get: function () {
                return running;
            },
            set: function (state) {
                if (running === state) { return ; }

                var requestAnimationFrame = window.requestAnimationFrame ||
                                            window.mozRequestAnimationFrame ||
                                            window.webkitRequestAnimationFrame ||
                                            window.msRequestAnimationFrame,
                    lastTime = (new Date()).getTime(),
                    fraction = 0,
                    self = this;

                if (running = state) {
                     function nextFrame() {
                        if (!running) { return ; }

                        var nextTime = (new Date()).getTime(),
                            ticks = nextTime - lastTime,
                            advance = Math.min(300000, ticks * 8388.608 + fraction),
                            cycles = Math.floor(advance);

                        fraction = advance - cycles;
                        lastTime = nextTime;

                        requestAnimationFrame(nextFrame);
                        self.cpu.step(cycles);
                    };

                    requestAnimationFrame(nextFrame);
                    this.cpu.audio.play();
                } else {
                    this.cpu.audio.mute();
                }
            }
        });
    }

    jsboy.prototype.reset = function( name, data ) {
        if (data) {
            this.cpu.insert(mapper(name, this.cpu, data));
        } else {
            this.cpu.reset();
        }
    }

    jsboy.prototype.close = function () {
        this.cpu.close();
    }

    jsboy.prototype.singleStep = function () {
        this.cpu.singleStep();
    }

    return jsboy;
});
