/***
 ***   ROM based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

define([], function () {
    function mapperROM( name, cpu, rom, ramSize, flags, description ) {    
        this.rom = rom;
        this.ram = ramBlock( ramSize, 0x2000, name );
        this.cpu = cpu;
        this.flags = flags;

        if( this.flags & BATTERY )
            this.ram.load();
    }

    mapperROM.prototype.close = function()
    {
        if( this.flags & BATTERY )
            this.ram.save();
    }

    mapperROM.prototype.reset = function()
    {
        this.cpu.read.copy( 0, this.rom, 0, 0x8000 );
    
        var ramMask = this.ramMask;
    
        if( this.ram )
        {
            this.cpu.read.copy( 0xA000, this.ram.read, 0x2000 );
            this.cpu.write.copy( 0xA000, this.ram.write, 0x2000 );
        }
    }

    return mapperROM;
});
