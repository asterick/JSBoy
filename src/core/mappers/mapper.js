var flags = require("./flags"),
    memory = require("../../util/memory"),
    mapperROM = require("./rom"),
    mapperMBC1 = require("./mbc1"),
    mapperMBC2 = require("./mbc2"),
    mapperMBC3 = require("./mbc3"),
    mapperMBC5 = require("./mbc5");

function byteAlignment(size, base)
{
    if( base === undefined )
        base = 1;

    while( base < size )
        base <<= 1;

    return base;
}

function mapper( name, cpu, rom )
{
    rom = new Uint8Array(rom);

    var description = {
        mapper: rom[0x0147],
        romSize: rom.length, //rom[0x0148],
        ramSize: [0,2048,8192,32768][rom[0x0149]]
    };

    var setups = {
          '1': { call:   mapperMBC1, flags:                           flags.NONE },
          '2': { call:   mapperMBC1, flags:                            flags.RAM },
          '3': { call:   mapperMBC1, flags:              flags.RAM|flags.BATTERY },
          '5': { call:   mapperMBC2, flags:                           flags.NONE },
          '6': { call:   mapperMBC2, flags:                        flags.BATTERY },
          '8': { call:    mapperROM, flags:                            flags.RAM },
          '9': { call:    mapperROM, flags:              flags.RAM|flags.BATTERY },
/*
         '11': { call:  mapperMMM01, flags:                           flags.NONE },
         '12': { call:  mapperMMM01, flags:                            flags.RAM },
         '13': { call:  mapperMMM01, flags:              flags.RAM|flags.BATTERY },
         '15': { call:   mapperMBC3, flags:            flags.TIMER|flags.BATTERY },
         '16': { call:   mapperMBC3, flags:  flags.TIMER|flags.RAM|flags.BATTERY },
*/
         '17': { call:   mapperMBC3, flags:                           flags.NONE },
         '18': { call:   mapperMBC3, flags:                            flags.RAM },
         '19': { call:   mapperMBC3, flags:              flags.RAM|flags.BATTERY },
/*
         '21': { call:   mapperMBC4, flags:                           flags.NONE },
         '22': { call:   mapperMBC4, flags:                            flags.RAM },
         '23': { call:   mapperMBC4, flags:              flags.RAM|flags.BATTERY },
*/
         '25': { call:   mapperMBC5, flags:                           flags.NONE },
         '26': { call:   mapperMBC5, flags:                            flags.RAM },
         '27': { call:   mapperMBC5, flags:              flags.RAM|flags.BATTERY },
/*
         '28': { call:   mapperMBC5, flags:                         flags.RUMBLE },
         '29': { call:   mapperMBC5, flags:               flags.RUMBLE|flags.RAM },
         '30': { call:   mapperMBC5, flags: flags.RUMBLE|flags.RAM|flags.BATTERY },
        '252': { call: mapperCAMERA, flags:                           flags.NONE },
        '253': { call:  mapperTAMA5, flags:                           flags.NONE },
        '254': { call:   mapperHuC3, flags:                           flags.NONE },
        '255': { call:   mapperHuC1, flags:              flags.RAM|flags.BATTERY },
*/
          '0': { call:    mapperROM, flags:                           flags.NONE }
    };

    // Convert rom into data delegates (padded out to 32k, or next highest power of 2)
    rom = memory.romBlock(rom, byteAlignment(rom.length, 0x4000) );

    var code = description.mapper;
    var setup = setups[code];

    if( setups[code] === undefined )
    {
        console.log( "Mapper type", code, "is unsupported." );
        return null;
    }

    return new (setup.call)(name, cpu, rom, description.ramSize, setups[code].flags, description );
}

module.exports = mapper;
