/***
 ***   MBC3 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY, TIMER
 ***
 ***/

var flags = require("./flags"),
    memory = require("../../util/memory");

function mapperMBC3( name, cpu, rom, ramSize, flags, description ) {
    this.ram = memory.ramBlock( ramSize, 0x2000, name );
    this.banks = rom.chunk(0x40);

    this.cpu = cpu;
    this.flags = flags;

    if( this.flags & flags.BATTERY )
        this.ram.load();
}

mapperMBC3.prototype.close = function()
{
    if( this.flags & flags.BATTERY )
        this.ram.save();
};

mapperMBC3.prototype.reset = function()
{
    this.ramEnabled = false;
    this.romBank = 1;
    this.ramBank = 0;

    // --- Static mapping
    this.cpu.read.copy( 0, this.banks[0] );

    var ramEnableReg = (new Array(0x100)).fill(this.ramEnableReg.bind(this)),
        romBankSelectReg = (new Array(0x100)).fill(this.romBankSelectReg.bind(this)),
        ramBankSelectReg = (new Array(0x100)).fill(this.ramBankSelectReg.bind(this)),
        clockLatchReg = (new Array(0x100)).fill(this.clockLatchReg.bind(this));

    this.cpu.write.fill(ramEnableReg,     0x00, 0x20);
    this.cpu.write.fill(romBankSelectReg, 0x20, 0x20);
    this.cpu.write.fill(ramBankSelectReg, 0x40, 0x20);
    this.cpu.write.fill(clockLatchReg,    0x60, 0x20);

    this.updateMemoryMap();
};

mapperMBC3.prototype.updateMemoryMap = function()
{
    this.cpu.read.copy( 0x40, this.banks[this.romBank] );

    if( this.ram && this.ramEnabled && this.ramBank <= 3 )
    {
        var ramBankAddr = this.ramBank * 0x20;
        this.cpu.read.copy( 0xA0, this.ram.readChunks, ramBankAddr, 0x20 );
        this.cpu.write.copy( 0xA0, this.ram.writeChunks, ramBankAddr, 0x20 );
    }
    // TODO: TIMER
    else
    {
        this.cpu.read.fill(this.cpu.nullBlock, 0xA0, 0x20);
        this.cpu.write.fill(this.cpu.nullBlock, 0xA0, 0x20);
    }
};

mapperMBC3.prototype.ramEnableReg = function( data )
{
    if( !this.ram )
        return ;

    this.ramEnabled = (data & 0xF == 0xA);
    this.updateMemoryMap();
};

mapperMBC3.prototype.romBankSelectReg = function( data )
{
    this.romBank = ((data & 0x7F) % this.banks.length) || 1;
    this.updateMemoryMap();
};

mapperMBC3.prototype.ramBankSelectReg = function( data )
{
    this.ramBank = (data & 0xF);
    this.updateMemoryMap();
};

mapperMBC3.prototype.clockLatchReg = function( data )
{
    // TODO: DO TIMER
};

module.exports = mapperMBC3;
