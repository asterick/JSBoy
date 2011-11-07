include('src/chips/video/lcd.js');
include('src/chips/video/dma.js');
include('src/chips/video/palette.js');

// These clocks are in GBC machine instruction cycles (Double speed)
// IE: 4MHZ / 4 * 2

var SCANLINES      = 154;
var DRAWLINES      = 144;
var MODE_0_TIME    = 102;
var MODE_2_TIME    = 40;
var MODE_3_TIME    = 86;
var TICKS_PER_LINE = MODE_0_TIME + MODE_2_TIME + MODE_3_TIME;
var DRAW_PHASE     = DRAWLINES * TICKS_PER_LINE;
var TICKS_PER_FRAME = SCANLINES * TICKS_PER_LINE;

function jsboyGPU(context, cpu)
{    
    // --- System registers    
    this.videoMemory = ramBlock(0x4000);
    this.oamMemory = ramBlock(0xA0);
    this.palette = new jsboyPalette(cpu);
    this.lcd = new jsboyLCD(context, this.palette.wordMemory);
    this.dma = new jsboyDMA(cpu);
    this.cpu = cpu;

    // Video registers
    this.vbk = 0;
    this.lyc = 0;
    this.pixelClock = 0;

    this.scx = 0;
    this.scy = 0;
    this.wx = 0;
    this.wy = 0;

    this.lcd_enable = false;
    this.window_map = false;
    this.background_map = false;
    this.window_enable = false;
    this.map_tile_data = false;
    this.obj_size = false;
    this.obj_enable = false;
    this.bg_display = false;

    this.lycIRQ = false;
    this.mode2IRQ = false;
    this.mode1IRQ = false;
    this.mode0IRQ = false;

    // Keep a preallocated array of sprite indexes, will be sorted in legacy
    // scanlines
    this.legacySpriteOrder = new Array(40);
    for( var i = 0; i < 40; i++ )
        this.legacySpriteOrder[i] = (i << 2);
}

jsboyGPU.prototype.reset = function()
{
    // Clear the scanline override
    delete this.drawScanline;

    this.dma.reset();
    this.palette.reset();
    
    this.lyc = 0;
    this.pixelClock = 0;

    this.scx = 0;
    this.scy = 0;
    this.wx = 0;
    this.wy = 0;

    this.lcd_enable = false;
    this.window_map = false;
    this.background_map = false;
    this.window_enable = false;
    this.map_tile_data = false;
    this.obj_size = false;
    this.obj_enable = false;
    this.bg_display = false;

    this.lycIRQ = false;
    this.mode2IRQ = false;
    this.mode1IRQ = false;
    this.mode0IRQ = false;

    this.write_VBK(0);
    
    for( var i = 0; i < 0xA0; i++ )
    {
        this.cpu.read[0xFE00 | i] = this.oamMemory.read[i];
        this.cpu.write[0xFE00 | i] = this.oamMemory.write[i];
    }
    
    this.cpu.write[REG_DMA] = this.$('write_DMA');
    
    this.cpu.read[REG_LCDC] = this.$('read_LCDC');
    this.cpu.write[REG_LCDC] = this.$('write_LCDC');
    this.cpu.read[REG_STAT] = this.$('read_STAT');
    this.cpu.write[REG_STAT] = this.$('write_STAT');

    this.cpu.read[REG_SCX] = this.$('read_SCX');
    this.cpu.write[REG_SCX] = this.$('write_SCX');
    this.cpu.read[REG_SCY] = this.$('read_SCY');
    this.cpu.write[REG_SCY] = this.$('write_SCY');
    this.cpu.read[REG_WX] = this.$('read_WX');
    this.cpu.write[REG_WX] = this.$('write_WX');
    this.cpu.read[REG_WY] = this.$('read_WY');
    this.cpu.write[REG_WY] = this.$('write_WY');
    
    this.cpu.read[REG_LY] = this.$('read_LY');
    this.cpu.read[REG_LYC] = this.$('read_LYC');
    this.cpu.write[REG_LYC] = this.$('write_LYC');
    
    this.cpu.read[REG_VBK] = this.$('read_VBK');
    this.cpu.write[REG_VBK] = this.$('write_VBK');
    
    this.cpu.write[REG_LCD_MODE] = this.$('write_LCD_MODE');
}

