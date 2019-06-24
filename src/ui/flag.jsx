import React, { Component } from "react";

export default class Flag extends Component {
    renderValue () {
        var v = this.props.chip[this.props.flag];

        return (v ? '\u2713' : '\u00A0');
    }

    render () {
        return (
            <div>
                <span className='name'>{this.props.name}</span>
                <span className='flag'>{this.renderValue()}</span>
            </div>
        );
    }
}
