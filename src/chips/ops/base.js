// --- Instruction map for base block
jsboyCPU.prototype.rlca = function() {
    var n = ((this.a >> 7) | (this.a << 1)) & 0xFF;
    this.cf = (this.a & 0x80);
    this.zf = false;
    this.nf = false;
    this.hf = false;
    this.a = n;    
}

jsboyCPU.prototype.rrca = function() {
    var n = ((this.a >> 1) | (this.a << 7)) & 0xFF;
    this.cf = (this.a & 1);
    this.zf = false;
    this.nf = false;
    this.hf = false;
    this.a = n;    
}

jsboyCPU.prototype.rla = function() {
    var n = ((this.cf ? 1 : 0) | (this.a << 1)) & 0xFF;
    this.cf = (this.a & 0x80);
    this.zf = false;
    this.nf = false;
    this.hf = false;
    this.a = n;
}

jsboyCPU.prototype.rra = function() {
    var n = (this.a >> 1) | (this.cf ? 0x80 : 0);
    this.cf = (this.a & 1);
    this.zf = false;
    this.nf = false;
    this.hf = false;
    this.a = n;
}

jsboyCPU.prototype.add16 = function( v ) {
    var q = this.hl();
    var r = q + v;

    this.nf = false;
    this.hf = ((q & 0xFFF) + (v & 0xFFF)) >= 0x1000;    
    this.cf = r >= 0x10000;

    this.h = (r >> 8) & 0xFF;
    this.l = r & 0xFF;
}

jsboyCPU.prototype.addSP = function() {
    var q = this.sp;
    var v = this.nextSignedByte();
    var r = q + v;

    this.zf = false;
    this.nf = false;
    this.cf = ((q & 0xFF) + (v & 0xFF)) >= 0x100;
    this.hf = ((q & 0xF) + (v & 0xF)) >= 0x10;

    return r & 0xFFFF;
}

jsboyCPU.prototype.incHL = function() {
    var v = (this.hl() + 1) & 0xFFFF;
    this.h = v >> 8;
    this.l = v & 0xFF;
}

jsboyCPU.prototype.decHL = function() {
    var v = (this.hl() - 1) & 0xFFFF;
    this.h = v >> 8;
    this.l = v & 0xFF;
}

jsboyCPU.prototype.incDE = function() {
    var v = (this.de() + 1) & 0xFFFF;
    this.d = v >> 8;
    this.e = v & 0xFF;
}

jsboyCPU.prototype.decDE = function() {
    var v = (this.de() - 1) & 0xFFFF;
    this.d = v >> 8;
    this.e = v & 0xFF;
}

jsboyCPU.prototype.incBC = function() {
    var v = (this.bc() + 1) & 0xFFFF;
    this.b = v >> 8;
    this.c = v & 0xFF;
}

jsboyCPU.prototype.decBC = function() {
    var v = (this.bc() - 1) & 0xFFFF;
    this.b = v >> 8;
    this.c = v & 0xFF;
}

jsboyCPU.prototype.inc = function( v ){
    var o = (v + 1) & 0xFF;

    this.zf = !o;
    this.nf = false;
    this.hf = (v & 0xF0) != (o & 0xF0);

    return o;
}

jsboyCPU.prototype.dec = function( v ){
    var o = (v - 1) & 0xFF;

    this.zf = !o;
    this.nf = true;
    this.hf = (v & 0xF0) != (o & 0xF0);

    return o;
}

jsboyCPU.prototype.and = function( v ){
    this.a &= v;
    this.zf = !this.a;
    this.nf = false;
    this.hf = true;
    this.cf = false;
}

jsboyCPU.prototype.or = function(v) {
    this.a |= v;
    this.zf = !this.a;
    this.nf = false;
    this.hf = false;
    this.cf = false;
}

jsboyCPU.prototype.xor = function(v) {
    this.a ^= v;
    this.zf = !this.a;
    this.nf = false;
    this.hf = false;
    this.cf = false;
}

jsboyCPU.prototype.add = function( v ) {
    this.hf = ((this.a & 0xF) + (v & 0xF)) >= 0x10;

    this.a = this.a + v;
    this.cf = this.a >= 0x100;
    this.nf = false;
    this.a &= 0xFF;

    this.zf = !this.a;
}

jsboyCPU.prototype.adc = function( v ) {
    this.hf = ((this.a & 0xF) + (v & 0xF) + (this.cf ? 1 : 0)) >= 0x10;

    this.a = this.a + v + (this.cf ? 1 : 0);
    this.cf = this.a >= 0x100;
    this.nf = false;
    this.a &= 0xFF;

    this.zf = !this.a;
}

