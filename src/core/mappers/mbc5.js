/***
 ***   MBC3 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY, RUMBLE
 ***
 ***/

import * as memory from "../../util/memory";
import * as flags from "./flags";

export default class mapperMBC5 {
    constructor( name, cpu, rom, ramSize, mapperFlags, description ) {
        this.ram = memory.ramBlock( ramSize, 0x2000, name );
        this.banks = rom.chunk(0x40);

        this.cpu = cpu;
        this.flags = mapperFlags;

        if( this.flags & flags.BATTERY )
            this.ram.load();
    }

    close()
    {
        if( this.flags & flags.BATTERY )
            this.ram.save();
    };

    reset()
    {
        this.ramEnabled = false;
        this.romBank = 0;
        this.ramBank = 0;

        // --- Static mapping
        this.cpu.read.copy(0, this.banks[0]);

        var ramEnableReg = (new Array(0x100)).fill(this.ramEnableReg.bind(this)),
            lowerRomBankSelect = (new Array(0x100)).fill(this.lowerRomBankSelect.bind(this)),
            upperRomBankSelect = (new Array(0x100)).fill(this.upperRomBankSelect.bind(this)),
            ramBankSelectReg = (new Array(0x100)).fill(this.ramBankSelectReg.bind(this));

        this.cpu.write.fill(ramEnableReg,       0x00, 0x20);
        this.cpu.write.fill(lowerRomBankSelect, 0x20, 0x20);
        this.cpu.write.fill(upperRomBankSelect, 0x40, 0x20);
        this.cpu.write.fill(ramBankSelectReg,   0x60, 0x20);

        this.updateMemoryMap();
    };

    updateMemoryMap()
    {
        this.cpu.read.copy( 0x40, this.banks[(this.romBank || 1) % this.banks.length] );

        if (this.ram && this.ramEnabled) {
            var ramBankAddr = (this.ramBank * 0x20) % this.ram.data.length;
            this.cpu.read.copy( 0xA0, this.ram.readChunks, ramBankAddr, 0x20 );
            this.cpu.write.copy( 0xA0, this.ram.writeChunks, ramBankAddr, 0x20 );
        } else {
            this.cpu.read.fill(this.cpu.nullBlock, 0xA0, 0x20);
            this.cpu.write.fill(this.cpu.nullBlock, 0xA0, 0x20);
        }
    };

    ramEnableReg( data )
    {
        if( !this.ram )
            return ;

        this.ramEnabled = (data == 0xA);
        this.updateMemoryMap();
    };

    lowerRomBankSelect( data )
    {
        this.romBank = (this.romBank & 0xFF00) | (data);
        this.updateMemoryMap();
    };

    upperRomBankSelect( data )
    {
        this.romBank = (this.romBank & 0x00FF) | (data << 8);
        this.updateMemoryMap();
    };

    ramBankSelectReg( data )
    {
        this.ramBank = data;
        this.updateMemoryMap();
    };
}
