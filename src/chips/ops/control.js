// --- CPU Level hardware registers (IEQ, Speed and CPU dependant timer)    
jsboyCPU.prototype.read_IE = function()
{
    return this.irq_enable;
}

jsboyCPU.prototype.write_IE = function( data )
{
    this.irq_enable = data & 0x1F;
    this.invalidate();
}

jsboyCPU.prototype.read_IF = function()
{
    this.catchUp();
    
    return this.irq_request;
}

jsboyCPU.prototype.write_IF = function( data )
{
    this.irq_request = data & 0x1F;        
    this.invalidate();
}

jsboyCPU.prototype.read_KEY1 = function()
{
    return (this.doubleSpeed ? 0x80 : 0) |
           (this.prepareSpeed ? 0x01 : 0);
}

jsboyCPU.prototype.write_KEY1 = function(data)
{
    this.prepareSpeed = data & 1;
}

jsboyCPU.prototype.write_LOCK = function(data)
{
    if( data != 1 )
        return ;

    // This perminantly locks down all GBC specfic hardware, preventing it from
    // being inadvertantly accessed by mono gameboy titles
    // BIOS appears to have priviledged access to the hardware, so until
    // it locks, don't disable the advanced registers

    var self = this;
    var lock = this.write[REG_BLCK];
    
    this.write[REG_BLCK] = function(data)
    {
        if( data != 0x11 )
            return ;
        
        // --- IR Communication
        self.alertIllegal(REG_RP);
    
        // --- Video DMA
        self.alertIllegal(REG_HDMA1);
        self.alertIllegal(REG_HDMA2);
        self.alertIllegal(REG_HDMA3);
        self.alertIllegal(REG_HDMA4);
        self.alertIllegal(REG_HDMA5);
    
        // --- Palette access
        self.alertIllegal(REG_BCPS);
        self.alertIllegal(REG_BCPD);
        self.alertIllegal(REG_OCPS);
        self.alertIllegal(REG_OCPD);
        
        // --- Memory banking
        self.alertIllegal(REG_VBK);
        self.alertIllegal(REG_SVBK);
    
        // --- Speed control
        self.alertIllegal(REG_KEY1);
    
        // --- Lockout controls
        self.alertIllegal(REG_LCD_MODE);
        self.alertIllegal(REG_LOCK);

        lock(0x11);
    };
}
