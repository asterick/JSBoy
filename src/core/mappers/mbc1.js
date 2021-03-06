/***
 ***   MBC1 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

import * as memory from "../../util/memory";
import * as flags from "./flags";

export default class mapperMBC1 {
    constructor ( name, cpu, rom, ramSize, mapperFlags, description ) {
        this.ram = memory.ramBlock( ramSize, 0x2000, name );
        this.banks = rom.chunk(0x40);
        this.cpu = cpu;
        this.flags = mapperFlags;

        if( this.flags & flags.BATTERY )
            this.ram.load();
    }

    close ()
    {
        if( this.flags & flags.BATTERY )
            this.ram.save();
    }

    reset ()
    {
        this.ramEnabled = false;
        this.ramSelect = false;
        this.romBank = 1;
        this.upperBank = 0;

        // --- Static mapping
        this.cpu.read.copy( 0, this.banks[0] );

        var ramEnableReg = (new Array(0x100)).fill(this.ramEnableReg.bind(this)),
            romBankSelectReg = (new Array(0x100)).fill(this.romBankSelectReg.bind(this)),
            upperBankSelectReg = (new Array(0x100)).fill(this.upperBankSelectReg.bind(this)),
            ramModeSelectReg = (new Array(0x100)).fill(this.ramModeSelectReg.bind(this));

        this.cpu.write.fill(ramEnableReg,       0x00, 0x20);
        this.cpu.write.fill(romBankSelectReg,   0x20, 0x20);
        this.cpu.write.fill(upperBankSelectReg, 0x40, 0x20);
        this.cpu.write.fill(ramModeSelectReg,   0x60, 0x20);

        this.updateMemoryMap();
    }

    updateMemoryMap ()
    {
        var ramBankAddr = (this.ramSelect ? this.upperBank : 0) * 0x20;
        var romBankAddr = this.romBank | (this.ramSelect ? 0 : (this.upperBank << 5));

        this.cpu.read.copy( 0x40, this.banks[romBankAddr % this.banks.length] );

        // --- Ram enable!
        if( this.ram )
        {
            if( this.ramEnabled )
            {
                this.cpu.read.copy( 0xA0, this.ram.read, ramBankAddr, 0x20 );
                this.cpu.write.copy( 0xA0, this.ram.write, ramBankAddr, 0x20 );
            }
            else
            {
                this.cpu.read.fill(this.cpu.nullBlock, 0xA0, 0x20);
                this.cpu.write.fill(this.cpu.nullBlock, 0xA0, 0x20);
            }
        }
    }

    ramEnableReg ( data )
    {
        if( !this.ram )
            return ;

        this.ramEnabled = (data & 0xF == 0xA);
        this.updateMemoryMap();
    }

    ramModeSelectReg ( data )
    {
        if( !this.ram )
            return ;

        this.ramSelect = data & 1;
        this.updateMemoryMap();
    }

    romBankSelectReg ( data )
    {
        this.romBank = (data & 0x1F) || 1;
        this.updateMemoryMap();
    }

    upperBankSelectReg ( data )
    {
        this.upperBank = data & 3;
        this.updateMemoryMap();
    }
}
