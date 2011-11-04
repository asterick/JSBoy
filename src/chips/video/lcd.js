// --- How the scanline buffer is encoded
var PRIORITY      = 0x80;
var WHITEOUT      = 0x40;
var SPRITE_FLAG   = 0x20;
var PALETTE       = 0x1C;
var PIXELS        = 0x03;
var COLOR         = PIXELS | WHITEOUT | PALETTE | SPRITE_FLAG;
var PALETTE_SHIFT = 2;

function jsboyLCD(context, palette)
{
    // --- Setup display
    context.fillStyle = 'white';
    context.fillRect( 0,0,160,144 );
    
    this.buffer = context.getImageData(0,0,160,144);    
    
    this.scanline = new Array(172);
    this.context = context;
    this.paletteMemory = palette;
}

jsboyLCD.prototype.update = function()
{
    this.context.putImageData(this.buffer, 0, 0);
}

jsboyLCD.prototype.clear = function()
{
    this.scanline.fill( WHITEOUT );
}

jsboyLCD.prototype.copyTileBG = function(x, l, h, pal, flip, pri)
{
    var px = (flip ? this.tileDecodeForward : this.tileDecodeReverse)[l|(h<<8)];
    var over = (pal << PALETTE_SHIFT) | (pri ? PRIORITY : 0);
    var scanline = this.scanline;
    var b = 8;
    
    while( b )
        scanline[x++] = px[--b] | over;
    
    return x;
}

jsboyLCD.prototype.copyTileOBJ = function(x, l, h, pal, flip, pri)
{
    var px = (flip ? this.tileDecodeForward : this.tileDecodeReverse)[l|(h<<8)];
    var over = (pal << PALETTE_SHIFT) | SPRITE_FLAG;
    var scanline = this.scanline;
     
    // Draw OAM when tile has priority 
    for( var b = 8; b; x++ )
    {
        var npx = px[--b], opx = scanline[x];
        // Sprite pixel is invisible ...
        // ... or higher priority sprite already exists
        if( !(npx & PIXELS) || (opx & SPRITE_FLAG) )
            continue;
        
        // Background tile does not have priority
        if( !((pri || (opx & PRIORITY)) && (opx & PIXELS)) )
            scanline[x] = npx | over;
    }
}

jsboyLCD.prototype.copyScanline = function( y )
{
    var palette = this.paletteMemory;
    var colorTable = this.colorTable;
    var scanline = this.scanline;
    
    var data = this.buffer.data;
    var o = y * 160 * 4;
    
    for( var b = 8; b < 168; b++ )
    {
        var px = colorTable[palette[scanline[b] & COLOR]];
        for( var i = 0; i < 3; i++ )
            data[o++] = px[i];
        o++;
    }
}

jsboyLCD.prototype.copyScanlineLegacy = function( y, bp, op0, op1 )
{
    var palette = this.paletteMemory;
    var colorTable = this.colorTable;
    var scanline = this.scanline;
    
    var data = this.buffer.data;
    var o = y * 160 * 4;
    
    // Similar to copy scanline, but this uses the old-style palette registers
    for( var b = 8; b < 168; b++, o++ )
    {
        var px = scanline[b];
        var c = ((px & PIXELS) << 1);
        
        if( px & SPRITE_FLAG )
        {
            if( px & PALETTE )
                c = ((op1 >> c) & 3) | SPRITE_FLAG;
            else
                c = ((op0 >> c) & 3) | SPRITE_FLAG;
        }
        else
        {
            c = (bp >> c) & 3;
        }
        
        var p = colorTable[palette[c]];
        for( var i = 0; i < 3; i++ )
            data[o++] = p[i];
    }
}

// --- Look up tables
jsboyLCD.prototype.tileDecodeForward = new Array(0x10000);
jsboyLCD.prototype.tileDecodeReverse = new Array(0x10000);
jsboyLCD.prototype.colorTable = new Array(0x10000);

// --- Initalization code
for( var i = 0; i < 0x10000; )
    for( var b = 0; b < 32; b ++ )
        for( var g = 0; g < 32; g ++ )
            for( var r = 0; r < 32; r ++ )
            {
                var vr = ((r * 13 + g * 2 + b) >> 1);
                var vg = (g * 3 + b) << 1
                var vb = (r * 3 + g * 2 + b * 11) >> 1;
                
                jsboyLCD.prototype.colorTable[i++] = [vr,vg,vb];
            }

// Generate tile decode buffer
for( var i = 0; i < 0x10000; i++ )
{
    var forward_tile = jsboyLCD.prototype.tileDecodeForward[i] = new Array(8);
    var reverse_tile = jsboyLCD.prototype.tileDecodeReverse[i] = new Array(8);

    var h = (i & 0xFF00) >> 7;
    var l = i & 0xFF;
        
    for( var b = 0; b < 8; b++ )
        forward_tile[7-b] = reverse_tile[b] = ((h >> b) & 2) | ((l >> b) & 1);
}
