/***
 ***   ROM based mapper:  Contains no bank switching logic
 ***
 ***   Capabilities supported  RAM, BATTERY
 ***
 ***/

import * as memory from "../../util/memory";
import * as flags from "./flags";

export default class mapperROM {
    constructor( name, cpu, rom, ramSize, mapperFlags, description ) {
        this.rom = rom;
        this.ram = memory.ramBlock( ramSize, 0x2000, name );
        this.cpu = cpu;
        this.flags = mapperFlags;

        if( this.flags & flags.BATTERY ) {
            this.ram.load();
        }
    }

    close()
    {
        if (this.flags & flags.BATTERY) {
            this.ram.save();
        }
    }

    reset()
    {
        this.cpu.read.copy (0, this.rom, 0, 0x80);

        var ramMask = this.ramMask;

        if (this.ram) {
            this.cpu.readChunks.copy(0xA0, this.ram.read, 0x20);
            this.cpu.writeChunks.copy(0xA0, this.ram.write, 0x20);
        }
    }
}
