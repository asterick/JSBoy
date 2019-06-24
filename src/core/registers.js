// --- Communication port registers
export const SB = 0x01;
export const SC = 0x02;
export const RP = 0x56;   // (CGB)

// --- Video control registers
export const LCDC = 0x40;
export const STAT = 0x41;
export const SCY = 0x42;
export const SCX = 0x43;
export const LY = 0x44;
export const LYC = 0x45;
export const WY = 0x4A;
export const WX = 0x4B;

// --- Block memory registers
export const DMA = 0x46;
export const HDMA1 = 0x51;   // (CGB)
export const HDMA2 = 0x52;   // (CGB)
export const HDMA3 = 0x53;   // (CGB)
export const HDMA4 = 0x54;   // (CGB)
export const HDMA5 = 0x55;   // (CGB)

// --- Palette registers
export const BGP = 0x47;
export const OBP0 = 0x48;
export const OBP1 = 0x49;
export const BCPS = 0x68;   // (CGB)
export const BCPD = 0x69;   // (CGB)
export const OCPS = 0x6A;   // (CGB)
export const OCPD = 0x6B;   // (CGB)

// --- Timer control registers
export const DIV = 0x04;
export const TIMA = 0x05;
export const TMA = 0x06;
export const TAC = 0x07;

// --- Memory bank registers
export const VBK = 0x4F;   // (CGB)
export const SVBK = 0x70;   // (CGB)

// --- CPU and IRQ Registers
export const KEY1 = 0x4D;   // (CGB)
export const IF = 0x0F;
export const IE = 0xFF;

// --- Joypad registers
export const JOYP = 0x00;

// --- Undocumented registers
export const LCD_MODE = 0x4C;   // (UNDOCUMENTED)
export const BLCK = 0x50;   // (UNDOCUMENTED)
export const LOCK = 0x6C;   // (UNDOCUMENTED)

// --- Sound registers
export const NR10 = 0x10;
export const NR11 = 0x11;
export const NR12 = 0x12;
export const NR13 = 0x13;
export const NR14 = 0x14;
export const NR21 = 0x16;
export const NR22 = 0x17;
export const NR23 = 0x18;
export const NR24 = 0x19;
export const NR30 = 0x1A;
export const NR31 = 0x1B;
export const NR32 = 0x1C;
export const NR33 = 0x1D;
export const NR34 = 0x1E;
export const NR41 = 0x20;
export const NR42 = 0x21;
export const NR43 = 0x22;
export const NR44 = 0x23;
export const NR50 = 0x24;
export const NR51 = 0x25;
export const NR52 = 0x26;

// --- Wave table memory
export const AUD3WAVERAM0 = 0x30;
export const AUD3WAVERAM1 = 0x31;
export const AUD3WAVERAM2 = 0x32;
export const AUD3WAVERAM3 = 0x33;
export const AUD3WAVERAM4 = 0x34;
export const AUD3WAVERAM5 = 0x35;
export const AUD3WAVERAM6 = 0x36;
export const AUD3WAVERAM7 = 0x37;
export const AUD3WAVERAM8 = 0x38;
export const AUD3WAVERAM9 = 0x39;
export const AUD3WAVERAMA = 0x3A;
export const AUD3WAVERAMB = 0x3B;
export const AUD3WAVERAMC = 0x3C;
export const AUD3WAVERAMD = 0x3D;
export const AUD3WAVERAME = 0x3E;
export const AUD3WAVERAMF = 0x3F;
