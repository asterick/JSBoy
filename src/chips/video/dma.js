var registers = require("../registers");

function DMA (gpu, cpu) {
    this.gpu = gpu;
    this.cpu = cpu;
}

DMA.prototype.reset = function()
{
    this.active = false;
    this.blocksLeft = 0;

    this.sourceAddress = 0;
    this.destinationAddress = 0;

    this.cpu.registers.read[registers.HDMA1] = this.read_HDMA1.bind(this);
    this.cpu.registers.write[registers.HDMA1] = this.write_HDMA1.bind(this);
    this.cpu.registers.read[registers.HDMA2] = this.read_HDMA2.bind(this);
    this.cpu.registers.write[registers.HDMA2] = this.write_HDMA2.bind(this);
    this.cpu.registers.read[registers.HDMA3] = this.read_HDMA3.bind(this);
    this.cpu.registers.write[registers.HDMA3] = this.write_HDMA3.bind(this);
    this.cpu.registers.read[registers.HDMA4] = this.read_HDMA4.bind(this);
    this.cpu.registers.write[registers.HDMA4] = this.write_HDMA4.bind(this);
    this.cpu.registers.read[registers.HDMA5] = this.read_HDMA5.bind(this);
    this.cpu.registers.write[registers.HDMA5] = this.write_HDMA5.bind(this);
};

DMA.prototype.read_HDMA1 = function () {
    return (this.sourceAddress >> 8);
};

DMA.prototype.write_HDMA1 = function (data) {
    this.sourceAddress = (this.sourceAddress & 0x00FF) | (data << 8);
};

DMA.prototype.read_HDMA2 = function () {
    return this.sourceAddress & 0xFF;
};

DMA.prototype.write_HDMA2 = function (data) {
    this.sourceAddress = (this.sourceAddress & 0xFF00) | (data);
};

DMA.prototype.read_HDMA3 = function () {
    return (this.destinationAddress >> 8);
};

DMA.prototype.write_HDMA3 = function (data) {
    this.destinationAddress = (this.destinationAddress & 0x00FF) | (data << 8);
};

DMA.prototype.read_HDMA4 = function () {
    return this.destinationAddress & 0xFF;
};

DMA.prototype.write_HDMA4 = function (data) {
    this.destinationAddress = (this.destinationAddress & 0xFF00) | (data);
};

DMA.prototype.read_HDMA5 = function () {
    return (this.active ? 0 : 0x80) | (this.blocksLeft);
};

DMA.prototype.write_HDMA5 = function (data) {
    this.blocksLeft = data & 0x7F;
    this.active = true;

    var masked = this.sourceAddress & 0xE000;
    if( masked == 0x8000 || masked == 0xE000 )
        console.log('Source address is outside valid memory');

    // ---
    if( !(data & 0x80) )
    {
        while( this.active )
            this.moveBlock();
    }
    else
    {
        console.log('Warning, HBLANK HDMA activated (unsupported)');
    }
};

DMA.prototype.moveBlock = function () {
    // DMA is no longer active
    if( !this.active )
        return ;

    if( this.blocksLeft-- === 0 )
    {
        this.blocksLeft = 0xFF;
        this.active = false;
    }

    this.cpu.catchUp();

    var src_h = this.sourceAddress >> 8,
        src_l = this.sourceAddress & 0xF0,
        dst   = this.destinationAddress & 0x1FF0;
        size = 0x10;

    while (size--) {
        this.gpu.vbk_cell[dst++] = this.cpu.read[src_h][src_l++]();
    }

    this.sourceAddress = (this.sourceAddress + 0x0010) & 0xFFFF;
    this.destinationAddress = (this.destinationAddress + 0x0010) & 0xFFFF;
};

module.exports = DMA;