jsboyGPU.prototype.drawMapTile = function(mapAddr, tpx, tpy)
{
    var attr = this.videoMemory.data[mapAddr | 0x2000];
    var tile = this.videoMemory.data[mapAddr] << 4;

    var pal = attr & 7;
    var bank = (attr & 8) ? 0x2000 : 0x0000;
    var hflip = attr & 32;
    var vflip = attr & 64;
    var priority = this.bg_display && (attr & 128);

    var tileAddr = bank | (((vflip ? ~tpy : tpy) & 7) << 1);

    if( !this.map_tile_data && !(tile & 0x800) )
        tileAddr += 0x1000 + tile;
    else
        tileAddr += tile;

    this.lcd.copyTileBG( tpx, this.videoMemory.data[tileAddr], this.videoMemory.data[tileAddr+1], pal, hflip, priority );
}

jsboyGPU.prototype.drawLegacyMapTile = function(mapAddr, tpx, tpy)
{
    var tile = this.videoMemory.data[mapAddr] << 4;    

    var tileAddr = (tpy & 7) << 1;

    if( !this.map_tile_data && !(tile & 0x800) )
        tileAddr += 0x1000 + tile;
    else
        tileAddr += tile;

    this.lcd.copyTileBG( tpx, this.videoMemory.data[tileAddr], this.videoMemory.data[tileAddr+1], 0, false, false );
}

jsboyGPU.prototype.drawScanline = function(line)
{
    if( !this.lcd_enable )
        return ;

    // Locate the base line for the tile map
    var mapLine = this.scy + line;
    var mapAddr = (this.background_map ? 0x1C00 : 0x1800) | (((mapLine & 0xFF) >> 3) << 5);
    var tpx = 8-(this.scx & 7);
    var tx  = this.scx >> 3;    

    for( ; tpx < 168; tpx += 8, tx++ )
        this.drawMapTile( mapAddr | (tx & 0x1F), tpx, mapLine );

    // Draw the window when it's enabled
    mapLine = line - this.wy;
    if( this.window_enable && mapLine >= 0 )
    {
        mapAddr = (this.window_map ? 0x1C00 : 0x1800) | (((mapLine & 0xFF) >> 3) << 5);
        tpx = this.wx + 1;
        tx = 0;
        
        for( ; tpx < 168; tpx += 8, tx++ )
            this.drawMapTile( mapAddr | (tx & 0x1F), tpx, mapLine );        
    }

    if( this.obj_enable )
    {
        var sprites = 0;
        var spriteBound = this.obj_size ? 15 : 7;
        
        var oam = this.oamMemory.data;
        for( var i = 0; i < 0xA0 && sprites < 10; i += 4 )
        {
            var y = line + 16 - oam[i];
            
            if( y < 0 || y > spriteBound )
                continue;
            
            sprites++;
            
            var x = oam[i+1];
            var tile = oam[i+2];
            var attr = oam[i+3];
            
            var priority = this.bg_display && (attr & 128);
            var yflip = attr & 64;
            var hflip = attr & 32;
            var bank = (attr & 8) ? 0x2000 : 0x0000;
            var pal = attr & 7;
            
            tpy = yflip ? (y ^ spriteBound) : (y);

            var tileAddr = bank | (tpy << 1) | (tile << 4);
                    
            this.lcd.copyTileOBJ( x, this.videoMemory.data[tileAddr], this.videoMemory.data[tileAddr+1], pal, hflip, priority )
        }
    }

    this.lcd.copyScanline(line);
}

jsboyGPU.prototype.drawLegacyScanline = function(line)
{
    // White out the line
    if( !this.lcd_enable )
    {
        this.lcd.clear();
        this.lcd.copyScanline(line);
        return ;
    }
   
    // Locate the base line for the tile map
    if( this.bg_display )
    {
        var mapLine = this.scy + line;
        var mapAddr = (this.background_map ? 0x1C00 : 0x1800) | (((mapLine & 0xFF) >> 3) << 5);
        var tpx = 8-(this.scx & 7);
        var tx  = this.scx >> 3;    

        for( ; tpx < 168; tpx += 8, tx++ )
            this.drawLegacyMapTile( mapAddr | (tx & 0x1F), tpx, mapLine );
    }
    else
    {
        this.lcd.clear();        
    }

    // Draw the window when it's enabled
    var mapLine = line - this.wy;
    if( this.window_enable && mapLine >= 0 )
    {    
        var mapAddr = (this.window_map ? 0x1C00 : 0x1800) | (((mapLine & 0xFF) >> 3) << 5);
        var tpx = this.wx + 1;
        var tx = 0;
        
        for( ; tpx < 168; tpx += 8, tx++ )
            this.drawLegacyMapTile( mapAddr | (tx & 0x1F), tpx, mapLine );        
    }

    var oam = this.oamMemory.data;
    if( this.obj_enable )
    {
        // Sort sprite index list based on their X coordinate
        var order = this.legacySpriteOrder;
        order.sort( function(a,b) {
            var ax = oam[a+1];
            var bx = oam[b+1];
            return ax - bx;
        } );
    
        var sprites = 0;
        var spriteBound = this.obj_size ? 15 : 7;
        
        for( var s = 0; s < 40 && sprites < 10; s ++ )
        {
            // Use the X sorted sprite array
            var i = order[s];
            
            var y = line + 16 - oam[i];
            
            if( y < 0 || y > spriteBound )
                continue;
            
            sprites++;
            
            var x = oam[i+1];
            var tile = oam[i+2];
            var attr = oam[i+3];
            
            var priority = attr & 128;
            var yflip = attr & 64;
            var hflip = attr & 32;
            var pal = attr & 16;
            
            tpy = yflip ? (y ^ spriteBound) : (y);

            var tileAddr = (tpy << 1) | (tile << 4);
                    
            this.lcd.copyTileOBJ( x, this.videoMemory.data[tileAddr], this.videoMemory.data[tileAddr+1], pal, hflip, priority );
        }
    }

    this.lcd.copyScanlineLegacy(line,
                          this.palette.reg_BGP,
                          this.palette.reg_OBP0,
                          this.palette.reg_OBP1);
}

