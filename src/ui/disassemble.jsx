var React = require("react/addons"),
    Disassembler = require("../debugger/disassemble.js");

var Instruction = React.createClass({
    disassemble: function () {
        var results = [],
            pc = this.props.address,
            o;

        for (var i = 0; i < 25; i++, pc = o.next) {
            var o = Disassembler(this.props.runtime.cpu, pc);
            if (!o) { break; }

            results.push(
                <div className='row' key={pc}>
                    <a className='addr' onClick={this.props.runTo(pc)}>{pc.toString(16).toUpperCase()}</a>
                    <span className='hex'>{o.hex}</span>
                    <span className='instruction'>{o.op}</span>
                </div>
                );
        }

        return results;
    },

    render: function () {
        return (
            <div className='disassembly'>{this.disassemble()}</div>
        );
    }
})

module.exports = Instruction;
