// --- Create the keyboard event framework
const KEYBOARD_BACKSPACE = 8;
const KEYBOARD_TAB = 9;
const KEYBOARD_ENTER = 13;
const KEYBOARD_SHIFT = 16;
const KEYBOARD_CTRL = 17;
const KEYBOARD_ALT = 18;
const KEYBOARD_PAUSE = 19;
const KEYBOARD_CAPS_LOCK = 20;
const KEYBOARD_ESCAPE = 27;
const KEYBOARD_PAGE_UP = 33;
const KEYBOARD_PAGE_DOWN = 34;
const KEYBOARD_END = 35;
const KEYBOARD_HOME = 36;
const KEYBOARD_LEFT_ARROW = 37;
const KEYBOARD_UP_ARROW = 38;
const KEYBOARD_RIGHT_ARROW = 39;
const KEYBOARD_DOWN_ARROW = 40;
const KEYBOARD_INSERT = 45;
const KEYBOARD_DELETE = 46;
const KEYBOARD_0 = 48;
const KEYBOARD_1 = 49;
const KEYBOARD_2 = 50;
const KEYBOARD_3 = 51;
const KEYBOARD_4 = 52;
const KEYBOARD_5 = 53;
const KEYBOARD_6 = 54;
const KEYBOARD_7 = 55;
const KEYBOARD_8 = 56;
const KEYBOARD_9 = 57;
const KEYBOARD_A = 65;
const KEYBOARD_B = 66;
const KEYBOARD_C = 67;
const KEYBOARD_D = 68;
const KEYBOARD_E = 69;
const KEYBOARD_F = 70;
const KEYBOARD_G = 71;
const KEYBOARD_H = 72;
const KEYBOARD_I = 73;
const KEYBOARD_J = 74;
const KEYBOARD_K = 75;
const KEYBOARD_L = 76;
const KEYBOARD_M = 77;
const KEYBOARD_N = 78;
const KEYBOARD_O = 79;
const KEYBOARD_P = 80;
const KEYBOARD_Q = 81;
const KEYBOARD_R = 82;
const KEYBOARD_S = 83;
const KEYBOARD_T = 84;
const KEYBOARD_U = 85;
const KEYBOARD_V = 86;
const KEYBOARD_W = 87;
const KEYBOARD_X = 88;
const KEYBOARD_Y = 89;
const KEYBOARD_Z = 90;
const KEYBOARD_LEFT_WINDOW_KEY = 91;
const KEYBOARD_RIGHT_WINDOW_KEY = 92;
const KEYBOARD_SELECT_KEY = 93;
const KEYBOARD_NUMPAD_0 = 96;
const KEYBOARD_NUMPAD_1 = 97;
const KEYBOARD_NUMPAD_2 = 98;
const KEYBOARD_NUMPAD_3 = 99;
const KEYBOARD_NUMPAD_4 = 100;
const KEYBOARD_NUMPAD_5 = 101;
const KEYBOARD_NUMPAD_6 = 102;
const KEYBOARD_NUMPAD_7 = 103;
const KEYBOARD_NUMPAD_8 = 104;
const KEYBOARD_NUMPAD_9 = 105;
const KEYBOARD_MULTIPLY = 106;
const KEYBOARD_ADD = 107;
const KEYBOARD_SUBTRACT = 109;
const KEYBOARD_DECIMAL_POINT = 110;
const KEYBOARD_DIVIDE = 111;
const KEYBOARD_F1 = 112;
const KEYBOARD_F2 = 113;
const KEYBOARD_F3 = 114;
const KEYBOARD_F4 = 115;
const KEYBOARD_F5 = 116;
const KEYBOARD_F6 = 117;
const KEYBOARD_F7 = 118;
const KEYBOARD_F8 = 119;
const KEYBOARD_F9 = 120;
const KEYBOARD_F10 = 121;
const KEYBOARD_F11 = 122;
const KEYBOARD_F12 = 123;
const KEYBOARD_NUM_LOCK = 144;
const KEYBOARD_SCROLL_LOCK = 145;
const KEYBOARD_SEMICOLON = 186;
const KEYBOARD_EQUAL_SIGN = 187;
const KEYBOARD_COMMA = 188;
const KEYBOARD_DASH = 189;
const KEYBOARD_PERIOD = 190;
const KEYBOARD_FORWARD_SLASH = 191;
const KEYBOARD_GRAVE_ACCENT = 192;
const KEYBOARD_OPEN_BRACKET = 219;
const KEYBOARD_BACK_SLASH = 220;
const KEYBOARD_CLOSE_BRAKET = 221;
const KEYBOARD_SINGLE_QUOTE = 222;

Object.prototype.$ = function( name )
{
    var self = this;
    var call = this[name];
    return function() { return call.apply(self,arguments); }
}

// --- Append a source tag to the body
var includesPending = 0;
function include(source)
{
    const base = document.getElementsByTagName('head').item(0);
    const script = document.createElement('script');

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
