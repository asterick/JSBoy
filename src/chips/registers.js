// --- Communication port registers
var REG_SB        = 0xFF01;
var REG_SC        = 0xFF02;
var REG_RP        = 0xFF56;   // (CGB)

// --- Video control registers
var REG_LCDC      = 0xFF40;
var REG_STAT      = 0xFF41;
var REG_SCY       = 0xFF42;
var REG_SCX       = 0xFF43;
var REG_LY        = 0xFF44;
var REG_LYC       = 0xFF45;
var REG_WY        = 0xFF4A;
var REG_WX        = 0xFF4B;

// --- Block memory registers
var REG_DMA       = 0xFF46;
var REG_HDMA1     = 0xFF51;   // (CGB)
var REG_HDMA2     = 0xFF52;   // (CGB)
var REG_HDMA3     = 0xFF53;   // (CGB)
var REG_HDMA4     = 0xFF54;   // (CGB)
var REG_HDMA5     = 0xFF55;   // (CGB)

// --- Palette registers
var REG_BGP       = 0xFF47;
var REG_OBP0      = 0xFF48;
var REG_OBP1      = 0xFF49;
var REG_BCPS      = 0xFF68;   // (CGB)
var REG_BCPD      = 0xFF69;   // (CGB)
var REG_OCPS      = 0xFF6A;   // (CGB)
var REG_OCPD      = 0xFF6B;   // (CGB)

// --- Timer control registers
var REG_DIV       = 0xFF04;
var REG_TIMA      = 0xFF05;
var REG_TMA       = 0xFF06;
var REG_TAC       = 0xFF07;

// --- Memory bank registers
var REG_VBK       = 0xFF4F;   // (CGB)
var REG_SVBK      = 0xFF70;   // (CGB)

// --- CPU and IRQ Registers
var REG_KEY1      = 0xFF4D;   // (CGB)
var REG_IF        = 0xFF0F;
var REG_IE        = 0xFFFF;

// --- Joypad registers
var REG_JOYP      = 0xFF00;

// --- Undocumented registers
var REG_LCD_MODE  = 0xFF4C;   // (UNDOCUMENTED)
var REG_BLCK      = 0xFF50;   // (UNDOCUMENTED)
var REG_LOCK      = 0xFF6C;   // (UNDOCUMENTED)

// --- Sound registers
var REG_NR10      = 0xFF10;
var REG_NR11      = 0xFF11;
var REG_NR12      = 0xFF12;
var REG_NR13      = 0xFF13;
var REG_NR14      = 0xFF14;
var REG_NR21      = 0xFF16;
var REG_NR22      = 0xFF17;
var REG_NR23      = 0xFF18;
var REG_NR24      = 0xFF19;
var REG_NR30      = 0xFF1A;
var REG_NR31      = 0xFF1B;
var REG_NR32      = 0xFF1C;
var REG_NR33      = 0xFF1D;
var REG_NR34      = 0xFF1E;
var REG_NR41      = 0xFF20;
var REG_NR42      = 0xFF21;
var REG_NR43      = 0xFF22;
var REG_NR44      = 0xFF23;
var REG_NR50      = 0xFF24;
var REG_NR51      = 0xFF25;
var REG_NR52      = 0xFF26;

// --- Wave table memory
var REG_AUD3WAVERAM0 = 0xFF30;
var REG_AUD3WAVERAM1 = 0xFF31;
var REG_AUD3WAVERAM2 = 0xFF32;
var REG_AUD3WAVERAM3 = 0xFF33;
var REG_AUD3WAVERAM4 = 0xFF34;
var REG_AUD3WAVERAM5 = 0xFF35;
var REG_AUD3WAVERAM6 = 0xFF36;
var REG_AUD3WAVERAM7 = 0xFF37;
var REG_AUD3WAVERAM8 = 0xFF38;
var REG_AUD3WAVERAM9 = 0xFF39;
var REG_AUD3WAVERAMA = 0xFF3A;
var REG_AUD3WAVERAMB = 0xFF3B;
var REG_AUD3WAVERAMC = 0xFF3C;
var REG_AUD3WAVERAMD = 0xFF3D;
var REG_AUD3WAVERAME = 0xFF3E;
var REG_AUD3WAVERAMF = 0xFF3F;
