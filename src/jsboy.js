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
        if (data !== undefined) {
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
        if (state == this.running ) {
            return ;
        }
    
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.running = state;

        if (this.running) {
            this.interval = setInterval( this.$('step'), 16 );
        }
    }

    jsboy.prototype.step = function () {
        this.cpu.step();
        this.cpu.update();
    }

    jsboy.prototype.singleStep = function () {
        this.cpu.singleStep();
        this.cpu.update();
    }

    return jsboy;
});
