/***
 *  JSBoy Memory block helper functions
 */

Array.prototype.chunk = function(stride)
{
    var chunks = new Array();
    
    for( var i = 0; i < this.length; i+=stride )
        chunks.push( this.slice(i,i+stride) );
    
    return chunks;
}

Array.prototype.fill = function(value, pos, length)
{
    if( pos === undefined )
        pos = 0;
    if( length === undefined )
        length = this.length;
    
    while(length-- > 0 && pos < this.length)
        this[pos++] = value;
}

Array.prototype.copy = function(dest_pos, source, source_pos, length )
{
    if( source_pos === undefined )
        source_pos = 0;
    
    if( length === undefined )
        length = source.length;
        
    while( length-- > 0 && source_pos < source.length )
        this[dest_pos++] = source[source_pos++];
}

function byteAlignment(size, base)
{
    if( base === undefined )
        base = 1;

    while( base < size )
        base <<= 1;
    
    return base;
}

function romBlock(data, length)
{
    if( length !== undefined )
    {
        data = data.concat();
        
        while(data.length < length)
            data.push(0xFF);
    }

    function delegate(value)
    {
        return function() { return value; }
    }
    
    return data.map( delegate );
}

function ramBlock(size, extend, name, mask)
{
    if(!size)
        return null;
        
    var read = new Array(extend);
    var write = new Array(extend);
    var data = new Array(size);
    var delegate;
    
    if(mask)
    {
        delegate = function(index)
        {
            data[index] = 0;
            read[index] = function() { return data[index]; }
            write[index] = function(value) { data[index] = value & mask; }
        }
    }
    else
    {
        delegate = function(index)
        {
            data[index] = 0;
            read[index] = function() { return data[index]; }
            write[index] = function(value) { data[index] = value; }
        }
    }

    for( var i = 0; i < size; i++ )
        delegate(i);

    for( var i = size; i < extend; i++ )
    {
        read[i] = read[i%size];
        write[i] = write[i%size];
    }
    
    var save = function() {
        window.localStorage.setItem(name,JSON.stringify(data));
    }
    
    var load = function() {
        try
        {
            var loaded = JSON.parse(window.localStorage.getItem(name)); 
            data.copy(0,loaded,0,Math.min(loaded.length,data.length));
        }
        catch(o)
        {
            // Unable to decode JSON (old save file)   
        }
    }

    return { read: read, write: write, data: data, save: save, load: load };
}

