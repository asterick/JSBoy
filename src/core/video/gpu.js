var LCD = require("./lcd"),
    DMA = require("./dma"),
    Palette = require("./palette"),
    memory = require("../../util/memory"),
    registers = require("../registers"),
    consts = require("../consts");

// These clocks are in GBC machine instruction cycles (Double speed)
// IE: 4MHZ / 4 * 2

var SCANLINES      = 154,
    DRAWLINES      = 144,
    MODE_0_TIME    = 408,
    MODE_2_TIME    = 160,
    MODE_3_TIME    = 344,
    TICKS_PER_LINE = MODE_0_TIME + MODE_2_TIME + MODE_3_TIME,
    DRAW_PHASE     = DRAWLINES * TICKS_PER_LINE,
    TICKS_PER_FRAME = SCANLINES * TICKS_PER_LINE;

function GPU(cpu)
{
    // --- System registers
    this.videoMemory = memory.ramBlock(0x4000);
    this.oamMemory = memory.ramBlock(0xA0);
    this.palette = new Palette(cpu);
    this.lcd = new LCD(this.palette);
    this.dma = new DMA(this, cpu);
    this.cpu = cpu;
    this.videoBanks = [this.videoMemory.data, this.videoMemory.data.subarray(0x2000)];

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

    // We don't want to create this closure more than once.
    var oam = this.oamMemory.data;
    this.legacySorter = function(a,b) {
        var ax = oam[a+1];
        var bx = oam[b+1];
        return ax - bx;
    };
}

GPU.prototype.setContext = function (ctx) {
    this.lcd.setContext(ctx);
};

GPU.prototype.reset = function()
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

    this.cpu.read[0xFE].copy(0, this.oamMemory.read);
    this.cpu.write[0xFE].copy(0, this.oamMemory.write);

    this.cpu.registers.write[registers.DMA] = this.write_DMA.bind(this);

    this.cpu.registers.read[registers.LCDC] = this.read_LCDC.bind(this);
    this.cpu.registers.write[registers.LCDC] = this.write_LCDC.bind(this);
    this.cpu.registers.read[registers.STAT] = this.read_STAT.bind(this);
    this.cpu.registers.write[registers.STAT] = this.write_STAT.bind(this);

    this.cpu.registers.read[registers.SCX] = this.read_SCX.bind(this);
    this.cpu.registers.write[registers.SCX] = this.write_SCX.bind(this);
    this.cpu.registers.read[registers.SCY] = this.read_SCY.bind(this);
    this.cpu.registers.write[registers.SCY] = this.write_SCY.bind(this);
    this.cpu.registers.read[registers.WX] = this.read_WX.bind(this);
    this.cpu.registers.write[registers.WX] = this.write_WX.bind(this);
    this.cpu.registers.read[registers.WY] = this.read_WY.bind(this);
    this.cpu.registers.write[registers.WY] = this.write_WY.bind(this);

    this.cpu.registers.read[registers.LY] = this.read_LY.bind(this);
    this.cpu.registers.read[registers.LYC] = this.read_LYC.bind(this);
    this.cpu.registers.write[registers.LYC] = this.write_LYC.bind(this);

    this.cpu.registers.read[registers.VBK] = this.read_VBK.bind(this);
    this.cpu.registers.write[registers.VBK] = this.write_VBK.bind(this);

    this.cpu.registers.write[registers.LCD_MODE] = this.write_LCD_MODE.bind(this);
};

GPU.prototype.drawMapTile = function(mapAddr, tpx, tpy)
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
};

GPU.prototype.drawLegacyMapTile = function(mapAddr, tpx, tpy)
{
    var tile = this.videoMemory.data[mapAddr] << 4;

    var tileAddr = (tpy & 7) << 1;

    if( !this.map_tile_data && !(tile & 0x800) )
        tileAddr += 0x1000 + tile;
    else
        tileAddr += tile;

    this.lcd.copyTileBG( tpx, this.videoMemory.data[tileAddr], this.videoMemory.data[tileAddr+1], 0, false, false );
};

GPU.prototype.drawScanline = function(line)
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

            this.lcd.copyTileOBJ( x, this.videoMemory.data[tileAddr], this.videoMemory.data[tileAddr+1], pal, hflip, priority );
        }
    }

    this.lcd.copyScanline(line);
};

GPU.prototype.drawLegacyScanline = function(line)
{
    var mapLine, mapAddr, tpx, tx;

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
        mapLine = this.scy + line;
        mapAddr = (this.background_map ? 0x1C00 : 0x1800) | (((mapLine & 0xFF) >> 3) << 5);
        tpx = 8-(this.scx & 7);
        tx  = this.scx >> 3;

        for( ; tpx < 168; tpx += 8, tx++ )
            this.drawLegacyMapTile( mapAddr | (tx & 0x1F), tpx, mapLine );
    }
    else
    {
        this.lcd.clear();
    }

    // Draw the window when it's enabled
    mapLine = line - this.wy;
    if( this.window_enable && mapLine >= 0 )
    {
        mapAddr = (this.window_map ? 0x1C00 : 0x1800) | (((mapLine & 0xFF) >> 3) << 5);
        tpx = this.wx + 1;
        tx = 0;

        for( ; tpx < 168; tpx += 8, tx++ )
            this.drawLegacyMapTile( mapAddr | (tx & 0x1F), tpx, mapLine );
    }

    if( this.obj_enable )
    {
        // Sort sprite index list based on their X coordinate
        var oam = this.oamMemory.data;
        var order = this.legacySpriteOrder;
        order.sort( this.legacySorter );

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
};

GPU.prototype.predictEndOfFrame = function()
{
    return TICKS_PER_FRAME - this.pixelClock;
};

