import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import SignIn from './components/sign-in.js';

class App extends Component {
  render() {
    return (
      <SignIn />
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