jsboyCPU.prototype.sub = function( v ) {
    this.hf = ((this.a & 0xF) - (v & 0xF)) < 0;

    this.a = this.a - v;
    this.cf = this.a < 0;
    this.nf = true;
    this.a &= 0xFF;

    this.zf = !this.a;
}

jsboyCPU.prototype.sbc = function( v ) {
    this.hf = ((this.a & 0xF) - (v & 0xF) - (this.cf ? 1 : 0)) < 0;

    this.a = this.a - v - (this.cf ? 1 : 0);
    this.cf = this.a < 0;
    this.nf = true;
    this.a &= 0xFF;

    this.zf = !this.a;
}

jsboyCPU.prototype.cp = function( v ){
    this.hf = ((this.a & 0xF) - (v & 0xF)) < 0;

    var o = this.a - v;
    this.cf = o < 0;
    this.nf = true;
    this.zf = !(o & 0xFF);
}

jsboyCPU.prototype.cpl = function() {
    this.a = this.a ^ 0xFF;
    this.hf = true;
    this.nf = true;
}

// --- THIS INSTRUCTION REQUIRES A CONFIDENCE CHECK!
jsboyCPU.prototype.daa = function() {
    var result = this.a;

    if ( this.nf )
    {
        if ( this.hf ) {
            result -= 6;
            if ( !this.cf )
                result &= 0xFF;
        }

        if ( this.cf )
            result -= 0x60;
    } else {
        if ( this.hf || ( result & 0x0F ) > 9 )
            result += 6;
        if ( this.cf || result > 0x9F )
            result += 0x60;
    }
    
    this.a = result & 0xFF;
    this.zf = (this.a == 0);
    this.cf = this.cf || ((result & 0xFF00) != 0);
    this.hf = false;
}

