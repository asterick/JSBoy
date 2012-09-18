define([
    "util/keyboard",
    "chips/registers"
], function(keyboard, registers) {
    function Joypad(cpu)
    {    
        // --- Internal data storage
        this.selectDir = 0;
        this.selectButton = 0;
    
        this.dataDir = 0xF;
        this.dataButton = 0xF;
    
        this.cpu = cpu;
        this.keyboard = new Array();

        window.addEventListener( 'keydown', this.$('keydown'), false);
        window.addEventListener( 'keyup', this.$('keyup'), false);
    }

    // default joystick to keyboard mapping
    Joypad.prototype.mapping_A = keyboard.X;
    Joypad.prototype.mapping_B = keyboard.Z;
    Joypad.prototype.mapping_Select = keyboard.SHIFT;
    Joypad.prototype.mapping_Start = keyboard.ENTER;

    Joypad.prototype.mapping_Up = keyboard.UP_ARROW;
    Joypad.prototype.mapping_Down = keyboard.DOWN_ARROW;
    Joypad.prototype.mapping_Left = keyboard.LEFT_ARROW;
    Joypad.prototype.mapping_Right = keyboard.RIGHT_ARROW;

    Joypad.prototype.reset = function()
    {
        this.selectDir = 0;
        this.selectButton = 0;
        this.dataDir = 0xF;
        this.dataButton = 0xF;
    
        this.cpu.registers.read[registers.JOYP] = this.$('read_JOYP');
        this.cpu.registers.write[registers.JOYP] = this.$('write_JOYP');
    }

    Joypad.prototype.disableActions = function(keyEventArgs)
    {
        var root = document.getElementsByTagName('body')[0];

        if( root === document.activeElement )
        {
            keyEventArgs.preventDefault();
            return false;
        }
    }

    Joypad.prototype.keydown = function(keyEventArgs)
    {
        this.keyboard[keyEventArgs.keyCode] = true;
        this.update();

        return this.disableActions(keyEventArgs);
    }

    Joypad.prototype.keyup = function(keyEventArgs)
    {
        this.keyboard[keyEventArgs.keyCode] = false;
        this.update();

        return this.disableActions(keyEventArgs);
    }

    Joypad.prototype.update = function()
    {
        var oD = this.dataDir, oB = this.dataButton;
    
        this.dataDir = 0xF;
        this.dataButton = 0xF;

        if( this.keyboard[this.mapping_A] )
            this.dataButton &= ~1;
        if( this.keyboard[this.mapping_B] )
            this.dataButton &= ~2;        
        if( this.keyboard[this.mapping_Select])
            this.dataButton &= ~4;
        if( this.keyboard[this.mapping_Start] )
            this.dataButton &= ~8;        

        // --- NOTE: Exclusively encoded
        if( this.keyboard[this.mapping_Right] )
            this.dataDir &= ~1;
        else if( this.keyboard[this.mapping_Left] )
            this.dataDir &= ~2;
        if( this.keyboard[this.mapping_Up] )
            this.dataDir &= ~4;
        else if( this.keyboard[this.mapping_Down] )
            this.dataDir &= ~8;
    
        if( (oD ^ this.dataDir) || (oB ^ this.dataButton) )
            this.cpu.trigger(IRQ_JOYSTICK);
    }

    Joypad.prototype.read_JOYP = function()
    {
        var data = 0xF;
    
        if( !this.selectDir )
            data &= this.dataDir;
        if( !this.selectButton )
            data &= this.dataButton;
    
        return data |
               (this.selectDir ? 0x10 : 0) |
               (this.selectButton ? 0x20 : 0);
    }

    Joypad.prototype.write_JOYP = function(data)
    {
        this.selectDir = data & 0x10;
        this.selectButton = data & 0x20;
    }

    return Joypad;
});
