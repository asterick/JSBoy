function jsboyWorkRam(cpu)
{
    this.cpu = cpu;
    this.memory = ramBlock( 0x8000 );
    this.zeroPage = ramBlock( 0x7F );
    this.bank = 0;
}

jsboyWorkRam.prototype.write_SVBK = function( data )
{
    this.bank = data & 0x7;
    var ab = (this.bank || 1) * 0x1000;

    // Bankable memory
    this.cpu.read.copy(0xD000, this.memory.read, ab, 0x1000);
    this.cpu.write.copy(0xD000, this.memory.write, ab, 0x1000);

    // Shadow memory
    this.cpu.read.copy(0xF000, this.memory.read, ab, 0xE00);
    this.cpu.write.copy(0xF000, this.memory.write, ab, 0xE00);
}

jsboyWorkRam.prototype.read_SVBK = function()
{
    return this.bank;
}
    
jsboyWorkRam.prototype.reset = function()
{
    // --- Zero page memory (fast)
    this.cpu.read.copy(0xFF80, this.zeroPage.read );
    this.cpu.write.copy(0xFF80, this.zeroPage.write );

    // --- Map the default 8k memory
    this.cpu.read.copy(0xC000, this.memory.read, 0, 0x2000);
    this.cpu.write.copy(0xC000, this.memory.write, 0, 0x2000);

    // --- Shadow memory
    this.cpu.read.copy(0xE000, this.memory.read, 0, 0x1E00);
    this.cpu.write.copy(0xE000, this.memory.write, 0, 0x1E00);
    
    this.bank = 0;

    this.cpu.read[REG_SVBK] = this.$('read_SVBK');
    this.cpu.write[REG_SVBK] = this.$('write_SVBK');
}
