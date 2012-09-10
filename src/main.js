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

    function run() {
        if (!window.location.hash) { return ; }

        var name = window.location.hash.substr(1),
            xhr = new XMLHttpRequest();

        if (!name) { return ; }

        document.title = unescape(shorten(name));

        xhr.open('GET', name, true);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
    
        xhr.onload = function(event) {
            // Test ready state
            if (xhr.readyState != 4 || xhr.status != 200)
                throw "Error while loading " + url;

            runtime.reset(name, new Uint8Array(xhr.response));
            runtime.run(true);
            update();
        };
    }

    function updateRegs(device, state) {
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
                    break ;
            }
        }
    }

    function update()
    {
        var addr = $('#address'),
            hex = $('#hex'),
            inst = $('#instruction'),
            dis = new disassembler(runtime.cpu),
            pc = runtime.cpu.pc;

        updateRegs('cpu',runtime.cpu);
        updateRegs('gpu',runtime.cpu.gpu);

        addr.empty();
        hex.empty();
        inst.empty();

        for (var i = 0; i < 25; i++) {
            var o = dis.disassemble(pc);
            if(!o)
                break ;
        
            var a = pc.toString(16);
            addr.append("<a href='#' onclick='runTo("+pc+")'>" + a + "</a><br/>");
            hex.append(o.hex + "<br/>");
            inst.append(o.op + "<br/>");
        
            pc = o.next;
        }
    }

    function runTo(addr) {
        // Limit number of executions (This is enough to boot the system)
        for (var i = 1250000; i && runtime.cpu.pc != addr; i--) {
            runtime.cpu.singleStep();
        }

        update();
    }

    function find(field, suggest) {
        var suggestions = $(suggest),
            name = field.value.toLowerCase(),
            list;

        list = games.filter(function(game) {
            return game && game.toLowerCase().indexOf(name) >= 0;
        });

        suggestions.html(list.map(function(game) {
            return "<a href='#"+escape(game)+"')'>" + shorten(game) + "</a>";
        }).join("<br/>"));

        suggestions.toggle(list.length > 0);
    }

    window.onbeforeunload = function() {
        runtime.close();
    };

    $("#run").click(function () {
        runtime.run(true);
    });
    $("#stop").click(function () {
        runtime.run(false);
        update();
    });
    $("#reset").click(function () {
        runtime.reset();
        update();
    });
    $("#step").click(function () {
        runtime.singleStep();
        update();
    });
    $("#frame").click(function () {
        runtime.step();update();
    });
    $("#stop_predictions").click(function () {
        runtime.cpu.predictEvent = function() { return 0; }
    });

    $('#screen').click(function () {
        $(this).toggleClass('double');
    });

    $("#filename").focus(function () {
        this.value = '';
    }).keyup(function () {
        find(this,'#suggestions');
    }).show();

    window.addEventListener("hashchange", run, false);
    update();
    run();
});
