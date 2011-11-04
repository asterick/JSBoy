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
    // Create LUT for rom delegates (avoid using closure data)
    if( romBlock.delegates === undefined )
    {
        romBlock.delegates = new Array(0x100);

        for( var i = 0; i < 0x100; i++ )
            romBlock.delegates[i] = "function(){return "+i+"}";
    
        romBlock.delegates = eval("["+romBlock.delegates.join(",")+"]");
    }

    var newData = new Array( length || data.length );
    
    for( var i = 0; i < data.length; i++ )
        newData[i] = romBlock.delegates[data[i]];

    for( var i = length; i >= data.length; i-- )
        newData[i-1] = romBlock.delegates[0xFF];

    return newData;
}

function ramBlock(size, extend, name, mask)
{
    if(!size)
        return null;
        
    var read = new Array(extend);
    var write = new Array(extend);
    var data = new Array(size);
    var delegate;
    
    if(mask < 0xFF)
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
        var encoded = JSON.stringify(data);
        window.localStorage.setItem(name,encoded);
    }
    
    var load = function() {
        try
        {
            var encoded = JSON.parse(window.localStorage.getItem(name));
            
            for( var i = 0; i < encoded.length; i++ )
                data[i] = encoded.charCodeAt(i);
        }
        catch(o)
        {
            // Unable to decode JSON (old save file)   
        }
    }

    return { read: read, write: write, data: data, save: save, load: load };
}