jsboyCPU.prototype.stepBase = function(){
    var opCode = this.nextByte();
    
    switch(opCode)
    {
    case 0x00:
        this.cycles += this.CYCLES_1;
        break ;

    // --- Load instructions
    case 0x40:
        this.cycles += this.CYCLES_1;
        break ;
    case 0x41:
        this.b = this.c;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x42:
        this.b = this.d;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x43:
        this.b = this.e;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x44:
        this.b = this.h;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x45:
        this.b = this.l;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x46:
        this.b = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x47:
        this.b = this.a;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x48:
        this.c = this.b;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x49:
        this.cycles += this.CYCLES_1;
        break ;
    case 0x4A:
        this.c = this.d;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x4B:
        this.c = this.e;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x4C:
        this.c = this.h;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x4D:
        this.c = this.l;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x4E:
        this.c = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x4F:
        this.c = this.a;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x50:
        this.d = this.b;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x51:
        this.d = this.c;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x52:
        this.cycles += this.CYCLES_1;
        break ;
    case 0x53:
        this.d = this.e;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x54:
        this.d = this.h;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x55:
        this.d = this.l;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x56:
        this.d = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x57:
        this.d = this.a;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x58:
        this.e = this.b;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x59:
        this.e = this.c;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x5A:
        this.e = this.d;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x5B:
        this.cycles += this.CYCLES_1;
        break ;
    case 0x5C:
        this.e = this.h;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x5D:
        this.e = this.l;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x5E:
        this.e = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x5F:
        this.e = this.a;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x60:
        this.h = this.b;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x61:
        this.h = this.c;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x62:
        this.h = this.d;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x63:
        this.h = this.e;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x64:
        this.cycles += this.CYCLES_1;
        break ;
    case 0x65:
        this.h = this.l;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x66:
        this.h = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x67:
        this.h = this.a;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x68:
        this.l = this.b;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x69:
        this.l = this.c;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x6A:
        this.l = this.d;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x6B:
        this.l = this.e;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x6C:
        this.l = this.h;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x6D:
        this.cycles += this.CYCLES_1;
        break ;
    case 0x6E:
        this.l = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x6F:
        this.l = this.a;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x70:
        this.write[this.hl()](this.b);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x71:
        this.write[this.hl()](this.c);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x72:
        this.write[this.hl()](this.d);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x73:
        this.write[this.hl()](this.e);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x74:
        this.write[this.hl()](this.h);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x75:
        this.write[this.hl()](this.l);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x77:
        this.write[this.hl()](this.a);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x78:
        this.a = this.b;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x79:
        this.a = this.c;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x7A:
        this.a = this.d;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x7B:
        this.a = this.e;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x7C:
        this.a = this.h;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x7D:
        this.a = this.l;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x7E:
        this.a = this.read[this.hl()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x7F:
        this.cycles += this.CYCLES_1;
        break ;

    case 0x06:
        this.b = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x0E:
        this.c = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x16:
        this.d = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x1E:
        this.e = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x26:
        this.h = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x2E:
        this.l = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x36:
        this.write[this.hl()](this.nextByte());
        this.cycles += this.CYCLES_3;
        break ;
    case 0x3E:
        this.a = this.nextByte();
        this.cycles += this.CYCLES_2;
        break ;
    
    case 0x01:
        this.c = this.nextByte(); this.b = this.nextByte();
        this.cycles += this.CYCLES_3;
        break ;
    case 0x11:
        this.e = this.nextByte(); this.d = this.nextByte();
        this.cycles += this.CYCLES_3;
        break ;
    case 0x21:
        this.l = this.nextByte(); this.h = this.nextByte();
        this.cycles += this.CYCLES_3;
        break ;
    case 0x31:
        this.sp = this.nextWord();
        this.cycles += this.CYCLES_3;
        break ;
    case 0xF9:
        this.sp = this.hl();
        this.cycles += this.CYCLES_2;
        break ;

    case 0x02:
        this.write[this.bc()](this.a);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x12:
        this.write[this.de()](this.a);
        this.cycles += this.CYCLES_2;
        break ;
    case 0x0A:
        this.a = this.read[this.bc()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x1A:
        this.a = this.read[this.de()]();
        this.cycles += this.CYCLES_2;
        break ;
    case 0xEA:
        this.write[this.nextWord()](this.a);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xFA:
        this.a = this.read[this.nextWord()]();
        this.cycles += this.CYCLES_4;
        break ;

    case 0xE0:
        this.write[0xFF00 | this.nextByte()](this.a);
        this.cycles += this.CYCLES_3;
        break ;
    case 0xE2:
        this.write[0xFF00 | this.c](this.a);
        this.cycles += this.CYCLES_2;
        break ;
    case 0xF0:
        this.a = this.read[0xFF00|this.nextByte()]();
        this.cycles += this.CYCLES_3;
        break ;
    case 0xF2:
        this.a = this.read[0xFF00|this.c]();
        this.cycles += this.CYCLES_3;
        break ;

    case 0x08:
        var o = this.nextWord();
        this.write[o](this.sp&0xFF);
        this.write[(o+1)&0xFFFF](this.sp>>8);
        this.cycles += this.CYCLES_5;
        break ;
    
    // --- LDI and LDD instructions
    case 0x22:
        this.write[this.hl()](this.a);
        this.incHL();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x2A:
        this.a = this.read[this.hl()]();
        this.incHL();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x32:
        this.write[this.hl()](this.a);
        this.decHL();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x3A:
        this.a = this.read[this.hl()]();
        this.decHL();
        this.cycles += this.CYCLES_2;
        break ;

    // --- ALU operations
    case 0x80:
        this.add(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x81:
        this.add(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x82:
        this.add(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x83:
        this.add(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x84:
        this.add(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x85:
        this.add(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x86:
        this.add(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x87:
        this.add(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x88:
        this.adc(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x89:
        this.adc(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x8A:
        this.adc(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x8B:
        this.adc(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x8C:
        this.adc(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x8D:
        this.adc(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x8E:
        this.adc(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x8F:
        this.adc(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x90:
        this.sub(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x91:
        this.sub(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x92:
        this.sub(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x93:
        this.sub(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x94:
        this.sub(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x95:
        this.sub(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x96:
        this.sub(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x97:
        this.sub(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x98:
        this.sbc(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x99:
        this.sbc(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x9A:
        this.sbc(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x9B:
        this.sbc(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x9C:
        this.sbc(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x9D:
        this.sbc(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x9E:
        this.sbc(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x9F:
        this.sbc(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA0:
        this.and(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA1:
        this.and(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA2:
        this.and(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA3:
        this.and(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA4:
        this.and(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA5:
        this.and(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA6:
        this.and(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xA7:
        this.and(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA8:
        this.xor(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xA9:
        this.xor(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xAA:
        this.xor(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xAB:
        this.xor(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xAC:
        this.xor(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xAD:
        this.xor(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xAE:
        this.xor(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xAF:
        this.xor(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB0:
        this.or(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB1:
        this.or(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB2:
        this.or(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB3:
        this.or(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB4:
        this.or(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB5:
        this.or(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB6:
        this.or(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xB7:
        this.or(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB8:
        this.cp(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xB9:
        this.cp(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xBA:
        this.cp(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xBB:
        this.cp(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xBC:
        this.cp(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xBD:
        this.cp(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xBE:
        this.cp(this.read[this.hl()]());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xBF:
        this.cp(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0xC6:
        this.add(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xCE:
        this.adc(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xD6:
        this.sub(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xDE:
        this.sbc(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xE6:
        this.and(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xEE:
        this.xor(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xF6:
        this.or(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    case 0xFE:
        this.cp(this.nextByte());
        this.cycles += this.CYCLES_2;
        break ;
    
    // --- Branch Instructions
    case 0x18:
        this.pc = this.nextRelative();
        this.cycles += this.CYCLES_3;
        break ;
    case 0x20:
        var o = this.nextRelative(); if(!this.zf) { this.pc = o; this.cycles += this.CYCLES_3; } else this.cycles += this.CYCLES_2;
        break ;
    case 0x28:
        var o = this.nextRelative(); if(this.zf) { this.pc = o; this.cycles += this.CYCLES_3; } else this.cycles += this.CYCLES_2;
        break ;
    case 0x30:
        var o = this.nextRelative(); if(!this.cf) { this.pc = o; this.cycles += this.CYCLES_3; } else this.cycles += this.CYCLES_2;
        break ;
    case 0x38:
        var o = this.nextRelative(); if(this.cf) { this.pc = o; this.cycles += this.CYCLES_3; } else this.cycles += this.CYCLES_2;
        break ;
    case 0xC3:
        this.pc = this.nextWord();
        this.cycles += this.CYCLES_4;
        break ;
    case 0xC2:
        var o = this.nextWord(); if(!this.zf) { this.pc = o; this.cycles += this.CYCLES_4; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xCA:
        var o = this.nextWord(); if(this.zf) { this.pc = o; this.cycles += this.CYCLES_4; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xD2:
        var o = this.nextWord(); if(!this.cf) { this.pc = o; this.cycles += this.CYCLES_4; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xDA:
        var o = this.nextWord(); if(this.cf) { this.pc = o; this.cycles += this.CYCLES_4; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xE9:
        this.pc = this.hl();
        this.cycles += this.CYCLES_1;
        break ;
    
    // --- RST Instructions
    case 0xC7:
        this.call(0x00);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xCF:
        this.call(0x08);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xD7:
        this.call(0x10);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xDF:
        this.call(0x18);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xE7:
        this.call(0x20);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xEF:
        this.call(0x28);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xF7:
        this.call(0x30);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xFF:
        this.call(0x38);
        this.cycles += this.CYCLES_4;
        break ;

    // --- Call instructions
    case 0xCD:
        this.call(this.nextWord());
        this.cycles += this.CYCLES_6;
        break ;
    case 0xC4:
        var o = this.nextWord(); if(!this.zf) { this.call(o); this.cycles += this.CYCLES_6; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xCC:
        var o = this.nextWord(); if(this.zf) { this.call(o); this.cycles += this.CYCLES_6; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xD4:
        var o = this.nextWord(); if(!this.cf) { this.call(o); this.cycles += this.CYCLES_6; } else this.cycles += this.CYCLES_3;
        break ;
    case 0xDC:
        var o = this.nextWord(); if(this.cf) { this.call(o); this.cycles += this.CYCLES_6; } else this.cycles += this.CYCLES_3;
        break ;

    // --- Return instructions
    case 0xC9:
        this.ret();
        this.cycles += this.CYCLES_4;
        break ;
    case 0xD9:
        this.ret();
        this.irq_master = true;
        this.cycles += this.CYCLES_4;
        this.invalidate();
        break ;
    case 0xC0:
        if(!this.zf) { this.ret(); this.cycles += this.CYCLES_5; } else this.cycles += this.CYCLES_2;
        break ;
    case 0xC8:
        if(this.zf) { this.ret(); this.cycles += this.CYCLES_5; } else this.cycles += this.CYCLES_2;
        break ;
    case 0xD0:
        if(!this.cf) { this.ret(); this.cycles += this.CYCLES_5; } else this.cycles += this.CYCLES_2;
        break ;
    case 0xD8:
        if(this.cf) { this.ret(); this.cycles += this.CYCLES_5; } else this.cycles += this.CYCLES_2;
        break ;
    
    // --- Halt instructions
    case 0x10:
        // Put the CPU in halt mode
        if( this.prepareSpeed )
            this.setCPUSpeed(!this.doubleSpeed);

        // Note: this SHOULD fall through
    case 0x76:
        if( !this.irq_master )
            this.delayByte();
        this.halted = true;
        this.cycles += this.CYCLES_1;
        this.invalidate();
        break ;

    // --- Increment/Decrement block
    case 0x04:
        this.b = this.inc(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x05:
        this.b = this.dec(this.b);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x0C:
        this.c = this.inc(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x0D:
        this.c = this.dec(this.c);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x14:
        this.d = this.inc(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x15:
        this.d = this.dec(this.d);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x1C:
        this.e = this.inc(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x1D:
        this.e = this.dec(this.e);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x24:
        this.h = this.inc(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x25:
        this.h = this.dec(this.h);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x2C:
        this.l = this.inc(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x2D:
        this.l = this.dec(this.l);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x34:
        this.write[this.hl()](this.inc(this.read[this.hl()]()));
        this.cycles += this.CYCLES_3;
        break ;
    case 0x35:
        this.write[this.hl()](this.dec(this.read[this.hl()]()));
        this.cycles += this.CYCLES_3;
        break ;
    case 0x3C:
        this.a = this.inc(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x3D:
        this.a = this.dec(this.a);
        this.cycles += this.CYCLES_1;
        break ;
    case 0x03:
        this.incBC();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x0B:
        this.decBC();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x13:
        this.incDE();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x1B:
        this.decDE();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x23:
        this.incHL();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x2B:
        this.decHL();
        this.cycles += this.CYCLES_2;
        break ;
    case 0x33:
        this.sp = (this.sp + 1) & 0xFFFF;
        this.cycles += this.CYCLES_2;
        break ;
    case 0x3B:
        this.sp = (this.sp - 1) & 0xFFFF;
        this.cycles += this.CYCLES_2;
        break ;

    // --- Stack operations
    case 0xC1:
        this.c = this.pop(); this.b = this.pop();
        this.cycles += this.CYCLES_3;
        break ;
    case 0xC5:
        this.push(this.b); this.push(this.c);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xD1:
        this.e = this.pop(); this.d = this.pop();
        this.cycles += this.CYCLES_3;
        break ;
    case 0xD5:
        this.push(this.d); this.push(this.e);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xE1:
        this.l = this.pop(); this.h = this.pop();
        this.cycles += this.CYCLES_3;
        break ;
    case 0xE5:
        this.push(this.h); this.push(this.l);
        this.cycles += this.CYCLES_4;
        break ;
    case 0xF1:
        this.setF(this.pop()); this.a = this.pop();
        this.cycles += this.CYCLES_3;
        break ;
    case 0xF5:
        this.push(this.a); this.push(this.getF());
        this.cycles += this.CYCLES_4;
        break ;

    // --- Shifter Instructions
    case 0x07:
        this.rlca();
        this.cycles += this.CYCLES_1;
        break ;
    case 0x0F:
        this.rrca();
        this.cycles += this.CYCLES_1;
        break ;
    case 0x17:
        this.rla();
        this.cycles += this.CYCLES_1;
        break ;
    case 0x1F:
        this.rra();
        this.cycles += this.CYCLES_1;
        break ;

    // --- 16bit ALU
    case 0x09:
        this.add16(this.bc());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x19:
        this.add16(this.de());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x29:
        this.add16(this.hl());
        this.cycles += this.CYCLES_2;
        break ;
    case 0x39:
        this.add16(this.sp);
        this.cycles += this.CYCLES_2;
        break ;
    case 0xE8:
        this.sp = this.addSP();
        this.cycles += this.CYCLES_4;
        break ;
    case 0xF8:
        var o = this.addSP(); 
        this.l = o & 0xFF; 
        this.h = o >> 8;
        this.cycles += this.CYCLES_3;
        break ;

    // --- Flags
    case 0x37:
        this.cf = true;
        this.nf = false;
        this.hf = false;
        this.cycles += this.CYCLES_1;
        break ;
    case 0x3F:
        this.cf = !this.cf;
        this.nf = false;
        this.hf = false;
        this.cycles += this.CYCLES_1;
        break ;
    case 0xF3:
        this.irq_master = false;
        this.cycles += this.CYCLES_1;
        this.invalidate();
        break ;
    case 0xFB:
        this.irq_master = true;
        this.cycles += this.CYCLES_1;
        this.invalidate();
        break ;

    // --- Special registers
    case 0x27:
        this.daa();
        this.cycles += this.CYCLES_1;
        break ;
    case 0x2F:
        this.cpl();
        this.cycles += this.CYCLES_1;
        break ;
    case 0xCB:
        this.stepExtended();
        break ;

    // --- Invalid instruction
    default:
        this.halted = true;
        this.invalidate();
        throw "The system crashed.";
    }
}
