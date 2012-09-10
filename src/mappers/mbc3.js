/***
 ***   MBC3 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY, TIMER
 ***
 ***/

define([], function () {
    function mapperMBC3( name, cpu, rom, ramSize, flags, description ) {
        this.ram = ramBlock( ramSize, 0x2000, name );
        this.banks = rom.chunk(0x4000);

        this.cpu = cpu;
        this.flags = flags;

        if( this.flags & BATTERY )
            this.ram.load();
    }
    
    mapperMBC3.prototype.close = function()
    {
        if( this.flags & BATTERY )
            this.ram.save();
    }

    mapperMBC3.prototype.reset = function()
    {
        this.ramEnabled = false;
        this.romBank = 1;
        this.ramBank = 0;

        // --- Static mapping
        this.cpu.read.copy( 0, this.banks[0] );
    
        this.cpu.write.fill(this.$('ramEnableReg'),     0x0000, 0x2000);
        this.cpu.write.fill(this.$('romBankSelectReg'), 0x2000, 0x2000);
        this.cpu.write.fill(this.$('ramBankSelectReg'), 0x4000, 0x2000);
        this.cpu.write.fill(this.$('clockLatchReg'),    0x6000, 0x2000);

        this.updateMemoryMap();
    }

    mapperMBC3.prototype.updateMemoryMap = function()
    {
        this.cpu.read.copy( 0x4000, this.banks[this.romBank] );
    
        if( this.ram && this.ramEnabled && this.ramBank <= 3 )
        {
            var ramBankAddr = this.ramBank * 0x2000;
            this.cpu.read.copy( 0xA000, this.ram.read, ramBankAddr, 0x2000 );
            this.cpu.write.copy( 0xA000, this.ram.write, ramBankAddr, 0x2000 );
        }        
        // TODO: TIMER
        else
        {
            this.cpu.read.fill( function() { return 0xFF; }, 0xA000, 0x2000 );
            this.cpu.write.fill( function() {}, 0xA000, 0x2000 );
        }
    }

    mapperMBC3.prototype.ramEnableReg = function( data )
    {
        if( !this.ram )
            return ;
    
        this.ramEnabled = (data & 0xF == 0xA);
        this.updateMemoryMap();
    }

    mapperMBC3.prototype.romBankSelectReg = function( data )
    {            
        this.romBank = ((data & 0x7F) % this.banks.length) || 1;
        this.updateMemoryMap();
    }

    mapperMBC3.prototype.ramBankSelectReg = function( data )
    {
        this.ramBank = (data & 0xF);
        this.updateMemoryMap();
    }

    mapperMBC3.prototype.clockLatchReg = function( data )
    {
        // TODO: DO TIMER
    }

    return mapperMBC3;
});
