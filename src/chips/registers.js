define({
// --- Communication port registers
    SB: 0xFF01,
    SC: 0xFF02,
    RP: 0xFF56,   // (CGB)

// --- Video control registers
    LCDC: 0xFF40,
    STAT: 0xFF41,
    SCY: 0xFF42,
    SCX: 0xFF43,
    LY: 0xFF44,
    LYC: 0xFF45,
    WY: 0xFF4A,
    WX: 0xFF4B,

// --- Block memory registers
    DMA: 0xFF46,
    HDMA1: 0xFF51,   // (CGB)
    HDMA2: 0xFF52,   // (CGB)
    HDMA3: 0xFF53,   // (CGB)
    HDMA4: 0xFF54,   // (CGB)
    HDMA5: 0xFF55,   // (CGB)

// --- Palette registers
    BGP: 0xFF47,
    OBP0: 0xFF48,
    OBP1: 0xFF49,
    BCPS: 0xFF68,   // (CGB)
    BCPD: 0xFF69,   // (CGB)
    OCPS: 0xFF6A,   // (CGB)
    OCPD: 0xFF6B,   // (CGB)

// --- Timer control registers
    DIV: 0xFF04,
    TIMA: 0xFF05,
    TMA: 0xFF06,
    TAC: 0xFF07,

// --- Memory bank registers
    VBK: 0xFF4F,   // (CGB)
    SVBK: 0xFF70,   // (CGB)

// --- CPU and IRQ Registers
    KEY1: 0xFF4D,   // (CGB)
    IF: 0xFF0F,
    IE: 0xFFFF,

// --- Joypad registers
    JOYP: 0xFF00,

// --- Undocumented registers
    LCD_MODE: 0xFF4C,   // (UNDOCUMENTED)
    BLCK: 0xFF50,   // (UNDOCUMENTED)
    LOCK: 0xFF6C,   // (UNDOCUMENTED)

// --- Sound registers
    NR10: 0xFF10,
    NR11: 0xFF11,
    NR12: 0xFF12,
    NR13: 0xFF13,
    NR14: 0xFF14,
    NR21: 0xFF16,
    NR22: 0xFF17,
    NR23: 0xFF18,
    NR24: 0xFF19,
    NR30: 0xFF1A,
    NR31: 0xFF1B,
    NR32: 0xFF1C,
    NR33: 0xFF1D,
    NR34: 0xFF1E,
    NR41: 0xFF20,
    NR42: 0xFF21,
    NR43: 0xFF22,
    NR44: 0xFF23,
    NR50: 0xFF24,
    NR51: 0xFF25,
    NR52: 0xFF26,

// --- Wave table memory
    AUD3WAVERAM0: 0xFF30,
    AUD3WAVERAM1: 0xFF31,
    AUD3WAVERAM2: 0xFF32,
    AUD3WAVERAM3: 0xFF33,
    AUD3WAVERAM4: 0xFF34,
    AUD3WAVERAM5: 0xFF35,
    AUD3WAVERAM6: 0xFF36,
    AUD3WAVERAM7: 0xFF37,
    AUD3WAVERAM8: 0xFF38,
    AUD3WAVERAM9: 0xFF39,
    AUD3WAVERAMA: 0xFF3A,
    AUD3WAVERAMB: 0xFF3B,
    AUD3WAVERAMC: 0xFF3C,
    AUD3WAVERAMD: 0xFF3D,
    AUD3WAVERAME: 0xFF3E,
    AUD3WAVERAMF: 0xFF3F
});
