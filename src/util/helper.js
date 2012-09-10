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
    var logContainer = document.getElementById('messageLog');

    if (!logContainer) {
        logContainer = document.createElement('div');
        logContainer.setAttribute("id","messageLog");
        document.getElementsByTagName('body').item(0).appendChild(logContainer);
    }
    
    var msg = document.createElement('div');
    
    for (var i = 0; i < arguments.length; i++) {
        var elem = document.createElement('span');
        elem.setAttribute('class',typeof(arguments[i]));
        elem.innerHTML = JSON.stringify(arguments[i]);
        msg.appendChild(elem);
    }

    logContainer.appendChild(msg);
    logContainer.scrollTop = logContainer.scrollHeight;
}
