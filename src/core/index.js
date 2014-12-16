var CPU = require("./core"),
    mapper = require("./mappers/mapper");

class JSBoy {
    constructor() {
        // Bios will auto reset when the system initializes
        this.cpu = new CPU();
        this.running = false;
    }

    setContext (ctx) {
        this.cpu.setContext(ctx);
    }

    reset ( name, data ) {
        if (data) {
            this.cpu.close();
            this.cpu.insert(mapper(name, this.cpu, data));
        } else {
            this.cpu.reset();
        }
    }

    close () {
        this.cpu.close();
    }

    singleStep () {
        this.cpu.singleStep();
    }
}

// Not supported by the ES6 transform in react tools
Object.defineProperty(JSBoy.prototype, 'running', {
    get: function () {
        return this._running;
    },

    set: function (state) {
        if (this._running === state) { return ; }

        var lastTime = Date.now(),
            fraction = 0,
            self = this;

        this._running = state;
        if (this._running) {
             var nextFrame = function () {
                if (!self._running) { return ; }

                var nextTime = Date.now(),
                    ticks = nextTime - lastTime,
                    advance = Math.min(300000, ticks * 8388.608 + fraction),
                    cycles = Math.floor(advance);

                fraction = advance - cycles;
                lastTime = nextTime;

                window.requestAnimationFrame(nextFrame);
                self.cpu.step(cycles);
            };

            window.requestAnimationFrame(nextFrame);
            this.cpu.audio.play();
        } else {
            this.cpu.audio.mute();
        }
    }
});

module.exports = JSBoy;
