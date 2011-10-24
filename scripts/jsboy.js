include('scripts/chips/cpu.js');
include('scripts/util/memory.js');
include('scripts/mappers/mappers.js')
include('scripts/debugger/disassemble.js')

function jsboy(canvas)
{
    const context = canvas.getContext("2d");
    
    // Bios will auto reset when the system initializes
    this.cpu = new jsboyCPU(context);
    this.running = false;
}

jsboy.prototype.reset = function( name, data )
{
    if( data !== undefined )
    {
        this.cpu.close();
        this.cpu.insert( mapper(name, this.cpu, data) );
    }
    else        
        this.cpu.reset();
}

jsboy.prototype.close = function()
{
    this.cpu.close();
}

jsboy.prototype.run = function( state )
{
    if( state == this.running )
        return ;
    
    this.running = state;

    if( this.running )
        this.interval = setInterval( this.$('step'), 20 );
    else
        clearInterval(this.interval);
}

jsboy.prototype.step = function()
{    
    this.cpu.step();
    this.cpu.update();
    return ;

    try
    {
        this.cpu.singleStep();
        this.cpu.update();
    }
    catch(e)
    {
        log(e);
        this.run(false);
    }
}

jsboy.prototype.singleStep = function()
{
    this.cpu.singleStep();
    this.cpu.update();
    return ;

    try
    {
        this.cpu.singleStep();
        this.cpu.update();
    }
    catch(e)
    {
        log(e);
    }
}
