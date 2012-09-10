/***
 ***   MBC2 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

define([], function () {
    function mapperMBC2( name, cpu, rom, ramSize, flags, description ) {
        this.banks = rom.chunk(0x4000);    
        this.ram = ramBlock(0x200,0x2000,name,0xF);
        this.flags = flags;
        this.cpu = cpu;
        this.rom = rom;

        if( this.flags & BATTERY )
            this.ram.load();
    }

    mapperMBC2.prototype.close = function()
    {
        if( this.flags & BATTERY )
            this.ram.save();
    }

    mapperMBC2.prototype.reset = function()
    {
        var re = this.$('ramEnable');
        var rb = this.$('romBank')
    
        // --- Static mapping
        for( var i = 0x0000; i < 0x8000; i++ )
            this.cpu.write[i] = (i & 1) ? re : rb;
    
        this.cpu.read.copy( 0, this.rom, 0, 0x4000 );

        this.ramEnable(0);
        this.romBank(1);
    }

    mapperMBC2.prototype.ramEnable = function( data )
    {
        // WARNING: THIS MAY BE INVALID
        if( (data & 0xF) == 0xA )
        {
            this.cpu.read.copy( 0xA000, this.ram.read, 0, 0x2000 );
            this.cpu.write.copy( 0xA000, this.ram.write, 0, 0x2000 );
        }
        else
        {
            this.cpu.read.fill( function() { return 0xFF; }, 0xA000, 0x2000 );
            this.cpu.write.fill( function() {}, 0xA000, 0x2000 );
        }
    }

    mapperMBC2.prototype.romBank = function( data )
    {
        data = (data & 0xF) || 1;
        this.cpu.read.copy(0x4000,this.banks[data]);    
    }

    return mapperMBC2;
});
