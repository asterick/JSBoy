module.exports = {
// --- Communication port registers
    SB: 0x01,
    SC: 0x02,
    RP: 0x56,   // (CGB)

// --- Video control registers
    LCDC: 0x40,
    STAT: 0x41,
    SCY: 0x42,
    SCX: 0x43,
    LY: 0x44,
    LYC: 0x45,
    WY: 0x4A,
    WX: 0x4B,

// --- Block memory registers
    DMA: 0x46,
    HDMA1: 0x51,   // (CGB)
    HDMA2: 0x52,   // (CGB)
    HDMA3: 0x53,   // (CGB)
    HDMA4: 0x54,   // (CGB)
    HDMA5: 0x55,   // (CGB)

// --- Palette registers
    BGP: 0x47,
    OBP0: 0x48,
    OBP1: 0x49,
    BCPS: 0x68,   // (CGB)
    BCPD: 0x69,   // (CGB)
    OCPS: 0x6A,   // (CGB)
    OCPD: 0x6B,   // (CGB)

// --- Timer control registers
    DIV: 0x04,
    TIMA: 0x05,
    TMA: 0x06,
    TAC: 0x07,

// --- Memory bank registers
    VBK: 0x4F,   // (CGB)
    SVBK: 0x70,   // (CGB)

// --- CPU and IRQ Registers
    KEY1: 0x4D,   // (CGB)
    IF: 0x0F,
    IE: 0xFF,

// --- Joypad registers
    JOYP: 0x00,

// --- Undocumented registers
    LCD_MODE: 0x4C,   // (UNDOCUMENTED)
    BLCK: 0x50,   // (UNDOCUMENTED)
    LOCK: 0x6C,   // (UNDOCUMENTED)

// --- Sound registers
    NR10: 0x10,
    NR11: 0x11,
    NR12: 0x12,
    NR13: 0x13,
    NR14: 0x14,
    NR21: 0x16,
    NR22: 0x17,
    NR23: 0x18,
    NR24: 0x19,
    NR30: 0x1A,
    NR31: 0x1B,
    NR32: 0x1C,
    NR33: 0x1D,
    NR34: 0x1E,
    NR41: 0x20,
    NR42: 0x21,
    NR43: 0x22,
    NR44: 0x23,
    NR50: 0x24,
    NR51: 0x25,
    NR52: 0x26,

// --- Wave table memory
    AUD3WAVERAM0: 0x30,
    AUD3WAVERAM1: 0x31,
    AUD3WAVERAM2: 0x32,
    AUD3WAVERAM3: 0x33,
    AUD3WAVERAM4: 0x34,
    AUD3WAVERAM5: 0x35,
    AUD3WAVERAM6: 0x36,
    AUD3WAVERAM7: 0x37,
    AUD3WAVERAM8: 0x38,
    AUD3WAVERAM9: 0x39,
    AUD3WAVERAMA: 0x3A,
    AUD3WAVERAMB: 0x3B,
    AUD3WAVERAMC: 0x3C,
    AUD3WAVERAMD: 0x3D,
    AUD3WAVERAME: 0x3E,
    AUD3WAVERAMF: 0x3F
};
