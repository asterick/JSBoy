include("src/mappers/rom.js");
include("src/mappers/mbc1.js");
include("src/mappers/mbc2.js");
include("src/mappers/mbc3.js");
//include("src/mappers/mbc4.js");
include("src/mappers/mbc5.js");
//include("src/mappers/mmm01.js");
//include("src/mappers/camera.js");
//include("src/mappers/tama5.js");
//include("src/mappers/huc3.js");
//include("src/mappers/huc1.js");

var NONE = 0;
var RAM = 1;
var BATTERY = 2;
var TIMER = 4;
var RUMBLE = 8;

function mapper( name, cpu, rom )
{
    var description = {
        mapper: rom[0x0147],
        romSize: rom.length, //rom[0x0148],
        ramSize: [0,2048,8192,32768][rom[0x0149]]
    };
    
    var setups = {
          '1': { call:   mapperMBC1, flags:               NONE }, 
          '2': { call:   mapperMBC1, flags:                RAM }, 
          '3': { call:   mapperMBC1, flags:        RAM|BATTERY }, 
          '5': { call:   mapperMBC2, flags:               NONE }, 
          '6': { call:   mapperMBC2, flags:            BATTERY }, 
          '8': { call:    mapperROM, flags:                RAM }, 
          '9': { call:    mapperROM, flags:        RAM|BATTERY },
/*
         '11': { call:  mapperMMM01, flags:               NONE }, 
         '12': { call:  mapperMMM01, flags:                RAM }, 
         '13': { call:  mapperMMM01, flags:        RAM|BATTERY },
         '15': { call:   mapperMBC3, flags:      TIMER|BATTERY }, 
         '16': { call:   mapperMBC3, flags:  TIMER|RAM|BATTERY }, 
*/
         '17': { call:   mapperMBC3, flags:               NONE }, 
         '18': { call:   mapperMBC3, flags:                RAM }, 
         '19': { call:   mapperMBC3, flags:        RAM|BATTERY },
/*
         '21': { call:   mapperMBC4, flags:               NONE }, 
         '22': { call:   mapperMBC4, flags:                RAM }, 
         '23': { call:   mapperMBC4, flags:        RAM|BATTERY }, 
*/
         '25': { call:   mapperMBC5, flags:               NONE }, 
         '26': { call:   mapperMBC5, flags:                RAM }, 
         '27': { call:   mapperMBC5, flags:        RAM|BATTERY },
/*
         '28': { call:   mapperMBC5, flags:             RUMBLE }, 
         '29': { call:   mapperMBC5, flags:         RUMBLE|RAM }, 
         '30': { call:   mapperMBC5, flags: RUMBLE|RAM|BATTERY } 
        '252': { call: mapperCAMERA, flags:               NONE }, 
        '253': { call:  mapperTAMA5, flags:               NONE }, 
        '254': { call:   mapperHuC3, flags:               NONE }, 
        '255': { call:   mapperHuC1, flags:        RAM|BATTERY },
*/    
          '0': { call:    mapperROM, flags:               NONE }
    };
      
    // Convert rom into data delegates (padded out to 32k, or next highest power of 2)
    rom = romBlock(rom, byteAlignment(rom.length, 0x4000) );
    
    var code = description.mapper;
    var setup = setups[code];

    if( setups[code] === undefined )
    {
        log( "Mapper type", code, "is unsupported." );
        return null;
    }
    
    return new (setup.call)(name, cpu, rom, description.ramSize, setups[code].flags, description );
}
