var React = require("react/addons");

var Register = React.createClass({
    renderValue: function () {
        var v = this.props.chip[this.props.register] || 0;

        return v.toString(16).toUpperCase();
    },

    render: function () {
        return (
            <div>
                <span className='name'>{this.props.name}</span>
                <span className='value'>{this.renderValue()}</span>
            </div>
        );
    }
});

module.exports = Register;
