import React, { Component } from "react";

import Register from "./register";
import Flag from "./flag";
import Disassembler from "./disassemble";
import Screen from "./screen";

import style from './style';

export default class MainView extends Component {
    // --- Life-cycle operations ---
    componentDidMount () {
        window.onclose = this.close;
    }

    componentWillUnmount () {
        window.onclose = null;
    }

    close () {
        this.props.runtime.close();
    }

    // --- UI operations ---
    toggle () {
        this.props.runtime.running = !this.props.runtime.running;
        this.forceUpdate();
    }

    reset () {
        this.props.runtime.reset();
        this.forceUpdate();
    }

    step () {
        this.props.runtime.singleStep();
        this.forceUpdate();
    }

    stop_predictions () {
        this.props.runtime.cpu.predictEvent = function () { return 0; };
    }

    runTo (addr) {
        var that = this;
        return function () {
            for(var i = 0; i < 125000 && that.props.runtime.cpu.pc !== addr; i++) {
                that.props.runtime.singleStep();
            }
            that.forceUpdate();
        }
    }

    // --- Rendering ---
    render () {
        return (
            <div>
                <div className='title-bar'>
                    <h1>JSBoy</h1>
                </div>

                <div className='emulator'>
                    <Screen runtime={this.props.runtime} />

                    <ul className='button-group'>
                        <li onClick={() => this.toggle()}>{ this.props.runtime.running ? 'Stop' : 'Run' }</li>
                        <li onClick={() => this.reset()}>Reset</li>
                        <li onClick={() => this.step()}>Step</li>
                        <li onClick={() => this.stop_predictions()}>Disable predictions</li>
                    </ul>

                    <div className='debugger'>
                        <div className='debugger-body'>
                            <div className='registers'>
                                <div className='header'>CPU Flags</div>
                                <div className='column'>
                                    <Register name="BC" chip={this.props.runtime.cpu} register="bc" />
                                    <Register name="DE" chip={this.props.runtime.cpu} register="de" />
                                    <Register name="HL" chip={this.props.runtime.cpu} register="hl" />
                                    <Register name="A" chip={this.props.runtime.cpu} register="a" />
                                    <Register name="PC" chip={this.props.runtime.cpu} register="pc" />
                                    <Register name="SP" chip={this.props.runtime.cpu} register="sp" />
                                    <Register name="IF" chip={this.props.runtime.cpu} register="irq_request" />
                                    <Register name="IE" chip={this.props.runtime.cpu} register="irq_enable" />
                                </div>
                                <div className='column'>
                                    <Flag name="C" chip={this.props.runtime.cpu} flag="cf" />
                                    <Flag name="H" chip={this.props.runtime.cpu} flag="hf" />
                                    <Flag name="N" chip={this.props.runtime.cpu} flag="nf" />
                                    <Flag name="Z" chip={this.props.runtime.cpu} flag="zf" />
                                    <Flag name="I" chip={this.props.runtime.cpu} flag="irq_master" />
                                    <Flag name="S" chip={this.props.runtime.cpu} flag="halted" />
                                </div>
                                <div className='header'>GPU Flags</div>
                                <div className='column'>
                                    <Register name="VBK" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="LYC" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="CLK" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="SCX" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="SCY" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="WX" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                    <Register name="WY" chip={this.props.runtime.cpu.gpu} register="irq_enable" />
                                </div>
                                <div className='column'>
                                    <Flag name="LCD" chip={this.props.runtime.cpu.gpu} flag="lcd_enable" />
                                    <Flag name="WM" chip={this.props.runtime.cpu.gpu} flag="window_map" />
                                    <Flag name="BM" chip={this.props.runtime.cpu.gpu} flag="background_map" />
                                    <Flag name="WIN" chip={this.props.runtime.cpu.gpu} flag="window_enable" />
                                    <Flag name="BG" chip={this.props.runtime.cpu.gpu} flag="bg_display" />
                                    <Flag name="BNK" chip={this.props.runtime.cpu.gpu} flag="map_tile_data" />
                                    <Flag name="OBJ" chip={this.props.runtime.cpu.gpu} flag="obj_enable" />
                                    <Flag name="SIZ" chip={this.props.runtime.cpu.gpu} flag="obj_size" />
                                </div>
                                <div className='column'>
                                    <Flag name="LYC" chip={this.props.runtime.cpu.gpu} flag="lycIRQ" />
                                    <Flag name="M0" chip={this.props.runtime.cpu.gpu} flag="mode0IRQ" />
                                    <Flag name="M1" chip={this.props.runtime.cpu.gpu} flag="mode1IRQ" />
                                    <Flag name="M2" chip={this.props.runtime.cpu.gpu} flag="mode2IRQ" />
                                </div>
                            </div>

                            <Disassembler runTo={this.runTo} runtime={this.props.runtime} address={this.props.runtime.cpu.pc} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
