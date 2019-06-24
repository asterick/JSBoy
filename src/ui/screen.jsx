import React, { Component } from "react";

export default class Screen extends Component {
    constructor (props) {
        super(props);

        this._ref = React.createRef();

        this.state = {
            doubleSize: false,
            dragging: false
        };
    }

    componentDidMount() {
        this.props.runtime.setContext(this._ref.current.getContext('2d'));
    }

    screenClicked () {
        this.setState({
            doubleSize: !this.state.doubleSize
        });
    }

    onDragOver (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        this.setState({ dragging: true });
    }

    onDragLeave () {
        this.setState({ dragging: false });
    }

    onDrop (e) {
        e.preventDefault();

        var file = e.dataTransfer.files[0],
            reader = new FileReader();

        reader.onload = this.onFile;
        this.setState({ dragging: false, rom_name: file.name }, function () {
            reader.readAsArrayBuffer(file);
        });
    }

    onFile (e) {
        var name = this.state.rom_name,
        name = name.split(".")[0];

        this.props.runtime.reset(name, e.target.result);
        this.props.runtime.running = true;
    }

    render () {
        var canvasClass = [
                'display',
                this.state.doubleSize && 'double',
                this.state.dragging && 'dragging'
            ].filter((v) => v).join(" ");

    	return (
            <canvas ref={this._ref} width='160' height='144'
                onClick={(e) => this.screenClicked(e)}
                onDragOver={(e) => this.onDragOver(e)}
                onDragLeave={(e) => this.onDragLeave(e)}
                onDrop={(e) => this.onDrop(e)}
                className={canvasClass}
                />
		);
    }
}
