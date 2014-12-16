var React = require("react/addons");

var Flag = React.createClass({
    renderValue: function () {
        var v = this.props.chip[this.props.flag];

        return (v ? '\u2713' : '\u00A0');
    },

    render: function () {
        return (
            <div>
                <span className='name'>{this.props.name}</span>
                <span className='flag'>{this.renderValue()}</span>
            </div>
        );
    }
});

module.exports = Flag;
