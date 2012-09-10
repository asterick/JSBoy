/***
 ***   MBC1 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

define([], function() {
    function mapperMBC1( name, cpu, rom, ramSize, flags, description ) {
        this.ram = ramBlock( ramSize, 0x2000, name );
        this.banks = rom.chunk(0x4000);
        this.cpu = cpu;
        this.flags = flags;

        if( this.flags & BATTERY )
            this.ram.load();
    }

    mapperMBC1.prototype.close = function()
    {
        if( this.flags & BATTERY )
            this.ram.save();
    }

    mapperMBC1.prototype.reset = function()
    {
        this.ramEnabled = false;
        this.ramSelect = false;
        this.romBank = 1;
        this.upperBank = 0;

        // --- Static mapping
        this.cpu.read.copy( 0, this.banks[0] );
    
        this.cpu.write.fill(this.$('ramEnableReg'),       0x0000, 0x2000);
        this.cpu.write.fill(this.$('romBankSelectReg'),   0x2000, 0x2000);
        this.cpu.write.fill(this.$('upperBankSelectReg'), 0x4000, 0x2000);
        this.cpu.write.fill(this.$('ramModeSelectReg'),   0x6000, 0x2000);
    
        this.updateMemoryMap();
    }

    mapperMBC1.prototype.updateMemoryMap = function()
    {
        var ramBankAddr = (this.ramSelect ? this.upperBank : 0) * 0x2000;
        var romBankAddr = this.romBank | (this.ramSelect ? 0 : (this.upperBank << 5));

        this.cpu.read.copy( 0x4000, this.banks[romBankAddr % this.banks.length] );
    
        // --- Ram enable!
        if( this.ram )
        {
            if( this.ramEnabled )
            {
                this.cpu.read.copy( 0xA000, this.ram.read, ramBankAddr, 0x2000 );
                this.cpu.write.copy( 0xA000, this.ram.write, ramBankAddr, 0x2000 );
            }
            else
            {
                this.cpu.read.fill( function() { return 0xFF; }, 0xA000, 0x2000 );
                this.cpu.write.fill( function() {}, 0xA000, 0x2000 );
            }
        }
    }

    mapperMBC1.prototype.ramEnableReg = function( data )
    {
        if( !this.ram )
            return ;
    
        this.ramEnabled = (data & 0xF == 0xA);
        this.updateMemoryMap();
    }

    mapperMBC1.prototype.ramModeSelectReg = function( data )
    {
        if( !this.ram )
            return ;
    
        this.ramSelect = data & 1;
        this.updateMemoryMap();
    }

    mapperMBC1.prototype.romBankSelectReg = function( data )
    {            
        this.romBank = (data & 0x1F) || 1;
        this.updateMemoryMap();
    }

    mapperMBC1.prototype.upperBankSelectReg = function( data )
    {
        this.upperBank = data & 3;
        this.updateMemoryMap();
    }

    return mapperMBC1;
});

