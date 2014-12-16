/***
 *  JSBoy Memory block helper functions
 */
function romBlock(data, length) {
    var newData = new Array(length || data.length);

    newData.copy(0, data);
    newData.fill(0xFF, data.length);

    return newData.map(function (d) {
        return romBlock.delegates[d];
    }).chunk(0x100);
}

romBlock.delegates = new Array(0x100);

for(var i = 0; i < 0x100; i++) {
    romBlock.delegates[i] = new Function("return " + i);
}

function ramBlock(size, extend, name, mask) {
    if(!size) return null;

    var read = new Array(extend);
    var write = new Array(extend);
    var data = new Uint8Array(size);
    var delegate;

    if(mask && 0xFF & ~mask) {
        delegate = function (index) {
            data[index] = 0;
            read[index] = function () {
                return data[index];
            };
            write[index] = function (value) {
                data[index] = value & mask;
            };
        };
    } else {
        delegate = function (index) {
            data[index] = 0;
            read[index] = function () {
                return data[index];
            };
            write[index] = function (value) {
                data[index] = value;
            };
        };
    }

    for(var i = 0; i < size; i++) {
        delegate(i);
    }

    for(i = size; i < extend; i++) {
        read[i] = read[i % size];
        write[i] = write[i % size];
    }

    var save = function () {
        var encoded = "";

        for(var i = 0; i < data.length; i++) {
            encoded += String.fromCharCode(data[i]);
        }

        window.localStorage.setItem(name, encoded);
    };

    var load = function () {
        var encoded = window.localStorage.getItem(name);

        if(!encoded) {
            return;
        }

        encoded.split('').map(function (c, idx) {
            data[idx] = c.charCodeAt(0);
        });
    };

    return {
        readChunks: read.chunk(0x100),
        writeChunks: write.chunk(0x100),
        read: read,
        write: write,
        data: data,
        save: save,
        load: load
    };
}

module.exports = {
    romBlock: romBlock,
    ramBlock: ramBlock
};
