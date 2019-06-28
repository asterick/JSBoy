import * as registers from "../registers";

export default class Palette {
    constructor (cpu) {
        this.cpu = cpu;

        // --- Create a blank palette
        var palMemory = new ArrayBuffer(0x100);
        this.paletteMemory = new Uint16Array(palMemory);
        this.tilePalette = new Uint8Array(palMemory, 0, 0x40);
        this.spritePalette = new Uint8Array(palMemory, 0x40, 0x40);

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

    reset (){
        // DMG Palette registers
        this.cpu.registers.read[registers.BGP] = this.read_BGP.bind(this);
        this.cpu.registers.write[registers.BGP] = this.write_BGP.bind(this);
        this.cpu.registers.read[registers.OBP0] = this.read_OBP0.bind(this);
        this.cpu.registers.write[registers.OBP0] = this.write_OBP0.bind(this);
        this.cpu.registers.read[registers.OBP1] = this.read_OBP1.bind(this);
        this.cpu.registers.write[registers.OBP1] = this.write_OBP1.bind(this);

        // CGB Palette registers
        this.cpu.registers.read[registers.BCPS] = this.read_BCPS.bind(this);
        this.cpu.registers.write[registers.BCPS] = this.write_BCPS.bind(this);
        this.cpu.registers.read[registers.BCPD] = this.read_BCPD.bind(this);
        this.cpu.registers.write[registers.BCPD] = this.write_BCPD.bind(this);
        this.cpu.registers.read[registers.OCPS] = this.read_OCPS.bind(this);
        this.cpu.registers.write[registers.OCPS] = this.write_OCPS.bind(this);
        this.cpu.registers.read[registers.OCPD] = this.read_OCPD.bind(this);
        this.cpu.registers.write[registers.OCPD] = this.write_OCPD.bind(this);
    }

    // --- DMG Palette paletteMemory registers
    read_BGP () {
        return this.reg_BGP;
    };

    write_BGP (data) {
        this.cpu.catchUp();
        this.reg_BGP = data;
    }

    read_OBP0 () {
        return this.reg_OBP0;
    }

    write_OBP0 (data) {
        this.cpu.catchUp();
        this.reg_OBP0 = data;
    }

    read_OBP1 () {
        return this.reg_OBP1;
    }

    write_OBP1 (data) {
        this.cpu.catchUp();
        this.reg_OBP1 = data;
    }

    // --- CGB Palette paletteMemory registers
    read_BCPS () {
        return this.reg_BCPS | (this.reg_BCPS_increment ? 0x80 : 0);
    }

    write_BCPS (data) {
        this.reg_BCPS_increment = (data & 0x80);
        this.reg_BCPS = data & 0x3F;
    }

    read_OCPS () {
        return this.reg_OCPS | (this.reg_OCPS_increment ? 0x80 : 0);
    }

    write_OCPS (data) {
        this.reg_OCPS_increment = (data & 0x80);
        this.reg_OCPS = data & 0x3F;
    }

    read_BCPD () {
        return this.tilePalette[this.reg_BCPS];
    }

    write_BCPD (data) {
        this.cpu.catchUp();

        this.tilePalette[this.reg_BCPS] = data;

        if (this.reg_BCPS_increment) {
            this.reg_BCPS = (this.reg_BCPS+1) & 0x3F;
        }
    }

    read_OCPD () {
        return this.spritePalette[this.reg_OCPS];
    }

    write_OCPD (data) {
        this.cpu.catchUp();

        this.spritePalette[this.reg_OCPS] = data;

        if (this.reg_OCPS_increment) {
            this.reg_OCPS = (this.reg_OCPS+1) & 0x3F;
        }
    }
}
