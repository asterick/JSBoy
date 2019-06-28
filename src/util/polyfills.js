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
