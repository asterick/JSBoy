/***
 ***  Shifter ALU Instructions
 ***  These instruction fall in the 0xCB xx instruction range,
 ***/

var CPU = {};

CPU.swap = function( v )
{
    var n = ((v >> 4) | (v << 4)) & 0xFF;

    this.zf = (n === 0);
    this.hf = false;
    this.nf = false;
    this.cf = false;

    return n;
};

CPU.sla = function( v )
{
    var n = (v << 1) & 0xFF;

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 0x80);

    return n;
};

CPU.sra = function( v )
{
    var n = (v >> 1) | (v & 0x80);

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 1);

    return n;
};

CPU.srl = function( v )
{
    var n = (v >> 1);

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 1);

    return n;
};

CPU.rrc = function( v )
{
    var n = ((v >> 1) | (v << 7)) & 0xFF;

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 1);

    return n;
};

CPU.rlc = function( v )
{
    var n = ((v >> 7) | (v << 1)) & 0xFF;

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 0x80);

    return n;
};

CPU.rr = function( v )
{
    var n = (this.cf ? 0x80 : 0) | (v >> 1);

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 1);

    return n;
};

CPU.rl = function( v )
{
    var n = ((this.cf ? 1 : 0) | (v << 1)) & 0xFF;

    this.zf = !n;
    this.hf = false;
    this.nf = false;
    this.cf = (v & 0x80);

    return n;
};

CPU.bit = function( v, bit )
{
    this.zf = !(v & (1 << bit));
    this.hf = true;
    this.nf = false;
};

CPU.set = function( v, bit )
{
    return v | (1<<bit);
};

CPU.rst = function( v, bit )
{
    return v & ~(1<<bit);
};

