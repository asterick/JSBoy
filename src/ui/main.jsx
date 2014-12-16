var React = require("react/addons"),
    JSBoy = require("../core"),
    Register = require("./register.jsx"),
    Flag = require("./flag.jsx"),
    Disassembler = require("./disassemble.jsx");

var MainView = React.createClass({
    // --- Life-cycle operations ---
    getInitialState: function () {
        return {
            runtime: new JSBoy(),
            doubleSize: false,
            dragging: false
        };
    },

    componentDidMount: function () {
        var ctx = this.refs.display.getDOMNode().getContext('2d');

        window.onclose = this.close;
        this.state.runtime.setContext(ctx);
    },

    componentDidUnmount: function () {
        window.onclose = null;
    },

    close: function () {
        this.state.runtime.close();
    },

    // --- File loading ---
    onDragOver: function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        this.setState({ dragging: true });
    },

    onDragLeave: function () {
        this.setState({ dragging: false });
    },

    onDrop: function (e) {
        e.preventDefault();

        var file = e.dataTransfer.files[0],
            reader = new FileReader();

        reader.onload = this.onFile;
        this.setState({ dragging: false, rom_name: file.name }, function () {
            reader.readAsArrayBuffer(file);
        });
    },

    onFile: function (e) {
        var name = this.state.rom_name,
        name = name.split(".")[0];

        this.state.runtime.reset(name, e.target.result);
        this.state.runtime.running = true;
    },

    // --- UI operations ---
    toggle: function () {
        this.state.runtime.running = !this.state.runtime.running;
        this.forceUpdate();
    },

    reset: function () {
        this.state.runtime.reset();
        this.forceUpdate();
    },

    step: function () {
        this.state.runtime.singleStep();
        this.forceUpdate();
    },

    stop_predictions: function () {
        this.state.runtime.cpu.predictEvent = function () { return 0; };
    },

    screenClicked: function () {
        this.setState({
            doubleSize: !this.state.doubleSize
        });
    },

    runTo: function (addr) {
        var that = this;
        return function () {
            for(var i = 0; i < 125000 && that.state.runtime.cpu.pc !== addr; i++) {
                that.state.runtime.singleStep();
            }
            that.forceUpdate();
        }
    },

    // --- Rendering ---
    render: function () {
        var canvasClass = React.addons.classSet({
                'display': true,
                'double': this.state.doubleSize,
                'dragging': this.state.dragging
            });

        return (
            <div>
                <div className='title-bar'>
                    <h1>JSBoy</h1>
                </div>

                <div className='emulator'>
                    <canvas ref='display' width='160' height='144'
                        onClick={this.screenClicked}
                        onDragOver={this.onDragOver}
                        onDragLeave={this.onDragLeave}
                        onDrop={this.onDrop}
                        className={canvasClass}
                        />

                    <ul className='button-group'>
                        <li onClick={this.toggle}>{ this.state.runtime.running ? 'Stop' : 'Run' }</li>
                        <li onClick={this.reset}>Reset</li>
                        <li onClick={this.step}>Step</li>
                        <li onClick={this.stop_predictions}>Disable predictions</li>
                    </ul>

                    <div className='debugger'>
                        <div className='debugger-body'>
                            <div className='registers'>
                                <div className='header'>CPU Flags</div>
                                <div className='column'>
                                    <Register name="BC" chip={this.state.runtime.cpu} register="bc" />
                                    <Register name="DE" chip={this.state.runtime.cpu} register="de" />
                                    <Register name="HL" chip={this.state.runtime.cpu} register="hl" />
                                    <Register name="A" chip={this.state.runtime.cpu} register="a" />
                                    <Register name="PC" chip={this.state.runtime.cpu} register="pc" />
                                    <Register name="SP" chip={this.state.runtime.cpu} register="sp" />
                                    <Register name="IF" chip={this.state.runtime.cpu} register="irq_request" />
                                    <Register name="IE" chip={this.state.runtime.cpu} register="irq_enable" />
                                </div>
                                <div className='column'>
                                    <Flag name="C" chip={this.state.runtime.cpu} flag="cf" />
                                    <Flag name="H" chip={this.state.runtime.cpu} flag="hf" />
                                    <Flag name="N" chip={this.state.runtime.cpu} flag="nf" />
                                    <Flag name="Z" chip={this.state.runtime.cpu} flag="zf" />
                                    <Flag name="I" chip={this.state.runtime.cpu} flag="irq_master" />
                                    <Flag name="S" chip={this.state.runtime.cpu} flag="halted" />
                                </div>
                                <div className='header'>GPU Flags</div>
                                <div className='column'>
                                    <Register name="VBK" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="LYC" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="CLK" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="SCX" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="SCY" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="WX" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="WY" chip={this.state.runtime.cpu.gpu} register="irq_enable" />
                                </div>
                                <div className='column'>
                                    <Flag name="LCD" chip={this.state.runtime.cpu.gpu} flag="lcd_enable" />
                                    <Flag name="WM" chip={this.state.runtime.cpu.gpu} flag="window_map" />
                                    <Flag name="BM" chip={this.state.runtime.cpu.gpu} flag="background_map" />
                                    <Flag name="WIN" chip={this.state.runtime.cpu.gpu} flag="window_enable" />
                                    <Flag name="BG" chip={this.state.runtime.cpu.gpu} flag="bg_display" />
                                    <Flag name="BNK" chip={this.state.runtime.cpu.gpu} flag="map_tile_data" />
                                    <Flag name="OBJ" chip={this.state.runtime.cpu.gpu} flag="obj_enable" />
                                    <Flag name="SIZ" chip={this.state.runtime.cpu.gpu} flag="obj_size" />
                                </div>
                                <div className='column'>
                                    <Flag name="LYC" chip={this.state.runtime.cpu.gpu} flag="lycIRQ" />
                                    <Flag name="M0" chip={this.state.runtime.cpu.gpu} flag="mode0IRQ" />
                                    <Flag name="M1" chip={this.state.runtime.cpu.gpu} flag="mode1IRQ" />
                                    <Flag name="M2" chip={this.state.runtime.cpu.gpu} flag="mode2IRQ" />
                                </div>
                            </div>

                            <Disassembler runTo={this.runTo} runtime={this.state.runtime} address={this.state.runtime.cpu.pc} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = MainView;
