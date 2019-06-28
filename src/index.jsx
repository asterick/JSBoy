import React, { Component } from "react";
import ReactDOM from "react-dom";

import MainView from "./ui";

import Polyfills from "./util/polyfills";
import JSBoy from "./core";


const runtime = new JSBoy();

ReactDOM.render(<MainView runtime={runtime}/>, document.querySelector("#container"));