jsboyGPU.prototype.predictEndOfFrame = function()
{
    return TICKS_PER_FRAME - this.pixelClock;
}

jsboyGPU.prototype.predict = function()
{
    var time = null;
 
    function min( a )
    {
        if( a !== null && a < time )
            time = a;
    }
 
    var phase = this.pixelClock % TICKS_PER_LINE;

    // LCD-Stat registers
    if( this.mode2IRQ )
        min( this.timeUntilDrawClock(0, phase) );
    if( this.mode0IRQ )
        min( this.timeUntilDrawClock(MODE_2_TIME + MODE_3_TIME, phase) );
    if( this.lycIRQ )
        min( this.timeUntilLine(this.lyc) );

    return time;
}

jsboyGPU.prototype.timeUntilVBlank = function()
{
    if( this.pixelClock < DRAW_PHASE )
        return DRAW_PHASE - this.pixelClock;
    else
        return DRAW_PHASE + TICKS_PER_FRAME - this.pixelClock;
}

jsboyGPU.prototype.timeUntilDrawClock = function(phase, period)
{
    // The next one is on a banking line, so we wait until line 0's period
    if( this.pixelClock >= DRAW_PHASE - TICKS_PER_LINE + period )
    {
        return DRAW_PHASE - this.pixelClock + period;
    }
    // Calculate time until phase crossing
    else if( phase < period )
        return period - phase;
    else
        return period - phase + TICKS_PER_LINE;
}

jsboyGPU.prototype.timeUntilLine = function(line)
{
    if( line >= SCANLINES )
        return null;
    
    var bias = TICKS_PER_LINE * line;
    
    if( this.pixelClock < bias )
        return bias - this.pixelClock;
    else
        return bias - this.pixelClock + TICKS_PER_FRAME;
}

jsboyGPU.prototype.clock = function(cycles)
{
    var phase = this.pixelClock % TICKS_PER_LINE;

    if( this.timeUntilVBlank() <= cycles )
    {
        if( this.mode1IRQ )
            this.cpu.trigger( IRQ_LCD_STAT );
        this.cpu.trigger( IRQ_VBLANK );
    }
    
    // LCD-Stat registers
    if( this.lycIRQ )
    {        
        var ttl = this.timeUntilLine(this.lyc);        
        if( ttl !== null && ttl <= cycles )
            this.cpu.trigger( IRQ_LCD_STAT );
    }
    else if( this.mode2IRQ && this.timeUntilDrawClock(phase, 0) <= cycles )
    {
        this.cpu.trigger( IRQ_LCD_STAT );
    }
    else if( this.mode0IRQ && this.timeUntilDrawClock(phase, MODE_2_TIME + MODE_3_TIME) <= cycles )
    {
        this.cpu.trigger( IRQ_LCD_STAT );
    }
    
    // Ticks until the next line begins (End of mode 2)
    var nextDraw = MODE_2_TIME - phase;
    if( nextDraw < 0 )
        nextDraw += TICKS_PER_LINE;

    if( cycles >= nextDraw )
    {        
        // Attempt to discover which line we are drawing
        var currentLine = this.activeLine();
        if( phase >= MODE_2_TIME )
            currentLine = (currentLine + 1) % SCANLINES;
        
        var lines = Math.floor( (cycles - nextDraw) / TICKS_PER_LINE ) + 1;

        while( lines )
        {
            // Skip vblank (as it is wasteful)
            if( currentLine >= DRAWLINES )
            {
                var blankLines = (SCANLINES-currentLine);
                if( lines < blankLines )
                    break ;
    
                lines -= blankLines;
                currentLine = 0;
            }
            // Draw a regular raster
            else
            {         
                this.drawScanline(currentLine++);
                this.dma.moveBlock();   // Perform H-Blank DMA
                lines--;
            }
        }
    }

    this.pixelClock = (this.pixelClock + cycles) % TICKS_PER_FRAME;
}

