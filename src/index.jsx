import style from './sass';

var React = require("react"),
    MainView = require("./ui/main.jsx");

React.render(React.createElement(MainView), document.querySelector("#container"));
