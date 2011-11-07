function jsboyPalette(cpu)
{
    this.cpu = cpu;

    // --- Create a blank palette
    var palMemory = new ArrayBuffer(0x100);
    this.byteMemory = new Uint8Array(palMemory);
    this.paletteMemory = new Uint16Array(palMemory);

    for( var i = 0; i < this.paletteMemory.length; i++ )
        this.paletteMemory[i] = 0x7FFF;

    // DMG Palette registers
    this.reg_BGP = 0;
    this.reg_OBP0 = 0;
    this.reg_OBP1 = 0;    

    // CGB Palette registers (upper half always white)
    this.reg_BCPS = 0;
    this.reg_BCPS_increment = false;
    this.reg_OCPS = 0;
    this.reg_OCPS_increment = false;
}

jsboyPalette.prototype.reset = function()
{
    // DMG Palette registers
    this.cpu.read[REG_BGP] = this.$('read_BGP');
    this.cpu.write[REG_BGP] = this.$('write_BGP');
    this.cpu.read[REG_OBP0] = this.$('read_OBP0');
    this.cpu.write[REG_OBP0] = this.$('write_OBP0');
    this.cpu.read[REG_OBP1] = this.$('read_OBP1');
    this.cpu.write[REG_OBP1] = this.$('write_OBP1');

    // CGB Palette registers
    this.cpu.read[REG_BCPS] = this.$('read_BCPS');
    this.cpu.write[REG_BCPS] = this.$('write_BCPS');
    this.cpu.read[REG_BCPD] = this.$('read_BCPD');
    this.cpu.write[REG_BCPD] = this.$('write_BCPD');
    this.cpu.read[REG_OCPS] = this.$('read_OCPS');
    this.cpu.write[REG_OCPS] = this.$('write_OCPS');
    this.cpu.read[REG_OCPD] = this.$('read_OCPD');
    this.cpu.write[REG_OCPD] = this.$('write_OCPD');    
}

// --- DMG Palette paletteMemory registers
jsboyPalette.prototype.read_BGP = function()
{
    return this.reg_BGP;
}

jsboyPalette.prototype.write_BGP = function(data)
{
    this.cpu.catchUp();
    this.reg_BGP = data;
}

jsboyPalette.prototype.read_OBP0 = function()
{
    return this.reg_OBP0;
}

jsboyPalette.prototype.write_OBP0 = function(data)
{
    this.cpu.catchUp();
    this.reg_OBP0 = data;
}

jsboyPalette.prototype.read_OBP1 = function()
{
    return this.reg_OBP1;
}

jsboyPalette.prototype.write_OBP1 = function(data)
{
    this.cpu.catchUp();
    this.reg_OBP1 = data;
}

// --- CGB Palette paletteMemory registers
jsboyPalette.prototype.read_BCPS = function()
{
    return this.reg_BCPS | (this.reg_BCPS_increment ? 0x80 : 0);
}

jsboyPalette.prototype.write_BCPS = function(data)
{
    this.reg_BCPS_increment = (data & 0x80);
    this.reg_BCPS = data & 0x3F;
}

jsboyPalette.prototype.read_OCPS = function()
{
    return this.reg_OCPS | (this.reg_OCPS_increment ? 0x80 : 0);
}

jsboyPalette.prototype.write_OCPS = function(data)
{
    this.reg_OCPS_increment = (data & 0x80);
    this.reg_OCPS = data & 0x3F;
}

jsboyPalette.prototype.read_BCPD = function()
{
    return this.byteMemory[this.reg_BCPS];
}

jsboyPalette.prototype.write_BCPD = function(data)
{
    this.cpu.catchUp();

    this.byteMemory[this.reg_BCPS] = data;

    if( this.reg_BCPS_increment )
        this.reg_BCPS = (this.reg_BCPS+1) & 0x3F;
}

jsboyPalette.prototype.read_OCPD = function()
{
    return this.byteMemory[0x40|this.reg_OCPS];
}

jsboyPalette.prototype.write_OCPD = function(data)
{
    this.cpu.catchUp();

    this.byteMemory[0x40|this.reg_OCPS] = data;
    
    if( this.reg_OCPS_increment )
        this.reg_OCPS = (this.reg_OCPS+1) & 0x3F;
}
