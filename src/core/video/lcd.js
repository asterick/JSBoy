// --- How the scanline buffer is encoded
var PRIORITY      = 0x80,
    WHITEOUT      = 0x40,
    SPRITE_FLAG   = 0x20,
    PALETTE       = 0x1C,
    PIXELS        = 0x03,
    OPACITY       = 0xFF,
    PALETTE_SHIFT = 2,
    COLOR         = PIXELS | WHITEOUT | PALETTE | SPRITE_FLAG;

function LCD(palette) {
    // --- Setup display
    this.scanline = new Uint8Array(172);
    this.paletteMemory = palette.paletteMemory;
}

(function (that) {
    var i, b, g, r;

    that.colorTable = new Uint32Array(0x10000);
    that.tileDecodeForward = new Array(0x10000);
    that.tileDecodeReverse = new Array(0x10000);

    function washout(c) {
        return c * 0xCF / 0x1F0 + 0x20;
    }

    // Palette
    for (i = 0; i < 0x10000;) {
        for (b = 0; b < 32; b++) {
            for (g = 0; g < 32; g++) {
                for (r = 0; r < 32; r++) {
                    that.colorTable[i++] = (OPACITY << 24) |
                        (washout(r * 13 + g *  2 + b *  1)) |
                        (washout(r *  0 + g * 12 + b *  4) << 8) |
                        (washout(r *  3 + g *  2 + b * 11) << 16);
                }
            }
        }
    }

    // Decode table
    for (i = 0; i < 0x10000; i++) {
        that.tileDecodeForward[i] = new Uint8Array(8);
        that.tileDecodeReverse[i] = new Uint8Array(8);

        var h = (i & 0xFF00) >> 7;
        var l = i & 0xFF;

        for (b = 0; b < 8; b++) {
            that.tileDecodeForward[i][7-b] =
            that.tileDecodeReverse[i][b] = ((h >> b) & 2) | ((l >> b) & 1);
        }
    }
})(LCD.prototype);

LCD.prototype.setContext = function(ctx) {
    this.context = ctx;

    this.buffer = this.context.getImageData(0,0,160,144);
    this.bufferData = new Uint32Array(this.buffer.data.buffer);
};

LCD.prototype.update = function () {
    this.context.putImageData(this.buffer, 0, 0);
};

LCD.prototype.clear = function () {
    for (var i = 0; i < 172; i++) {
        this.scanline[i] = WHITEOUT;
    }
};

LCD.prototype.copyTileBG = function (x, l, h, pal, flip, pri) {
    var px = (flip ? this.tileDecodeForward : this.tileDecodeReverse)[l|(h<<8)],
        over = (pal << PALETTE_SHIFT) | (pri ? PRIORITY : 0),
        scanline = this.scanline,
        b = 8;

    while (b) {
        scanline[x++] = px[--b] | over;
    }

    return x;
};

LCD.prototype.copyTileOBJ = function (x, l, h, pal, flip, pri) {
    var px = (flip ? this.tileDecodeForward : this.tileDecodeReverse)[l|(h<<8)],
        over = (pal << PALETTE_SHIFT) | SPRITE_FLAG,
        scanline = this.scanline;

    // Draw OAM when tile has priority
    for (var b = 8; b; x++)
    {
        var npx = px[--b], opx = scanline[x];

        // Sprite pixel is invisible ...
        // ... or higher priority sprite already exists
        if(!(npx & PIXELS) || (opx & SPRITE_FLAG)) {
            continue;
        }

        // Background tile does not have priority
        if(!((pri || (opx & PRIORITY)) && (opx & PIXELS))) {
            scanline[x] = npx | over;
        }
    }
};

LCD.prototype.copyScanline = function (y) {
    if (!this.bufferData) { return ; }

    var palette = this.paletteMemory,
        colorTable = this.colorTable,
        scanline = this.scanline,
        data = this.bufferData,
        o = y * 160;

    for (var b = 8; b < 168; b++) {
        data[o++] = colorTable[palette[scanline[b] & COLOR]];
    }
};

LCD.prototype.copyScanlineLegacy = function (y, bp, op0, op1) {
    if (!this.bufferData) { return ; }

    var palette = this.paletteMemory,
        colorTable = this.colorTable,
        scanline = this.scanline,
        data = this.bufferData,
        o = y * 160;

    // Similar to copy scanline, but this uses the old-style palette registers
    for (var b = 8; b < 168; b++) {
        var px = scanline[b];
        var c = ((px & PIXELS) << 1);

        if( px & SPRITE_FLAG ) {
            if (px & PALETTE) {
                c = ((op1 >> c) & 3) | SPRITE_FLAG;
            } else {
                c = ((op0 >> c) & 3) | SPRITE_FLAG;
            }
        } else {
            c = (bp >> c) & 3;
        }

        data[o++] = colorTable[palette[c]];
    }
};

module.exports = LCD;
