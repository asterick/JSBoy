import React, { Component } from "react";
import ReactDOM from "react-dom";

import MainView from "./ui";
import style from './sass';

import Polyfills from "./util/polyfills";
import JSBoy from "./core";

ReactDOM.render(<MainView runtime={new JSBoy()}/>, document.querySelector("#container"));
