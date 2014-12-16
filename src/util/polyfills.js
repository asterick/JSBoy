var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
                                  window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target, firstSource) {
            "use strict";
            if (target === undefined || target === null)
                throw new TypeError("Cannot convert first argument to object");
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) continue;
                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                }
            }
            return to;
        }
    });
}

// THIS IS CRAP THAT NEEDS TO BE FACTORED OUT
Array.prototype.chunk = function (stride) {
    var chunks = [];

    for(var i = 0; i < this.length; i += stride) {
        chunks.push(this.slice(i, i + stride));
    }

    return chunks;
};

Array.prototype.fill = function (value, pos, length) {
    if(pos === undefined) { pos = 0; }
    if(length === undefined) { length = this.length; }

    while(length-- > 0 && pos < this.length) {
        this[pos++] = value;
    }

    return this;
};

Array.prototype.copy = function (dest_pos, source, source_pos, length) {
    if(source_pos === undefined) { source_pos = 0; }

    if(length === undefined) { length = source.length; }

    while(length-- > 0 && source_pos < source.length) {
        this[dest_pos++] = source[source_pos++];
    }

    return this;
};
