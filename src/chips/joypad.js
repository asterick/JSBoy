define([
    "util/keyboard",
    "chips/registers"
], function(keyboard, registers) {
    function jsboyJoypad(cpu)
    {    
        // --- Internal data storage
        this.selectDir = 0;
        this.selectButton = 0;
    
        this.dataDir = 0;
        this.dataButton = 0;
    
        this.cpu = cpu;
        this.keyboard = new Array();

        window.addEventListener( 'keydown', this.$('keydown'), false);
        window.addEventListener( 'keyup', this.$('keyup'), false);
    }

    // default joystick to keyboard mapping
    jsboyJoypad.prototype.mapping_A = keyboard.X;
    jsboyJoypad.prototype.mapping_B = keyboard.Z;
    jsboyJoypad.prototype.mapping_Select = keyboard.SHIFT;
    jsboyJoypad.prototype.mapping_Start = keyboard.ENTER;

    jsboyJoypad.prototype.mapping_Up = keyboard.UP_ARROW;
    jsboyJoypad.prototype.mapping_Down = keyboard.DOWN_ARROW;
    jsboyJoypad.prototype.mapping_Left = keyboard.LEFT_ARROW;
    jsboyJoypad.prototype.mapping_Right = keyboard.RIGHT_ARROW;

    jsboyJoypad.prototype.reset = function()
    {
        this.selectDir = 0;
        this.selectButton = 0;
        this.dataDir = 0;
        this.dataButton = 0;
    
        this.cpu.read[registers.JOYP] = this.$('read_JOYP');
        this.cpu.write[registers.JOYP] = this.$('write_JOYP');
    }

    jsboyJoypad.prototype.disableActions = function(keyEventArgs)
    {
        var root = document.getElementsByTagName('body')[0];

        if( root === document.activeElement )
        {
            keyEventArgs.preventDefault();
            return false;
        }
    }

    jsboyJoypad.prototype.keydown = function(keyEventArgs)
    {
        this.keyboard[keyEventArgs.keyCode] = true;
        this.update();

        return this.disableActions(keyEventArgs);
    }

    jsboyJoypad.prototype.keyup = function(keyEventArgs)
    {
        this.keyboard[keyEventArgs.keyCode] = false;
        this.update();

        return this.disableActions(keyEventArgs);
    }

    jsboyJoypad.prototype.update = function()
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

    jsboyJoypad.prototype.read_JOYP = function()
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

    jsboyJoypad.prototype.write_JOYP = function(data)
    {
        this.selectDir = data & 0x10;
        this.selectButton = data & 0x20;
    }

    return jsboyJoypad;
});
