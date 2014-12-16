var registers = require("../registers"),
    memory = require("../../util/memory");

function WorkRam(cpu)
{
    this.cpu = cpu;
    this.memory = memory.ramBlock(0x8000);
    this.zeroPage = memory.ramBlock(0x7F);
    this.bank = 0;
}

WorkRam.prototype.write_SVBK = function( data )
{
    this.bank = data & 0x7;
    var ea = (this.bank || 1) * 0x10;

    // Bankable memory
    this.cpu.read.copy(0xD0, this.memory.readChunks, ea, 0x10);
    this.cpu.write.copy(0xD0, this.memory.writeChunks, ea, 0x10);

    // Shadow memory
    this.cpu.read.copy(0xF0, this.cpu.read, 0xD0, 0x0E);
    this.cpu.write.copy(0xF0, this.cpu.write, 0xD0, 0x0E);
};

WorkRam.prototype.read_SVBK = function()
{
    return this.bank;
};

WorkRam.prototype.reset = function()
{
    // --- Zero page memory (fast)
    this.cpu.registers.read.copy(0x80, this.zeroPage.read);
    this.cpu.registers.write.copy(0x80, this.zeroPage.write);

    // --- Map the default 8k memory
    this.cpu.read.copy(0xC0, this.memory.readChunks, 0, 0x20);
    this.cpu.write.copy(0xC0, this.memory.writeChunks, 0, 0x20);

    // --- Shadow memory
    this.cpu.read.copy(0xE0, this.cpu.read, 0xC0, 0x1E);
    this.cpu.write.copy(0xE0, this.cpu.write, 0xC0, 0x1E);
    this.bank = 0;

    this.cpu.registers.read[registers.SVBK] = this.read_SVBK.bind(this);
    this.cpu.registers.write[registers.SVBK] = this.write_SVBK.bind(this);
};

module.exports = WorkRam;
