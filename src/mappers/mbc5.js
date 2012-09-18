/***
 ***   MBC3 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY, RUMBLE
 ***
 ***/

define([], function () {
    function mapperMBC5( name, cpu, rom, ramSize, flags, description ) {
        this.ram = ramBlock( ramSize, 0x2000, name );
        this.banks = rom.chunk(0x40);
    
        this.cpu = cpu;
        this.flags = flags;

        if( this.flags & BATTERY )
            this.ram.load();
    }
    
    mapperMBC5.prototype.close = function()
    {
        if( this.flags & BATTERY )
            this.ram.save();
    }

    mapperMBC5.prototype.reset = function()
    {
        this.ramEnabled = false;
        this.romBank = 0;
        this.ramBank = 0;

        // --- Static mapping
        this.cpu.read.copy( 0, this.banks[0] );
    
        this.cpu.write.fill(this.$('ramEnableReg'),       0x0000, 0x2000);
        this.cpu.write.fill(this.$('lowerRomBankSelect'), 0x2000, 0x2000);
        this.cpu.write.fill(this.$('upperRomBankSelect'), 0x4000, 0x2000);
        this.cpu.write.fill(this.$('ramBankSelectReg'),   0x6000, 0x2000);

        this.updateMemoryMap();
    }

    mapperMBC5.prototype.updateMemoryMap = function()
    {
        this.cpu.read.copy( 0x4000, this.banks[(this.romBank || 1) % this.banks.length] );
    
        if( this.ram && this.ramEnabled )
        {
            var ramBankAddr = (this.ramBank * 0x2000) % this.ram.data.length;
            this.cpu.read.copy( 0xA000, this.ram.read, ramBankAddr, 0x2000 );
            this.cpu.write.copy( 0xA000, this.ram.write, ramBankAddr, 0x2000 );
        } 
        else
        {
            this.cpu.read.fill( function() { return 0xFF; }, 0xA000, 0x2000 );
            this.cpu.write.fill( function() {}, 0xA000, 0x2000 );
        }
    }

    mapperMBC5.prototype.ramEnableReg = function( data )
    {
        if( !this.ram )
            return ;
    
        this.ramEnabled = (data == 0xA);
        this.updateMemoryMap();
    }

    mapperMBC5.prototype.lowerRomBankSelect = function( data )
    {            
        this.romBank = (this.romBank & 0xFF00) | (data);
        this.updateMemoryMap();
    }

    mapperMBC5.prototype.upperRomBankSelect = function( data )
    {            
        this.romBank = (this.romBank & 0x00FF) | (data << 8);
        this.updateMemoryMap();
    }

    mapperMBC5.prototype.ramBankSelectReg = function( data )
    {
        this.ramBank = data;
        this.updateMemoryMap();
    }

    return mapperMBC5;
});
