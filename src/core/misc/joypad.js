import * as registers from "../registers";
import * as consts from "../consts";

import * as Keyboard from "../../util/keyboard";

export default class Joystick {
    constructor(cpu) {
        // --- Internal data storage
        this.selectDir = 0;
        this.selectButton = 0;

        this.dataDir = 0xF;
        this.dataButton = 0xF;

        this.cpu = cpu;
        this.keyboard = [];

        window.addEventListener( 'keydown', this.keydown.bind(this), false);
        window.addEventListener( 'keyup', this.keyup.bind(this), false);
    }

    reset () {
        this.selectDir = 0;
        this.selectButton = 0;
        this.dataDir = 0xF;
        this.dataButton = 0xF;

        this.cpu.registers.read[registers.JOYP] = this.read_JOYP.bind(this);
        this.cpu.registers.write[registers.JOYP] = this.write_JOYP.bind(this);
    }

    disableActions (keyEventArgs)
    {
        var prevent = false;

        Object.keys(this.mapping).forEach(function (key) {
            if (this.mapping[key] === keyEventArgs.keyCode) {
                prevent = true;
            }
        }, this);

        if (prevent) {
            keyEventArgs.preventDefault();
            return false;
        }
    }

    keydown (keyEventArgs)
    {
        this.keyboard[keyEventArgs.keyCode] = true;
        this.update();

        return this.disableActions(keyEventArgs);
    }

    keyup (keyEventArgs)
    {
        this.keyboard[keyEventArgs.keyCode] = false;
        this.update();

        return this.disableActions(keyEventArgs);
    }

    update ()
    {
        var oD = this.dataDir, oB = this.dataButton;

        this.dataDir = 0xF;
        this.dataButton = 0xF;

        if( this.keyboard[this.mapping.A] )
            this.dataButton &= ~1;
        if( this.keyboard[this.mapping.B] )
            this.dataButton &= ~2;
        if( this.keyboard[this.mapping.Select])
            this.dataButton &= ~4;
        if( this.keyboard[this.mapping.Start] )
            this.dataButton &= ~8;

        // --- NOTE: Exclusively encoded
        if( this.keyboard[this.mapping.Right] )
            this.dataDir &= ~1;
        else if( this.keyboard[this.mapping.Left] )
            this.dataDir &= ~2;
        if( this.keyboard[this.mapping.Up] )
            this.dataDir &= ~4;
        else if( this.keyboard[this.mapping.Down] )
            this.dataDir &= ~8;

        if( (oD ^ this.dataDir) || (oB ^ this.dataButton) )
            this.cpu.trigger(consts.IRQ_JOYSTICK);
    }

    read_JOYP () {
        var data = 0xF;

        if( !this.selectDir )
            data &= this.dataDir;
        if( !this.selectButton )
            data &= this.dataButton;

        return data |
               (this.selectDir ? 0x10 : 0) |
               (this.selectButton ? 0x20 : 0);
    }

    write_JOYP (data) {
        this.selectDir = data & 0x10;
        this.selectButton = data & 0x20;
    }
}

// default joystick to keyboard mapping
Joypad.prototype.mapping = {
    A: Keyboard.X,
    B: Keyboard.Z,
    Select: Keyboard.SHIFT,
    Start: Keyboard.ENTER,
    Up: Keyboard.UP_ARROW,
    Down: Keyboard.DOWN_ARROW,
    Left: Keyboard.LEFT_ARROW,
    Right: Keyboard.RIGHT_ARROW
};
