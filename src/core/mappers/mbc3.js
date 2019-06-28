/***
 ***   MBC3 based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY, TIMER
 ***
 ***/

import * as memory from "../../util/memory";
import * as flags from "./flags";

export default class mapperMBC3 {
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
        this.romBank = 1;
        this.ramBank = 0;

        // --- Static mapping
        this.cpu.read.copy( 0, this.banks[0] );

        var ramEnableReg = (new Array(0x100)).fill(this.ramEnableReg.bind(this)),
            romBankSelectReg = (new Array(0x100)).fill(this.romBankSelectReg.bind(this)),
            ramBankSelectReg = (new Array(0x100)).fill(this.ramBankSelectReg.bind(this)),
            clockLatchReg = (new Array(0x100)).fill(this.clockLatchReg.bind(this));

        this.cpu.write.fill(ramEnableReg,     0x00, 0x20);
        this.cpu.write.fill(romBankSelectReg, 0x20, 0x20);
        this.cpu.write.fill(ramBankSelectReg, 0x40, 0x20);
        this.cpu.write.fill(clockLatchReg,    0x60, 0x20);

        this.updateMemoryMap();
    };

    updateMemoryMap()
    {
        this.cpu.read.copy( 0x40, this.banks[this.romBank] );

        if( this.ram && this.ramEnabled && this.ramBank <= 3 )
        {
            var ramBankAddr = this.ramBank * 0x20;
            this.cpu.read.copy( 0xA0, this.ram.readChunks, ramBankAddr, 0x20 );
            this.cpu.write.copy( 0xA0, this.ram.writeChunks, ramBankAddr, 0x20 );
        }
        // TODO: TIMER
        else
        {
            this.cpu.read.fill(this.cpu.nullBlock, 0xA0, 0x20);
            this.cpu.write.fill(this.cpu.nullBlock, 0xA0, 0x20);
        }
    };

    ramEnableReg( data )
    {
        if( !this.ram )
            return ;

        this.ramEnabled = (data & 0xF == 0xA);
        this.updateMemoryMap();
    };

    romBankSelectReg( data )
    {
        this.romBank = ((data & 0x7F) % this.banks.length) || 1;
        this.updateMemoryMap();
    };

    ramBankSelectReg( data )
    {
        this.ramBank = (data & 0xF);
        this.updateMemoryMap();
    };

    clockLatchReg( data )
    {
        // TODO: DO TIMER
    };
}
