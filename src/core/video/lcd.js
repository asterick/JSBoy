// --- How the scanline buffer is encoded
const PRIORITY      = 0x80;
const WHITEOUT      = 0x40;
const SPRITE_FLAG   = 0x20;
const PALETTE       = 0x1C;
const PIXELS        = 0x03;
const OPACITY       = 0xFF;
const PALETTE_SHIFT = 2;
const COLOR         = PIXELS | WHITEOUT | PALETTE | SPRITE_FLAG;

const colorTable = new Uint32Array(0x10000);
const tileDecodeForward = new Array(0x10000);
const tileDecodeReverse = new Array(0x10000);

function washout(c) {
    return c * 0xCF / 0x1F0 + 0x20;
}

// Palette
for (let i = 0; i < 0x10000;) {
    for (let b = 0; b < 32; b++) {
        for (let g = 0; g < 32; g++) {
            for (let r = 0; r < 32; r++) {
                colorTable[i++] = (OPACITY << 24) |
                    (washout(r * 13 + g *  2 + b *  1)) |
                    (washout(r *  0 + g * 12 + b *  4) << 8) |
                    (washout(r *  3 + g *  2 + b * 11) << 16);
            }
        }
    }
}

// Decode table
for (let i = 0; i < 0x10000; i++) {
    tileDecodeForward[i] = new Uint8Array(8);
    tileDecodeReverse[i] = new Uint8Array(8);

    let h = (i & 0xFF00) >> 7;
    let l = i & 0xFF;

    for (let b = 0; b < 8; b++) {
        tileDecodeForward[i][7-b] =
        tileDecodeReverse[i][b] = ((h >> b) & 2) | ((l >> b) & 1);
    }
}

export default class LCD {
    constructor (palette) {
        // --- Setup display
        this.scanline = new Uint8Array(172);
        this.paletteMemory = palette.paletteMemory;
    }

    setContext(ctx) {
        this.context = ctx;

        this.buffer = this.context.getImageData(0,0,160,144);
        this.bufferData = new Uint32Array(this.buffer.data.buffer);
    };

    update () {
        this.context.putImageData(this.buffer, 0, 0);
    };

    clear () {
        for (var i = 0; i < 172; i++) {
            this.scanline[i] = WHITEOUT;
        }
    };

    copyTileBG (x, l, h, pal, flip, pri) {
        var px = (flip ? tileDecodeForward : tileDecodeReverse)[l|(h<<8)],
            over = (pal << PALETTE_SHIFT) | (pri ? PRIORITY : 0),
            scanline = this.scanline,
            b = 8;

        while (b) {
            scanline[x++] = px[--b] | over;
        }

        return x;
    };

    copyTileOBJ (x, l, h, pal, flip, pri) {
        var px = (flip ? tileDecodeForward : tileDecodeReverse)[l|(h<<8)],
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

    copyScanline (y) {
        if (!this.bufferData) { return ; }

        var palette = this.paletteMemory,
            scanline = this.scanline,
            data = this.bufferData,
            o = y * 160;

        for (var b = 8; b < 168; b++) {
            data[o++] = colorTable[palette[scanline[b] & COLOR]];
        }
    };

    copyScanlineLegacy (y, bp, op0, op1) {
        if (!this.bufferData) { return ; }

        var palette = this.paletteMemory,
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
    }
}