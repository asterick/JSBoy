var React = require("react/addons"),
    JSBoy = require("../jsboy"),
    Register = require("./register.jsx"),
    Flag = require("./register.jsx"),
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
        this.state.runtime.updateUI = this.update;
        this.state.runtime.setContext(ctx);
    },

    componentDidUnmount: function () {
        window.onclose = null;
        delete this.state.runtime.updateUI;
    },

    close: function () {
        debugger ;
        this.state.runtime.close();
    },

    update: function () {
        //this.forceUpdate();
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
        this.setState({ dragging: false });

        var file = e.dataTransfer.files[0],
            reader = new FileReader(),
            onFile = this.onFile;

        reader.onload = function (e) {
            onFile(file.name, e.target.result);
        };

        reader.readAsArrayBuffer(file);
    },

    onFile: function (name, data) {
        name = name.split(".")[0];

        this.state.runtime.reset(name, data);
        this.state.runtime.running = true;

        this.setState({
            rom_name: name
        });
    },

    // --- UI operations ---
    toggle: function () {
        this.state.runtime.running = !this.state.runtime.running;
    },

    reset: function () {
        this.state.runtime.reset();
    },

    step: function () {
        this.state.runtime.singleStep();
    },

    stop_predictions: function () {
        this.state.runtime.cpu.predictEvent = function () { return 0; };
    },

    screenClicked: function () {
        this.setState({
            doubleSize: !this.state.doubleSize
        });
    },

    // --- Rendering ---
    render: function () {
        var canvasClass = React.addons.classSet({
                'display': true,
                'double': this.state.doubleSize
            }),
            mainClass = React.addons.classSet({
                'center': true,
                'dragging': this.state.dragging
            });

        return (
            <div className={mainClass}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}>
                <div className='title-bar'>
                    <h1>JSBoy</h1>
                </div>

                <canvas ref='display' onClick={this.screenClicked} className={canvasClass} width='160' height='144' />

                <div className='debugger'>
                    <ul className='button-group'>
                        <li>
                            <a className='button' onClick={this.toggle}>{ this.state.runtime.running ? 'Stop' : 'Run' }</a>
                        </li>
                        <li><a className='button' onClick={this.reset}>Reset</a></li>
                        <li><a className='button' onClick={this.step}>Step</a></li>
                        <li><a className='button' onClick={this.stop_predictions}>Disable predictions</a></li>
                    </ul>

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
                                <Flag name="C" chip={this.state.runtime.cpu} register="cf" />
                                <Flag name="H" chip={this.state.runtime.cpu} register="hf" />
                                <Flag name="N" chip={this.state.runtime.cpu} register="nf" />
                                <Flag name="Z" chip={this.state.runtime.cpu} register="zf" />
                                <Flag name="I" chip={this.state.runtime.cpu} register="irq_master" />
                                <Flag name="S" chip={this.state.runtime.cpu} register="halted" />
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
                                <Flag name="LCD" chip={this.state.runtime.cpu.gpu} register="lcd_enable" />
                                <Flag name="WM" chip={this.state.runtime.cpu.gpu} register="window_map" />
                                <Flag name="BM" chip={this.state.runtime.cpu.gpu} register="background_map" />
                                <Flag name="WIN" chip={this.state.runtime.cpu.gpu} register="window_enable" />
                                <Flag name="BG" chip={this.state.runtime.cpu.gpu} register="bg_display" />
                                <Flag name="BNK" chip={this.state.runtime.cpu.gpu} register="map_tile_data" />
                                <Flag name="OBJ" chip={this.state.runtime.cpu.gpu} register="obj_enable" />
                                <Flag name="SIZ" chip={this.state.runtime.cpu.gpu} register="obj_size" />
                            </div>
                            <div className='column'>
                                <Flag name="LYC" chip={this.state.runtime.cpu.gpu} register="lycIRQ" />
                                <Flag name="M0" chip={this.state.runtime.cpu.gpu} register="mode0IRQ" />
                                <Flag name="M1" chip={this.state.runtime.cpu.gpu} register="mode1IRQ" />
                                <Flag name="M2" chip={this.state.runtime.cpu.gpu} register="mode2IRQ" />
                            </div>
                        </div>

                        <Disassembler runtime={this.state.runtime} address={this.state.runtime.cpu.pc} />
                    </div>
                </div>
            </div>
            );
    }
});

module.exports = MainView;
