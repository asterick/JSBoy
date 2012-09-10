define([
    "chips/registers"
], function (registers) {
    function jsboyDMA(cpu)
    {
        this.cpu = cpu;
    }

    jsboyDMA.prototype.reset = function()
    {
        this.active = false;
        this.blocksLeft = 0;
    
        this.sourceAddress = 0;
        this.destinationAddress = 0;

        this.cpu.read[registers.HDMA1] = this.$('read_HDMA1');
        this.cpu.write[registers.HDMA1] = this.$('write_HDMA1');
        this.cpu.read[registers.HDMA2] = this.$('read_HDMA2');
        this.cpu.write[registers.HDMA2] = this.$('write_HDMA2');
        this.cpu.read[registers.HDMA3] = this.$('read_HDMA3');
        this.cpu.write[registers.HDMA3] = this.$('write_HDMA3');
        this.cpu.read[registers.HDMA4] = this.$('read_HDMA4');
        this.cpu.write[registers.HDMA4] = this.$('write_HDMA4');
        this.cpu.read[registers.HDMA5] = this.$('read_HDMA5');
        this.cpu.write[registers.HDMA5] = this.$('write_HDMA5');
    }

    jsboyDMA.prototype.read_HDMA1 = function()
    {
        return (this.sourceAddress >> 8);
    }

    jsboyDMA.prototype.write_HDMA1 = function(data)
    {
        this.sourceAddress = (this.sourceAddress & 0x00FF) | (data << 8);
    }

    jsboyDMA.prototype.read_HDMA2 = function()
    {
        return this.sourceAddress & 0xFF;
    }

    jsboyDMA.prototype.write_HDMA2 = function(data)
    {
        this.sourceAddress = (this.sourceAddress & 0xFF00) | (data);
    }

    jsboyDMA.prototype.read_HDMA3 = function()
    {
        return (this.destinationAddress >> 8);
    }

    jsboyDMA.prototype.write_HDMA3 = function(data)
    {
        this.destinationAddress = (this.destinationAddress & 0x00FF) | (data << 8);
    }

    jsboyDMA.prototype.read_HDMA4 = function()
    {
        return this.destinationAddress & 0xFF;
    }

    jsboyDMA.prototype.write_HDMA4 = function(data)
    {
        this.destinationAddress = (this.destinationAddress & 0xFF00) | (data);
    }

    jsboyDMA.prototype.read_HDMA5 = function()
    {
        return (this.active ? 0 : 0x80) | (this.blocksLeft);
    }

    jsboyDMA.prototype.write_HDMA5 = function(data)
    {
        this.blocksLeft = data & 0x7F;
        this.active = true;

        var masked = this.sourceAddress & 0xE000;
        if( masked == 0x8000 || masked == 0xE000 )
            log('Source address is outside valid memory')

        // --- 
        if( !(data & 0x80) )
        {
            while( this.active )
                this.moveBlock();
        }
        else
        {
            log('Warning, HBLANK HDMA activated (unsupported)');
        }
    }

    jsboyDMA.prototype.moveBlock = function()
    {    
        // DMA is no longer active
        if( !this.active )
            return ;
    
        if( this.blocksLeft-- == 0 )
        {
            this.blocksLeft = 0xFF;
            this.active = false;
        }
 
        this.cpu.catchUp();
        
        var src = this.sourceAddress & 0xFFF0;
        var dst = 0x8000 | (this.destinationAddress & 0x1FF0);
        var size = 0x10;
    
        while( size-- )
            this.cpu.write[dst++]( this.cpu.read[src++]() );

        this.sourceAddress = (this.sourceAddress + 0x0010) & 0xFFFF;
        this.destinationAddress = (this.destinationAddress + 0x0010) & 0xFFFF;
    }

    return jsboyDMA;
});