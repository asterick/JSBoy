requirejs([
    "jsboy",
    "debugger/disassemble",
    "text!../gamelist"
], function (jsboy, disassembler, gamelist) {
    var games = gamelist.split('\n').sort(),
        ctx = document.getElementById('screen').getContext("2d"),
        runtime = new jsboy(ctx);

    function shorten(fn) {
        return /([^\/]*)\.[^\.]*$/.exec(fn)[1];
    }

    function resize(div) {
        var change = {
            'double': 'regular',
            'regular': 'double'
        };

        div.setAttribute('class', change[div.getAttribute('class')] );
    }

    function run() {
        if (!window.location.hash) { return ; }

        var name = window.location.hash.substr(1),
            xhr, data;

        document.title = unescape(shorten(name));

        xhr = new XMLHttpRequest();
        xhr.open('GET', name, true);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
    
        xhr.onload = function(event) {
            // Test ready state
            if (xhr.readyState != 4 || xhr.status != 200)
                throw "Error while loading " + url;

            data = new Uint8Array(xhr.response);
      
            runtime.reset(name, data);
            runtime.run(true);
            update();
        };
    }

    function updateRegs( device, state ) {
        for (var k in state) {
            var e = document.getElementById(device+'_'+k);
            if (!e) {
                continue;
            }
        
            switch (e.getAttribute('class')) {
                case 'value':
                    e.innerHTML = state[k].toString(16);
                    break ;
                case 'flag':
                    e.innerHTML = (state[k] ? 'X' : '&nbsp;')
                    break ;
                default:
                    e.innerHTML = state[k];
            }
        }
    }

    function update()
    {
        var addr = document.getElementById('address'),
            hex = document.getElementById('hex'),
            inst = document.getElementById('instruction'),
            dis = new disassembler(runtime.cpu),
            pc = runtime.cpu.pc;

        updateRegs('cpu',runtime.cpu);
        updateRegs('gpu',runtime.cpu.gpu);

        addr.innerHTML = '';
        hex.innerHTML = '';
        inst.innerHTML = '';

        for (var i = 0; i < 25; i++) {
            var o = dis.disassemble(pc);
            if(!o)
                break ;
        
            var a = pc.toString(16);
            addr.innerHTML += "<a href='#' onclick='runTo("+pc+")'>" + a + "</a><br/>";
            hex.innerHTML += o.hex + "<br/>";
            inst.innerHTML += o.op + "<br/>";
        
            pc = o.next;
        }
    }

    function runTo( addr )
    {
        // Limit number of executions (This is enough to boot the system)
        for (var i = 1250000; i && runtime.cpu.pc != addr; i--) {
            runtime.cpu.singleStep();
        }

        update();
    }

    function find(field, suggest) {
        var suggestions = document.getElementById(suggest),
            name = field.value.toLowerCase(),
            list;

        list = games.filter(function(game) {
            return game.toLowerCase().indexOf(name) >= 0;
        });

        suggestions.innerHTML = list.map(function(game) {
            return "<a href='#"+escape(game)+"')'>" + shorten(game) + "</a>";
        }).join("<br/>");

        document.getElementById(suggest).style.visibility = (list.length > 0) ? 'visible' : 'hidden';
    }

    update();

    window.onbeforeunload = function() {
        runtime.close();
    };

    document.getElementById('screen').addEventListener("click", function (e) {
        resize(this);
    }, false);


    var fn = document.getElementById('filename');

    fn.addEventListener("focus", function (e) {
        this.value = '';
    }, false);

    fn.addEventListener("keyup", function (e) {
        find(this,'suggestions');
    }, false);

    fn.style.visibility = 'visible';
    window.addEventListener("hashchange", run, false);
    run();
});