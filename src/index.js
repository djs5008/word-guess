import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import SignIn from './components/sign-in.js';
import MainMenu from './components/menu.js';

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      //<SignIn />
      <MainMenu />
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
