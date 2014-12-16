var CPU = require("./chips/core"),
    mapper = require("./mappers/mapper");

function jsboy() {
    // Bios will auto reset when the system initializes
    this.cpu = new CPU();

    var running = false;
    Object.defineProperty(jsboy.prototype, 'running', {
        get: function () {
            return running;
        },
        set: function (state) {
            if (running === state) { return ; }

            var lastTime = Date.now(),
                fraction = 0,
                self = this;

            running = state;
            if (running) {
                 var nextFrame = function () {
                    if (!running) { return ; }

                    var nextTime = Date.now(),
                        ticks = nextTime - lastTime,
                        advance = Math.min(300000, ticks * 8388.608 + fraction),
                        cycles = Math.floor(advance);

                    fraction = advance - cycles;
                    lastTime = nextTime;

                    window.requestAnimationFrame(nextFrame);
                    self.cpu.step(cycles);
                    self.updateUI();
                };

                window.requestAnimationFrame(nextFrame);
                this.cpu.audio.play();
            } else {
                this.cpu.audio.mute();
            }
        }
    });
}

jsboy.prototype.updateUI = function () {};

jsboy.prototype.setContext = function (ctx) {
    this.cpu.setContext(ctx);
};

jsboy.prototype.reset = function( name, data ) {
    if (data) {
        this.cpu.close();
        this.cpu.insert(mapper(name, this.cpu, data));
    } else {
        this.cpu.reset();
    }
};

jsboy.prototype.close = function () {
    this.cpu.close();
};

jsboy.prototype.singleStep = function () {
    this.cpu.singleStep();
    this.updateUI();
};

module.exports = jsboy;
