// --- Communication port registers
const REG_SB        = 0xFF01;
const REG_SC        = 0xFF02;
const REG_RP        = 0xFF56;   // (CGB)

// --- Video control registers
const REG_LCDC      = 0xFF40;
const REG_STAT      = 0xFF41;
const REG_SCY       = 0xFF42;
const REG_SCX       = 0xFF43;
const REG_LY        = 0xFF44;
const REG_LYC       = 0xFF45;
const REG_WY        = 0xFF4A;
const REG_WX        = 0xFF4B;

// --- Block memory registers
const REG_DMA       = 0xFF46;
const REG_HDMA1     = 0xFF51;   // (CGB)
const REG_HDMA2     = 0xFF52;   // (CGB)
const REG_HDMA3     = 0xFF53;   // (CGB)
const REG_HDMA4     = 0xFF54;   // (CGB)
const REG_HDMA5     = 0xFF55;   // (CGB)

// --- Palette registers
const REG_BGP       = 0xFF47;
const REG_OBP0      = 0xFF48;
const REG_OBP1      = 0xFF49;
const REG_BCPS      = 0xFF68;   // (CGB)
const REG_BCPD      = 0xFF69;   // (CGB)
const REG_OCPS      = 0xFF6A;   // (CGB)
const REG_OCPD      = 0xFF6B;   // (CGB)

// --- Timer control registers
const REG_DIV       = 0xFF04;
const REG_TIMA      = 0xFF05;
const REG_TMA       = 0xFF06;
const REG_TAC       = 0xFF07;

// --- Memory bank registers
const REG_VBK       = 0xFF4F;   // (CGB)
const REG_SVBK      = 0xFF70;   // (CGB)

// --- CPU and IRQ Registers
const REG_KEY1      = 0xFF4D;   // (CGB)
const REG_IF        = 0xFF0F;
const REG_IE        = 0xFFFF;

// --- Joypad registers
const REG_JOYP      = 0xFF00;

// --- Undocumented registers
const REG_LCD_MODE  = 0xFF4C;   // (UNDOCUMENTED)
const REG_BLCK      = 0xFF50;   // (UNDOCUMENTED)
const REG_LOCK      = 0xFF6C;   // (UNDOCUMENTED)

// --- Sound registers
const REG_NR10      = 0xFF10;
const REG_NR11      = 0xFF11;
const REG_NR12      = 0xFF12;
const REG_NR13      = 0xFF13;
const REG_NR14      = 0xFF14;
const REG_NR21      = 0xFF16;
const REG_NR22      = 0xFF17;
const REG_NR23      = 0xFF18;
const REG_NR24      = 0xFF19;
const REG_NR30      = 0xFF1A;
const REG_NR31      = 0xFF1B;
const REG_NR32      = 0xFF1C;
const REG_NR33      = 0xFF1D;
const REG_NR34      = 0xFF1E;
const REG_NR41      = 0xFF20;
const REG_NR42      = 0xFF21;
const REG_NR43      = 0xFF22;
const REG_NR44      = 0xFF23;
const REG_NR50      = 0xFF24;
const REG_NR51      = 0xFF25;
const REG_NR52      = 0xFF26;

// --- Wave table memory
const REG_AUD3WAVERAM0 = 0xFF30;
const REG_AUD3WAVERAM1 = 0xFF31;
const REG_AUD3WAVERAM2 = 0xFF32;
const REG_AUD3WAVERAM3 = 0xFF33;
const REG_AUD3WAVERAM4 = 0xFF34;
const REG_AUD3WAVERAM5 = 0xFF35;
const REG_AUD3WAVERAM6 = 0xFF36;
const REG_AUD3WAVERAM7 = 0xFF37;
const REG_AUD3WAVERAM8 = 0xFF38;
const REG_AUD3WAVERAM9 = 0xFF39;
const REG_AUD3WAVERAMA = 0xFF3A;
const REG_AUD3WAVERAMB = 0xFF3B;
const REG_AUD3WAVERAMC = 0xFF3C;
const REG_AUD3WAVERAMD = 0xFF3D;
const REG_AUD3WAVERAME = 0xFF3E;
const REG_AUD3WAVERAMF = 0xFF3F;