// --- Instruction map for the extended (0xCB) block
CPU.stepExtended = function()
{
    switch(this.nextByte())
    {
    case 0x00:
        this.b = this.rlc(this.b);
        return 2;
    case 0x01:
        this.c = this.rlc(this.c);
        return 2;
    case 0x02:
        this.d = this.rlc(this.d);
        return 2;
    case 0x03:
        this.e = this.rlc(this.e);
        return 2;
    case 0x04:
        this.h = this.rlc(this.h);
        return 2;
    case 0x05:
        this.l = this.rlc(this.l);
        return 2;
    case 0x06:
        this.write[this.h][this.l](this.rlc(this.read[this.h][this.l]()));
        return 4;
    case 0x07:
        this.a = this.rlc(this.a);
        return 2;
    case 0x08:
        this.b = this.rrc(this.b);
        return 2;
    case 0x09:
        this.c = this.rrc(this.c);
        return 2;
    case 0x0A:
        this.d = this.rrc(this.d);
        return 2;
    case 0x0B:
        this.e = this.rrc(this.e);
        return 2;
    case 0x0C:
        this.h = this.rrc(this.h);
        return 2;
    case 0x0D:
        this.l = this.rrc(this.l);
        return 2;
    case 0x0E:
        this.write[this.h][this.l](this.rrc(this.read[this.h][this.l]()));
        return 4;
    case 0x0F:
        this.a = this.rrc(this.a);
        return 2;
    case 0x10:
        this.b = this.rl(this.b);
        return 2;
    case 0x11:
        this.c = this.rl(this.c);
        return 2;
    case 0x12:
        this.d = this.rl(this.d);
        return 2;
    case 0x13:
        this.e = this.rl(this.e);
        return 2;
    case 0x14:
        this.h = this.rl(this.h);
        return 2;
    case 0x15:
        this.l = this.rl(this.l);
        return 2;
    case 0x16:
        this.write[this.h][this.l](this.rl(this.read[this.h][this.l]()));
        return 4;
    case 0x17:
        this.a = this.rl(this.a);
        return 2;
    case 0x18:
        this.b = this.rr(this.b);
        return 2;
    case 0x19:
        this.c = this.rr(this.c);
        return 2;
    case 0x1A:
        this.d = this.rr(this.d);
        return 2;
    case 0x1B:
        this.e = this.rr(this.e);
        return 2;
    case 0x1C:
        this.h = this.rr(this.h);
        return 2;
    case 0x1D:
        this.l = this.rr(this.l);
        return 2;
    case 0x1E:
        this.write[this.h][this.l](this.rr(this.read[this.h][this.l]()));
        return 4;
    case 0x1F:
        this.a = this.rr(this.a);
        return 2;

    case 0x20:
        this.b = this.sla(this.b);
        return 2;

    case 0x21:
        this.c = this.sla(this.c);
        return 2;

    case 0x22:
        this.d = this.sla(this.d);
        return 2;

    case 0x23:
        this.e = this.sla(this.e);
        return 2;

    case 0x24:
        this.h = this.sla(this.h);
        return 2;

    case 0x25:
        this.l = this.sla(this.l);
        return 2;

    case 0x26:
        this.write[this.h][this.l](this.sla(this.read[this.h][this.l]()));
        return 4;

    case 0x27:
        this.a = this.sla(this.a);
        return 2;

    case 0x28:
        this.b = this.sra(this.b);
        return 2;

    case 0x29:
        this.c = this.sra(this.c);
        return 2;

    case 0x2A:
        this.d = this.sra(this.d);
        return 2;

    case 0x2B:
        this.e = this.sra(this.e);
        return 2;

    case 0x2C:
        this.h = this.sra(this.h);
        return 2;

    case 0x2D:
        this.l = this.sra(this.l);
        return 2;

    case 0x2E:
        this.write[this.h][this.l](this.sra(this.read[this.h][this.l]()));
        return 4;

    case 0x2F:
        this.a = this.sra(this.a);
        return 2;

    case 0x30:
        this.b = this.swap(this.b);
        return 2;

    case 0x31:
        this.c = this.swap(this.c);
        return 2;

    case 0x32:
        this.d = this.swap(this.d);
        return 2;

    case 0x33:
        this.e = this.swap(this.e);
        return 2;

    case 0x34:
        this.h = this.swap(this.h);
        return 2;

    case 0x35:
        this.l = this.swap(this.l);
        return 2;

    case 0x36:
        this.write[this.h][this.l](this.swap(this.read[this.h][this.l]()));
        return 4;

    case 0x37:
        this.a = this.swap(this.a);
        return 2;

    case 0x38:
        this.b = this.srl(this.b);
        return 2;

    case 0x39:
        this.c = this.srl(this.c);
        return 2;

    case 0x3A:
        this.d = this.srl(this.d);
        return 2;

    case 0x3B:
        this.e = this.srl(this.e);
        return 2;

    case 0x3C:
        this.h = this.srl(this.h);
        return 2;

    case 0x3D:
        this.l = this.srl(this.l);
        return 2;

    case 0x3E:
        this.write[this.h][this.l](this.srl(this.read[this.h][this.l]()));
        return 4;

    case 0x3F:
        this.a = this.srl(this.a);
        return 2;

    case 0x40:
        this.bit(this.b,0);
        return 2;

    case 0x41:
        this.bit(this.c,0);
        return 2;

    case 0x42:
        this.bit(this.d,0);
        return 2;

    case 0x43:
        this.bit(this.e,0);
        return 2;

    case 0x44:
        this.bit(this.h,0);
        return 2;

    case 0x45:
        this.bit(this.l,0);
        return 2;

    case 0x46:
        this.bit(this.read[this.h][this.l](),0);
        return 3;

    case 0x47:
        this.bit(this.a,0);
        return 2;

    case 0x48:
        this.bit(this.b,1);
        return 2;

    case 0x49:
        this.bit(this.c,1);
        return 2;

    case 0x4A:
        this.bit(this.d,1);
        return 2;

    case 0x4B:
        this.bit(this.e,1);
        return 2;

    case 0x4C:
        this.bit(this.h,1);
        return 2;

    case 0x4D:
        this.bit(this.l,1);
        return 2;

    case 0x4E:
        this.bit(this.read[this.h][this.l](),1);
        return 3;

    case 0x4F:
        this.bit(this.a,1);
        return 2;

    case 0x50:
        this.bit(this.b,2);
        return 2;

    case 0x51:
        this.bit(this.c,2);
        return 2;

    case 0x52:
        this.bit(this.d,2);
        return 2;

    case 0x53:
        this.bit(this.e,2);
        return 2;

    case 0x54:
        this.bit(this.h,2);
        return 2;

    case 0x55:
        this.bit(this.l,2);
        return 2;

    case 0x56:
        this.bit(this.read[this.h][this.l](),2);
        return 3;

    case 0x57:
        this.bit(this.a,2);
        return 2;

    case 0x58:
        this.bit(this.b,3);
        return 2;

    case 0x59:
        this.bit(this.c,3);
        return 2;

    case 0x5A:
        this.bit(this.d,3);
        return 2;

    case 0x5B:
        this.bit(this.e,3);
        return 2;

    case 0x5C:
        this.bit(this.h,3);
        return 2;

    case 0x5D:
        this.bit(this.l,3);
        return 2;

    case 0x5E:
        this.bit(this.read[this.h][this.l](),3);
        return 3;

    case 0x5F:
        this.bit(this.a,3);
        return 2;

    case 0x60:
        this.bit(this.b,4);
        return 2;

    case 0x61:
        this.bit(this.c,4);
        return 2;

    case 0x62:
        this.bit(this.d,4);
        return 2;

    case 0x63:
        this.bit(this.e,4);
        return 2;

    case 0x64:
        this.bit(this.h,4);
        return 2;

    case 0x65:
        this.bit(this.l,4);
        return 2;

    case 0x66:
        this.bit(this.read[this.h][this.l](),4);
        return 3;

    case 0x67:
        this.bit(this.a,4);
        return 2;

    case 0x68:
        this.bit(this.b,5);
        return 2;

    case 0x69:
        this.bit(this.c,5);
        return 2;

    case 0x6A:
        this.bit(this.d,5);
        return 2;

    case 0x6B:
        this.bit(this.e,5);
        return 2;

    case 0x6C:
        this.bit(this.h,5);
        return 2;

    case 0x6D:
        this.bit(this.l,5);
        return 2;

    case 0x6E:
        this.bit(this.read[this.h][this.l](),5);
        return 3;

    case 0x6F:
        this.bit(this.a,5);
        return 2;

    case 0x70:
        this.bit(this.b,6);
        return 2;

    case 0x71:
        this.bit(this.c,6);
        return 2;

    case 0x72:
        this.bit(this.d,6);
        return 2;

    case 0x73:
        this.bit(this.e,6);
        return 2;

    case 0x74:
        this.bit(this.h,6);
        return 2;

    case 0x75:
        this.bit(this.l,6);
        return 2;

    case 0x76:
        this.bit(this.read[this.h][this.l](),6);
        return 3;

    case 0x77:
        this.bit(this.a,6);
        return 2;

    case 0x78:
        this.bit(this.b,7);
        return 2;

    case 0x79:
        this.bit(this.c,7);
        return 2;

    case 0x7A:
        this.bit(this.d,7);
        return 2;

    case 0x7B:
        this.bit(this.e,7);
        return 2;

    case 0x7C:
        this.bit(this.h,7);
        return 2;

    case 0x7D:
        this.bit(this.l,7);
        return 2;

    case 0x7E:
        this.bit(this.read[this.h][this.l](),7);
        return 3;

    case 0x7F:
        this.bit(this.a,7);
        return 2;

    case 0x80:
        this.b = this.rst(this.b,0);
        return 2;

    case 0x81:
        this.c = this.rst(this.c,0);
        return 2;

    case 0x82:
        this.d = this.rst(this.d,0);
        return 2;

    case 0x83:
        this.e = this.rst(this.e,0);
        return 2;

    case 0x84:
        this.h = this.rst(this.h,0);
        return 2;

    case 0x85:
        this.l = this.rst(this.l,0);
        return 2;

    case 0x86:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),0));
        return 4;

    case 0x87:
        this.a = this.rst(this.a,0);
        return 2;

    case 0x88:
        this.b = this.rst(this.b,1);
        return 2;

    case 0x89:
        this.c = this.rst(this.c,1);
        return 2;

    case 0x8A:
        this.d = this.rst(this.d,1);
        return 2;

    case 0x8B:
        this.e = this.rst(this.e,1);
        return 2;

    case 0x8C:
        this.h = this.rst(this.h,1);
        return 2;

    case 0x8D:
        this.l = this.rst(this.l,1);
        return 2;

    case 0x8E:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),1));
        return 4;

    case 0x8F:
        this.a = this.rst(this.a,1);
        return 2;

    case 0x90:
        this.b = this.rst(this.b,2);
        return 2;

    case 0x91:
        this.c = this.rst(this.c,2);
        return 2;

    case 0x92:
        this.d = this.rst(this.d,2);
        return 2;

    case 0x93:
        this.e = this.rst(this.e,2);
        return 2;

    case 0x94:
        this.h = this.rst(this.h,2);
        return 2;

    case 0x95:
        this.l = this.rst(this.l,2);
        return 2;

    case 0x96:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),2));
        return 4;

    case 0x97:
        this.a = this.rst(this.a,2);
        return 2;

    case 0x98:
        this.b = this.rst(this.b,3);
        return 2;

    case 0x99:
        this.c = this.rst(this.c,3);
        return 2;

    case 0x9A:
        this.d = this.rst(this.d,3);
        return 2;

    case 0x9B:
        this.e = this.rst(this.e,3);
        return 2;

    case 0x9C:
        this.h = this.rst(this.h,3);
        return 2;

    case 0x9D:
        this.l = this.rst(this.l,3);
        return 2;

    case 0x9E:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),3));
        return 4;

    case 0x9F:
        this.a = this.rst(this.a,3);
        return 2;

    case 0xA0:
        this.b = this.rst(this.b,4);
        return 2;

    case 0xA1:
        this.c = this.rst(this.c,4);
        return 2;

    case 0xA2:
        this.d = this.rst(this.d,4);
        return 2;

    case 0xA3:
        this.e = this.rst(this.e,4);
        return 2;

    case 0xA4:
        this.h = this.rst(this.h,4);
        return 2;

    case 0xA5:
        this.l = this.rst(this.l,4);
        return 2;

    case 0xA6:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),4));
        return 4;

    case 0xA7:
        this.a = this.rst(this.a,4);
        return 2;

    case 0xA8:
        this.b = this.rst(this.b,5);
        return 2;

    case 0xA9:
        this.c = this.rst(this.c,5);
        return 2;

    case 0xAA:
        this.d = this.rst(this.d,5);
        return 2;

    case 0xAB:
        this.e = this.rst(this.e,5);
        return 2;

    case 0xAC:
        this.h = this.rst(this.h,5);
        return 2;

    case 0xAD:
        this.l = this.rst(this.l,5);
        return 2;

    case 0xAE:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),5));
        return 4;

    case 0xAF:
        this.a = this.rst(this.a,5);
        return 2;

    case 0xB0:
        this.b = this.rst(this.b,6);
        return 2;

    case 0xB1:
        this.c = this.rst(this.c,6);
        return 2;

    case 0xB2:
        this.d = this.rst(this.d,6);
        return 2;

    case 0xB3:
        this.e = this.rst(this.e,6);
        return 2;

    case 0xB4:
        this.h = this.rst(this.h,6);
        return 2;

    case 0xB5:
        this.l = this.rst(this.l,6);
        return 2;

    case 0xB6:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),6));
        return 4;

    case 0xB7:
        this.a = this.rst(this.a,6);
        return 2;

    case 0xB8:
        this.b = this.rst(this.b,7);
        return 2;

    case 0xB9:
        this.c = this.rst(this.c,7);
        return 2;

    case 0xBA:
        this.d = this.rst(this.d,7);
        return 2;

    case 0xBB:
        this.e = this.rst(this.e,7);
        return 2;

    case 0xBC:
        this.h = this.rst(this.h,7);
        return 2;

    case 0xBD:
        this.l = this.rst(this.l,7);
        return 2;

    case 0xBE:
        this.write[this.h][this.l](this.rst(this.read[this.h][this.l](),7));
        return 4;

    case 0xBF:
        this.a = this.rst(this.a,7);
        return 2;

    case 0xC0:
        this.b = this.set(this.b,0);
        return 2;

    case 0xC1:
        this.c = this.set(this.c,0);
        return 2;

    case 0xC2:
        this.d = this.set(this.d,0);
        return 2;

    case 0xC3:
        this.e = this.set(this.e,0);
        return 2;

    case 0xC4:
        this.h = this.set(this.h,0);
        return 2;

    case 0xC5:
        this.l = this.set(this.l,0);
        return 2;

    case 0xC6:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),0));
        return 4;

    case 0xC7:
        this.a = this.set(this.a,0);
        return 2;

    case 0xC8:
        this.b = this.set(this.b,1);
        return 2;

    case 0xC9:
        this.c = this.set(this.c,1);
        return 2;

    case 0xCA:
        this.d = this.set(this.d,1);
        return 2;

    case 0xCB:
        this.e = this.set(this.e,1);
        return 2;

    case 0xCC:
        this.h = this.set(this.h,1);
        return 2;

    case 0xCD:
        this.l = this.set(this.l,1);
        return 2;

    case 0xCE:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),1));
        return 4;

    case 0xCF:
        this.a = this.set(this.a,1);
        return 2;

    case 0xD0:
        this.b = this.set(this.b,2);
        return 2;

    case 0xD1:
        this.c = this.set(this.c,2);
        return 2;

    case 0xD2:
        this.d = this.set(this.d,2);
        return 2;

    case 0xD3:
        this.e = this.set(this.e,2);
        return 2;

    case 0xD4:
        this.h = this.set(this.h,2);
        return 2;

    case 0xD5:
        this.l = this.set(this.l,2);
        return 2;

    case 0xD6:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),2));
        return 4;

    case 0xD7:
        this.a = this.set(this.a,2);
        return 2;

    case 0xD8:
        this.b = this.set(this.b,3);
        return 2;

    case 0xD9:
        this.c = this.set(this.c,3);
        return 2;

    case 0xDA:
        this.d = this.set(this.d,3);
        return 2;

    case 0xDB:
        this.e = this.set(this.e,3);
        return 2;

    case 0xDC:
        this.h = this.set(this.h,3);
        return 2;

    case 0xDD:
        this.l = this.set(this.l,3);
        return 2;

    case 0xDE:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),3));
        return 4;

    case 0xDF:
        this.a = this.set(this.a,3);
        return 2;

    case 0xE0:
        this.b = this.set(this.b,4);
        return 2;

    case 0xE1:
        this.c = this.set(this.c,4);
        return 2;

    case 0xE2:
        this.d = this.set(this.d,4);
        return 2;

    case 0xE3:
        this.e = this.set(this.e,4);
        return 2;

    case 0xE4:
        this.h = this.set(this.h,4);
        return 2;

    case 0xE5:
        this.l = this.set(this.l,4);
        return 2;

    case 0xE6:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),4));
        return 4;

    case 0xE7:
        this.a = this.set(this.a,4);
        return 2;

    case 0xE8:
        this.b = this.set(this.b,5);
        return 2;

    case 0xE9:
        this.c = this.set(this.c,5);
        return 2;

    case 0xEA:
        this.d = this.set(this.d,5);
        return 2;

    case 0xEB:
        this.e = this.set(this.e,5);
        return 2;

    case 0xEC:
        this.h = this.set(this.h,5);
        return 2;

    case 0xED:
        this.l = this.set(this.l,5);
        return 2;

    case 0xEE:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),5));
        return 4;

    case 0xEF:
        this.a = this.set(this.a,5);
        return 2;

    case 0xF0:
        this.b = this.set(this.b,6);
        return 2;

    case 0xF1:
        this.c = this.set(this.c,6);
        return 2;

    case 0xF2:
        this.d = this.set(this.d,6);
        return 2;

    case 0xF3:
        this.e = this.set(this.e,6);
        return 2;

    case 0xF4:
        this.h = this.set(this.h,6);
        return 2;

    case 0xF5:
        this.l = this.set(this.l,6);
        return 2;

    case 0xF6:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),6));
        return 4;

    case 0xF7:
        this.a = this.set(this.a,6);
        return 2;

    case 0xF8:
        this.b = this.set(this.b,7);
        return 2;

    case 0xF9:
        this.c = this.set(this.c,7);
        return 2;

    case 0xFA:
        this.d = this.set(this.d,7);
        return 2;

    case 0xFB:
        this.e = this.set(this.e,7);
        return 2;

    case 0xFC:
        this.h = this.set(this.h,7);
        return 2;

    case 0xFD:
        this.l = this.set(this.l,7);
        return 2;

    case 0xFE:
        this.write[this.h][this.l](this.set(this.read[this.h][this.l](),7));
        return 4;

    case 0xFF:
        this.a = this.set(this.a,7);
        return 2;
    }
};

module.exports = CPU;
