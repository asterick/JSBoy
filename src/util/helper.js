// These are global constants that need to be refactored into the requirejs
var IRQ_VBLANK = 1;
var IRQ_LCD_STAT = 2;
var IRQ_TIMER = 4;
var IRQ_SERIAL = 8;
var IRQ_JOYSTICK = 16;

var NONE = 0;
var RAM = 1;
var BATTERY = 2;
var TIMER = 4;
var RUMBLE = 8;

Object.prototype.$ = function (name) {
    var self = this,
        call = this[name];

    return function () { return call.apply(self,arguments); }
};

function log (/*...*/) {
    console.log.apply(console, arguments);
}
