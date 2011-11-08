// --- Create the keyboard event framework
var KEYBOARD_BACKSPACE = 8;
var KEYBOARD_TAB = 9;
var KEYBOARD_ENTER = 13;
var KEYBOARD_SHIFT = 16;
var KEYBOARD_CTRL = 17;
var KEYBOARD_ALT = 18;
var KEYBOARD_PAUSE = 19;
var KEYBOARD_CAPS_LOCK = 20;
var KEYBOARD_ESCAPE = 27;
var KEYBOARD_PAGE_UP = 33;
var KEYBOARD_PAGE_DOWN = 34;
var KEYBOARD_END = 35;
var KEYBOARD_HOME = 36;
var KEYBOARD_LEFT_ARROW = 37;
var KEYBOARD_UP_ARROW = 38;
var KEYBOARD_RIGHT_ARROW = 39;
var KEYBOARD_DOWN_ARROW = 40;
var KEYBOARD_INSERT = 45;
var KEYBOARD_DELETE = 46;
var KEYBOARD_0 = 48;
var KEYBOARD_1 = 49;
var KEYBOARD_2 = 50;
var KEYBOARD_3 = 51;
var KEYBOARD_4 = 52;
var KEYBOARD_5 = 53;
var KEYBOARD_6 = 54;
var KEYBOARD_7 = 55;
var KEYBOARD_8 = 56;
var KEYBOARD_9 = 57;
var KEYBOARD_A = 65;
var KEYBOARD_B = 66;
var KEYBOARD_C = 67;
var KEYBOARD_D = 68;
var KEYBOARD_E = 69;
var KEYBOARD_F = 70;
var KEYBOARD_G = 71;
var KEYBOARD_H = 72;
var KEYBOARD_I = 73;
var KEYBOARD_J = 74;
var KEYBOARD_K = 75;
var KEYBOARD_L = 76;
var KEYBOARD_M = 77;
var KEYBOARD_N = 78;
var KEYBOARD_O = 79;
var KEYBOARD_P = 80;
var KEYBOARD_Q = 81;
var KEYBOARD_R = 82;
var KEYBOARD_S = 83;
var KEYBOARD_T = 84;
var KEYBOARD_U = 85;
var KEYBOARD_V = 86;
var KEYBOARD_W = 87;
var KEYBOARD_X = 88;
var KEYBOARD_Y = 89;
var KEYBOARD_Z = 90;
var KEYBOARD_LEFT_WINDOW_KEY = 91;
var KEYBOARD_RIGHT_WINDOW_KEY = 92;
var KEYBOARD_SELECT_KEY = 93;
var KEYBOARD_NUMPAD_0 = 96;
var KEYBOARD_NUMPAD_1 = 97;
var KEYBOARD_NUMPAD_2 = 98;
var KEYBOARD_NUMPAD_3 = 99;
var KEYBOARD_NUMPAD_4 = 100;
var KEYBOARD_NUMPAD_5 = 101;
var KEYBOARD_NUMPAD_6 = 102;
var KEYBOARD_NUMPAD_7 = 103;
var KEYBOARD_NUMPAD_8 = 104;
var KEYBOARD_NUMPAD_9 = 105;
var KEYBOARD_MULTIPLY = 106;
var KEYBOARD_ADD = 107;
var KEYBOARD_SUBTRACT = 109;
var KEYBOARD_DECIMAL_POINT = 110;
var KEYBOARD_DIVIDE = 111;
var KEYBOARD_F1 = 112;
var KEYBOARD_F2 = 113;
var KEYBOARD_F3 = 114;
var KEYBOARD_F4 = 115;
var KEYBOARD_F5 = 116;
var KEYBOARD_F6 = 117;
var KEYBOARD_F7 = 118;
var KEYBOARD_F8 = 119;
var KEYBOARD_F9 = 120;
var KEYBOARD_F10 = 121;
var KEYBOARD_F11 = 122;
var KEYBOARD_F12 = 123;
var KEYBOARD_NUM_LOCK = 144;
var KEYBOARD_SCROLL_LOCK = 145;
var KEYBOARD_SEMICOLON = 186;
var KEYBOARD_EQUAL_SIGN = 187;
var KEYBOARD_COMMA = 188;
var KEYBOARD_DASH = 189;
var KEYBOARD_PERIOD = 190;
var KEYBOARD_FORWARD_SLASH = 191;
var KEYBOARD_GRAVE_ACCENT = 192;
var KEYBOARD_OPEN_BRACKET = 219;
var KEYBOARD_BACK_SLASH = 220;
var KEYBOARD_CLOSE_BRAKET = 221;
var KEYBOARD_SINGLE_QUOTE = 222;

Object.prototype.$ = function( name )
{
    var self = this;
    var call = this[name];
    return function() { return call.apply(self,arguments); }
}

Object.prototype.addProperty = function(label, getter, setter)
{
    if (Object.defineProperty) {
        Object.defineProperty( this, label,
            {
                get: getter,
                set: setter
            } );
    }
    else 
    {
        if (getter) 
        {
            this.__defineGetter__(label, getter);
        }
        if (setter)
        {
            this.__defineSetter__(label, setter);
        }
    }
}

// --- Append a source tag to the body
var includesPending = 0;
function include(source)
{
    var base = document.getElementsByTagName('head').item(0);
    var script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = source;
    script.charset = 'utf-8';
    base.appendChild(script);
    includesPending++;

    script.onload = function () {
        if( !--includesPending )
            start();
    }
}

function log( /*...*/ )
{
    var logContainer = document.getElementById('messageLog');

    if( !logContainer )
    {
        logContainer = document.createElement('div');
        logContainer.setAttribute("id","messageLog");
        document.getElementsByTagName('body').item(0).appendChild(logContainer);
    }
    
    var msg = document.createElement('div');
    
    for( var i = 0; i < arguments.length; i++ )
    {
        var elem = document.createElement('span');
        elem.setAttribute('class',typeof(arguments[i]));
        elem.innerHTML = JSON.stringify(arguments[i]);
        msg.appendChild(elem);
    }

    logContainer.appendChild(msg);
    logContainer.scrollTop = logContainer.scrollHeight;
}