// --- Mapping code
// --- Runtime body
jsboyGPU.prototype.update = function()
{
    this.lcd.update();
}

// --- Video control register
jsboyGPU.prototype.read_LCDC = function()
{
    return (this.lcd_enable ? 0x80 : 0) |
        (this.window_map ? 0x40 : 0) |
        (this.window_enable ? 0x20 : 0) |
        (this.map_tile_data ? 0x10 : 0) |
        (this.background_map ? 0x08 : 0) |
        (this.obj_size ? 0x04 : 0) |
        (this.obj_enable ? 0x02 : 0) |
        (this.bg_display ? 0x01 : 0);
}

jsboyGPU.prototype.write_LCDC = function(data)
{
    this.cpu.catchUp();
 
    this.lcd_enable = data & 0x80;
    this.window_map = data & 0x40;
    this.window_enable = data & 0x20;
    this.map_tile_data = data & 0x10;
    this.background_map = data & 0x08;
    this.obj_size = data & 0x04;
    this.obj_enable = data & 0x02;
    this.bg_display = data & 0x01;
}

// --- Video stat register
jsboyGPU.prototype.read_STAT = function()
{
    this.cpu.catchUp();

    var data = ((this.lyc==this.activeLine()) ? 4 : 0) |
        (this.lycIRQ ? 0x40 : 0) |
        (this.mode2IRQ ? 0x20 : 0) |
        (this.mode1IRQ ? 0x10 : 0) |
        (this.mode0IRQ ? 0x08 : 0);
    
    // Drawing period (3 state phase)
    if( this.pixelClock < DRAW_PHASE )
    {
        var phase = this.pixelClock % TICKS_PER_LINE;
        
        if( phase < MODE_2_TIME )
            return data | 2;
        else if( phase < MODE_2_TIME + MODE_3_TIME )
            return data | 3;
        else
            return data;
    }
    // Vertical blank period
    return data | 1;
}

jsboyGPU.prototype.write_STAT = function(data)
{
    this.cpu.catchUp();
    
    this.lycIRQ = data & 0x40;
    this.mode2IRQ = data & 0x20;
    this.mode1IRQ = data & 0x10;
    this.mode0IRQ = data & 0x08;
}

// --- Video position / clock values
jsboyGPU.prototype.read_WX = function()
{
    return this.wx;
}

jsboyGPU.prototype.write_WX = function(data)
{
    this.cpu.catchUp();
    this.wx = data;
}

jsboyGPU.prototype.read_WY = function()
{
    return this.wy;
}

jsboyGPU.prototype.write_WY = function(data)
{
    this.cpu.catchUp();
    this.wy = data;
}

jsboyGPU.prototype.read_SCX = function()
{
    return this.scx;
}

jsboyGPU.prototype.write_SCX = function(data)
{
    this.cpu.catchUp();
    this.scx = data;
}

jsboyGPU.prototype.read_SCY = function()
{
    return this.scy;
}

jsboyGPU.prototype.write_SCY = function(data)
{
    this.cpu.catchUp();
    this.scy = data;
}

jsboyGPU.prototype.activeLine = function()
{
    return Math.floor(this.pixelClock/TICKS_PER_LINE);    
}

jsboyGPU.prototype.read_LY = function()
{
    this.cpu.catchUp();
    return this.activeLine();
}

jsboyGPU.prototype.read_LYC = function()
{
    return this.lyc;
}

jsboyGPU.prototype.write_LYC = function(data)
{
    this.cpu.catchUp();
    this.lyc = data;
}

// --- Bank register
jsboyGPU.prototype.write_VBK = function( data )
{
    this.vbk = data & 1;
    bank = this.vbk * 0x2000;

    this.cpu.read.copy( 0x8000, this.videoMemory.read, bank, 0x2000 );
    this.cpu.write.copy( 0x8000, this.videoMemory.write, bank, 0x2000 );
}

jsboyGPU.prototype.write_DMA = function( data )
{
    this.cpu.catchUp();
    data = data << 8;
    
    var oam = this.oamMemory.data;
    for( var i = 0; i < 0xA0; i++ )
        oam[i] = this.cpu.read[data++]();
}

jsboyGPU.prototype.read_VBK = function()
{
    return this.vbk;
}

jsboyGPU.prototype.write_LCD_MODE = function(data)
{
    // I don't know how this is actually supose to work.
    if( data != 4 )
        return ;
    
    this.drawScanline = this.drawLegacyScanline;
}
