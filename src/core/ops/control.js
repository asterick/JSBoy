var CPU = {},
    registers = require("../registers");

// --- CPU Level hardware registers (IEQ, Speed and CPU dependant timer)
CPU.read_IE = function()
{
    return this.irq_enable;
};

CPU.write_IE = function( data )
{
    this.catchUp();
    this.irq_enable = data & 0x1F;
};

CPU.read_IF = function()
{
    this.catchUp();
    return this.irq_request;
};

CPU.write_IF = function( data )
{
    this.catchUp();
    this.irq_request = data & 0x1F;
};

CPU.read_KEY1 = function()
{
    return (this.doubleSpeed ? 0x80 : 0) |
           (this.prepareSpeed ? 0x01 : 0);
};

CPU.write_KEY1 = function(data)
{
    this.prepareSpeed = data & 1;
};

CPU.write_LOCK = function(data)
{
    if( data != 1 )
        return ;

    // This perminantly locks down all GBC specfic hardware, preventing it from
    // being inadvertantly accessed by mono gameboy titles
    // BIOS appears to have priviledged access to the hardware, so until
    // it locks, don't disable the advanced registers

    var self = this;
    var lock = this.registers.write[registers.BLCK];

    this.registers.write[registers.BLCK] = function(data)
    {
        if( data != 0x11 )
            return ;

        // --- IR Communication
        self.alertIllegal(registers.RP);

        // --- Video DMA
        self.alertIllegal(registers.HDMA1);
        self.alertIllegal(registers.HDMA2);
        self.alertIllegal(registers.HDMA3);
        self.alertIllegal(registers.HDMA4);
        self.alertIllegal(registers.HDMA5);

        // --- Palette access
        self.alertIllegal(registers.BCPS);
        self.alertIllegal(registers.BCPD);
        self.alertIllegal(registers.OCPS);
        self.alertIllegal(registers.OCPD);

        // --- Memory banking
        self.alertIllegal(registers.VBK);
        self.alertIllegal(registers.SVBK);

        // --- Speed control
        self.alertIllegal(registers.KEY1);

        // --- Lockout controls
        self.alertIllegal(registers.LCD_MODE);
        self.alertIllegal(registers.LOCK);

        lock(0x11);
    };
};

module.exports = CPU;
