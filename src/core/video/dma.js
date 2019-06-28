import * as registers from "../registers";

export default class DMA {
    constructor (gpu, cpu) {
        this.gpu = gpu;
        this.cpu = cpu;
    }

    reset()
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

    read_HDMA1 () {
        return (this.sourceAddress >> 8);
    };

    write_HDMA1 (data) {
        this.sourceAddress = (this.sourceAddress & 0x00FF) | (data << 8);
    };

    read_HDMA2 () {
        return this.sourceAddress & 0xFF;
    };

    write_HDMA2 (data) {
        this.sourceAddress = (this.sourceAddress & 0xFF00) | (data);
    };

    read_HDMA3 () {
        return (this.destinationAddress >> 8);
    };

    write_HDMA3 (data) {
        this.destinationAddress = (this.destinationAddress & 0x00FF) | (data << 8);
    };

    read_HDMA4 () {
        return this.destinationAddress & 0xFF;
    };

    write_HDMA4 (data) {
        this.destinationAddress = (this.destinationAddress & 0xFF00) | (data);
    };

    read_HDMA5 () {
        return (this.active ? 0 : 0x80) | (this.blocksLeft);
    };

    write_HDMA5 (data) {
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

    moveBlock () {
        // DMA is no longer active
        if( !this.active )
            return ;

        if( this.blocksLeft-- === 0 )
        {
            this.blocksLeft = 0xFF;
            this.active = false;
        }

        this.cpu.catchUp();

        let src_h = this.sourceAddress >> 8;
        let src_l = this.sourceAddress & 0xF0;
        let dst   = this.destinationAddress & 0x1FF0;
        let size = 0x10;

        while (size--) {
            this.gpu.vbk_cell[dst++] = this.cpu.read[src_h][src_l++]();
        }

        this.sourceAddress = (this.sourceAddress + 0x0010) & 0xFFFF;
        this.destinationAddress = (this.destinationAddress + 0x0010) & 0xFFFF;
    }
}
