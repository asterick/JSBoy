/***
 ***   MBC2 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

var flags = require("./flags"),
    memory = require("../../util/memory");

function mapperMBC2( name, cpu, rom, ramSize, flags, description ) {
    this.banks = rom.chunk(0x40);
    this.ram = memory.ramBlock(0x200,0x2000,name,0xF);
    this.flags = flags;
    this.cpu = cpu;
    this.rom = rom;

    if( this.flags & flags.BATTERY )
        this.ram.load();
}

mapperMBC2.prototype.close = function()
{
    if( this.flags & flags.BATTERY )
        this.ram.save();
};

mapperMBC2.prototype.reset = function()
{
    var re = this.ramEnable.bind(this),
        rb = this.romBank.bind(this),
        writeMap = new Array(0x100);

    // --- Static mapping
    for( var i = 0; i < 0x100; i++ )
        writeMap[i] = (i & 1) ? re : rb;

    this.cpu.write.fill(writeMap, 0, 0x80);
    this.cpu.read.copy( 0, this.rom, 0, 0x40 );

    this.ramEnable(0);
    this.romBank(1);
};

mapperMBC2.prototype.ramEnable = function( data )
{
    // WARNING: THIS MAY BE INVALID
    if( (data & 0xF) == 0xA )
    {
        this.cpu.read.copy( 0xA0, this.ram.readChunks, 0, 0x20 );
        this.cpu.write.copy( 0xA0, this.ram.writeChunks, 0, 0x20 );
    }
    else
    {
        this.cpu.read.fill(this.cpu.nullBlock, 0xA0, 0x20);
        this.cpu.write.fill(this.cpu.nullBlock, 0xA0, 0x20);
    }
};

mapperMBC2.prototype.romBank = function( data )
{
    data = (data & 0xF) || 1;
    this.cpu.read.copy(0x40,this.banks[data]);
};

module.exports = mapperMBC2;
