requirejs([
    "jsboy",
    "debugger/disassemble",
    "text!../gamelist"
], function (jsboy, disassembler, gamelist) {
    var games = gamelist.split('\n').sort(),
        ctx = document.getElementById('display').getContext("2d"),
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
        var regs = document.querySelectorAll("[data-chip="+device+"]"),
            e;

        for (var i = 0; i < regs.length; i++) {
            var e = regs[i],
                v = state[e.dataset.reg];

            switch (e.getAttribute('class')) {
                case 'value':
                    e.innerHTML = v.toString(16);
                    break ;
                case 'flag':
                    e.innerHTML = (v ? '&#10003;' : '&nbsp;')
                    break ;
                default:
                    e.innerHTML = v;
                    break ;
            }
        }
    }

    function update()
    {
        var disasm = $('#disassembly'),
            dis = new disassembler(runtime.cpu),
            pc = runtime.cpu.pc;

        updateRegs('cpu',runtime.cpu);
        updateRegs('gpu',runtime.cpu.gpu);

        disasm.empty();

        for (var i = 0; i < 25; i++) {
            var o = dis.disassemble(pc);
            if(!o)
                break ;
        
            var a = pc.toString(16);
            disasm.append("<div class='row'><span class='addr'><a href='javascript:runTo("+pc+")'>" + a + "</a></span><span class='hex'>"+o.hex+"</span><span class='instruction'>"+o.op+"</span></div>");
            pc = o.next;
        }
    }

    window.runTo = function (addr) {
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

        list = name ? games.filter(function(game) {
            return game && game.toLowerCase().indexOf(name) >= 0;
        }) : [];

        suggestions.html(list.map(function(game) {
            return "<li><a href='#"+escape(game)+"')'>" + shorten(game) + "</a></li>";
        }).join(""));

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

    $('#display').click(function () {
        $(this).toggleClass('double');
    });

    $("#filename").focus(function () {
        this.value = '';
    }).keyup(function(e) {
        find(this,'#suggestions');
    }).blur(function() {
        $('#suggestions').hide();
    }).show();

    window.addEventListener("hashchange", run, false);
    update();
    run();
});
