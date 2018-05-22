import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import SignIn from './components/sign-in.js';
import MainMenu from './components/menu.js';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

class App extends Component {

  render() {
    return (
      //<SignIn />
      <MainMenu />
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
