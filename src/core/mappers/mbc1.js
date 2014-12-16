/***
 ***   MBC1 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

var flags = require("./flags"),
    memory = require("../../util/memory");

function mapperMBC1( name, cpu, rom, ramSize, flags, description ) {
    this.ram = memory.ramBlock( ramSize, 0x2000, name );
    this.banks = rom.chunk(0x40);
    this.cpu = cpu;
    this.flags = flags;

    if( this.flags & flags.BATTERY )
        this.ram.load();
}

mapperMBC1.prototype.close = function()
{
    if( this.flags & flags.BATTERY )
        this.ram.save();
};

mapperMBC1.prototype.reset = function()
{
    this.ramEnabled = false;
    this.ramSelect = false;
    this.romBank = 1;
    this.upperBank = 0;

    // --- Static mapping
    this.cpu.read.copy( 0, this.banks[0] );

    var ramEnableReg = (new Array(0x100)).fill(this.ramEnableReg.bind(this)),
        romBankSelectReg = (new Array(0x100)).fill(this.romBankSelectReg.bind(this)),
        upperBankSelectReg = (new Array(0x100)).fill(this.upperBankSelectReg.bind(this)),
        ramModeSelectReg = (new Array(0x100)).fill(this.ramModeSelectReg.bind(this));

    this.cpu.write.fill(ramEnableReg,       0x00, 0x20);
    this.cpu.write.fill(romBankSelectReg,   0x20, 0x20);
    this.cpu.write.fill(upperBankSelectReg, 0x40, 0x20);
    this.cpu.write.fill(ramModeSelectReg,   0x60, 0x20);

    this.updateMemoryMap();
};

mapperMBC1.prototype.updateMemoryMap = function()
{
    var ramBankAddr = (this.ramSelect ? this.upperBank : 0) * 0x20;
    var romBankAddr = this.romBank | (this.ramSelect ? 0 : (this.upperBank << 5));

    this.cpu.read.copy( 0x40, this.banks[romBankAddr % this.banks.length] );

    // --- Ram enable!
    if( this.ram )
    {
        if( this.ramEnabled )
        {
            this.cpu.read.copy( 0xA0, this.ram.read, ramBankAddr, 0x20 );
            this.cpu.write.copy( 0xA0, this.ram.write, ramBankAddr, 0x20 );
        }
        else
        {
            this.cpu.read.fill(this.cpu.nullBlock, 0xA0, 0x20);
            this.cpu.write.fill(this.cpu.nullBlock, 0xA0, 0x20);
        }
    }
};

mapperMBC1.prototype.ramEnableReg = function( data )
{
    if( !this.ram )
        return ;

    this.ramEnabled = (data & 0xF == 0xA);
    this.updateMemoryMap();
};

mapperMBC1.prototype.ramModeSelectReg = function( data )
{
    if( !this.ram )
        return ;

    this.ramSelect = data & 1;
    this.updateMemoryMap();
};

mapperMBC1.prototype.romBankSelectReg = function( data )
{
    this.romBank = (data & 0x1F) || 1;
    this.updateMemoryMap();
};

mapperMBC1.prototype.upperBankSelectReg = function( data )
{
    this.upperBank = data & 3;
    this.updateMemoryMap();
};

module.exports = mapperMBC1;