GPU.prototype.predict = function()
{
    var phase = this.pixelClock % TICKS_PER_LINE,
        a, b, c;

    // LCD-Stat registers
    if( this.mode2IRQ )
        a = this.timeUntilDrawClock(0, phase);
    if( this.mode0IRQ )
        b = this.timeUntilDrawClock(MODE_2_TIME + MODE_3_TIME, phase);
    if( this.lycIRQ )
        c = this.timeUntilLine(this.lyc);

    // Note: This relies a lot on 'undefined' comparison behavior
    if( a < b && a < c )
        return a;
    else if( b < c )
        return b;
    else
        return c;
};

GPU.prototype.timeUntilVBlank = function()
{
    if( this.pixelClock < DRAW_PHASE )
        return DRAW_PHASE - this.pixelClock;
    else
        return DRAW_PHASE + TICKS_PER_FRAME - this.pixelClock;
};

GPU.prototype.timeUntilDrawClock = function(phase, period)
{
    // The next one is on a banking line, so we wait until line 0's period
    if( this.pixelClock >= DRAW_PHASE - TICKS_PER_LINE + period )
        return DRAW_PHASE - this.pixelClock + period;

    // Calculate time until phase crossing
    else if( phase < period )
        return period - phase;
    else
        return period - phase + TICKS_PER_LINE;
};

GPU.prototype.timeUntilLine = function(line)
{
    if( line >= SCANLINES )
        return ;

    var bias = TICKS_PER_LINE * line;

    if( this.pixelClock < bias )
        return bias - this.pixelClock;
    else
        return bias - this.pixelClock + TICKS_PER_FRAME;
};

GPU.prototype.clock = function(cycles)
{
    var phase = this.pixelClock % TICKS_PER_LINE;

    if( this.timeUntilVBlank() <= cycles )
    {
        if( this.mode1IRQ )
            this.cpu.trigger( consts.IRQ_LCD_STAT );
        this.cpu.trigger( consts.IRQ_VBLANK );
    }

    // LCD-Stat registers
    if( this.lycIRQ )
    {
        var ttl = this.timeUntilLine(this.lyc);
        if( ttl !== null && ttl <= cycles )
            this.cpu.trigger( consts.IRQ_LCD_STAT );
    }
    else if( this.mode2IRQ && this.timeUntilDrawClock(phase, 0) <= cycles )
    {
        this.cpu.trigger( consts.IRQ_LCD_STAT );
    }
    else if( this.mode0IRQ && this.timeUntilDrawClock(phase, MODE_2_TIME + MODE_3_TIME) <= cycles )
    {
        this.cpu.trigger( consts.IRQ_LCD_STAT );
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
                this.lcd.update();
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
};

// --- Video control register
GPU.prototype.read_LCDC = function()
{
    return (this.lcd_enable ? 0x80 : 0) |
        (this.window_map ? 0x40 : 0) |
        (this.window_enable ? 0x20 : 0) |
        (this.map_tile_data ? 0x10 : 0) |
        (this.background_map ? 0x08 : 0) |
        (this.obj_size ? 0x04 : 0) |
        (this.obj_enable ? 0x02 : 0) |
        (this.bg_display ? 0x01 : 0);
};

GPU.prototype.write_LCDC = function(data)
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
};

// --- Video stat register
GPU.prototype.read_STAT = function()
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
};

GPU.prototype.write_STAT = function(data)
{
    this.cpu.catchUp();

    this.lycIRQ = data & 0x40;
    this.mode2IRQ = data & 0x20;
    this.mode1IRQ = data & 0x10;
    this.mode0IRQ = data & 0x08;
};

// --- Video position / clock values
GPU.prototype.read_WX = function()
{
    return this.wx;
};

GPU.prototype.write_WX = function(data)
{
    this.cpu.catchUp();
    this.wx = data;
};

GPU.prototype.read_WY = function()
{
    return this.wy;
};

GPU.prototype.write_WY = function(data)
{
    this.cpu.catchUp();
    this.wy = data;
};

GPU.prototype.read_SCX = function()
{
    return this.scx;
};

GPU.prototype.write_SCX = function(data)
{
    this.cpu.catchUp();
    this.scx = data;
};

GPU.prototype.read_SCY = function () {
    return this.scy;
};

GPU.prototype.write_SCY = function (data) {
    this.cpu.catchUp();
    this.scy = data;
};

GPU.prototype.activeLine = function () {
    return Math.floor(this.pixelClock/TICKS_PER_LINE);
};

GPU.prototype.read_LY = function () {
    this.cpu.catchUp();
    return this.activeLine();
};

GPU.prototype.read_LYC = function () {
    return this.lyc;
};

GPU.prototype.write_LYC = function (data) {
    this.cpu.catchUp();
    this.lyc = data;
};

// --- Bank register
GPU.prototype.write_VBK = function (data) {
    this.vbk = data & 1;
    bank = this.vbk * 0x20;

    this.vbk_cell = this.videoBanks[this.vbk];

    this.cpu.read.copy(0x80, this.videoMemory.readChunks, bank, 0x20);
    this.cpu.write.copy(0x80, this.videoMemory.writeChunks, bank, 0x20);
};

GPU.prototype.read_VBK = function () {
    return this.vbk;
};

GPU.prototype.write_DMA = function (data) {
    this.cpu.catchUp();

    var oam = this.oamMemory.data,
        src = this.cpu.read[data];

    for (var i = 0; i < 0xA0; i++) {
        oam[i] = src[i]();
    }
};

GPU.prototype.write_LCD_MODE = function(data) {
    // I don't know how this is actually supose to work.
    if (data != 4) {
        return ;
    }

    this.drawScanline = this.drawLegacyScanline;
};

module.exports = GPU;
