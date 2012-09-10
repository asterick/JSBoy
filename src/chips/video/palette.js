define([
    "chips/registers"
], function (registers) {
    function Palette(cpu) {
        this.cpu = cpu;

        // --- Create a blank palette
        var palMemory = new ArrayBuffer(0x100);
        this.byteMemory = new Uint8Array(palMemory);
        this.paletteMemory = new Uint16Array(palMemory);

        for (var i = 0; i < this.paletteMemory.length; i++) {
            this.paletteMemory[i] = 0x7FFF;
        }

        // DMG Palette registers
        this.reg_BGP = 0;
        this.reg_OBP0 = 0;
        this.reg_OBP1 = 0;

        // CGB Palette registers (upper half always white)
        this.reg_BCPS = 0;
        this.reg_BCPS_increment = false;
        this.reg_OCPS = 0;
        this.reg_OCPS_increment = false;
    }

    Palette.prototype.reset = function (){
        // DMG Palette registers
        this.cpu.read[registers.BGP] = this.$('read_BGP');
        this.cpu.write[registers.BGP] = this.$('write_BGP');
        this.cpu.read[registers.OBP0] = this.$('read_OBP0');
        this.cpu.write[registers.OBP0] = this.$('write_OBP0');
        this.cpu.read[registers.OBP1] = this.$('read_OBP1');
        this.cpu.write[registers.OBP1] = this.$('write_OBP1');

        // CGB Palette registers
        this.cpu.read[registers.BCPS] = this.$('read_BCPS');
        this.cpu.write[registers.BCPS] = this.$('write_BCPS');
        this.cpu.read[registers.BCPD] = this.$('read_BCPD');
        this.cpu.write[registers.BCPD] = this.$('write_BCPD');
        this.cpu.read[registers.OCPS] = this.$('read_OCPS');
        this.cpu.write[registers.OCPS] = this.$('write_OCPS');
        this.cpu.read[registers.OCPD] = this.$('read_OCPD');
        this.cpu.write[registers.OCPD] = this.$('write_OCPD');
    };

    // --- DMG Palette paletteMemory registers
    Palette.prototype.read_BGP = function () {
        return this.reg_BGP;
    };

    Palette.prototype.write_BGP = function (data) {
        this.cpu.catchUp();
        this.reg_BGP = data;
    };

    Palette.prototype.read_OBP0 = function () {
        return this.reg_OBP0;
    };

    Palette.prototype.write_OBP0 = function (data) {
        this.cpu.catchUp();
        this.reg_OBP0 = data;
    };

    Palette.prototype.read_OBP1 = function () {
        return this.reg_OBP1;
    };

    Palette.prototype.write_OBP1 = function (data) {
        this.cpu.catchUp();
        this.reg_OBP1 = data;
    };

    // --- CGB Palette paletteMemory registers
    Palette.prototype.read_BCPS = function () {
        return this.reg_BCPS | (this.reg_BCPS_increment ? 0x80 : 0);
    };

    Palette.prototype.write_BCPS = function (data) {
        this.reg_BCPS_increment = (data & 0x80);
        this.reg_BCPS = data & 0x3F;
    };

    Palette.prototype.read_OCPS = function () {
        return this.reg_OCPS | (this.reg_OCPS_increment ? 0x80 : 0);
    };

    Palette.prototype.write_OCPS = function (data) {
        this.reg_OCPS_increment = (data & 0x80);
        this.reg_OCPS = data & 0x3F;
    };

    Palette.prototype.read_BCPD = function () {
        return this.byteMemory[this.reg_BCPS];
    };

    Palette.prototype.write_BCPD = function (data) {
        this.cpu.catchUp();

        this.byteMemory[this.reg_BCPS] = data;

        if (this.reg_BCPS_increment) {
            this.reg_BCPS = (this.reg_BCPS+1) & 0x3F;
        }
    };

    Palette.prototype.read_OCPD = function () {
        return this.byteMemory[0x40|this.reg_OCPS];
    };

    Palette.prototype.write_OCPD = function (data) {
        this.cpu.catchUp();

        this.byteMemory[0x40|this.reg_OCPS] = data;
    
        if (this.reg_OCPS_increment) {
            this.reg_OCPS = (this.reg_OCPS+1) & 0x3F;
        }
    };

    return Palette;
});
