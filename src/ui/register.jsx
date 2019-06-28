import React, { Component } from "react";

export default class Register extends Component {
    renderValue () {
        var v = this.props.chip[this.props.register] || 0;

        return v.toString(16).toUpperCase();
    }

    render () {
        return (
            <div>
                <span className='name'>{this.props.name}</span>
                <span className='value'>{this.renderValue()}</span>
            </div>
        );
    }
}
