import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import SignIn from './components/sign-in.js';
import MainMenu from './components/menu.js';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: sessionStorage.getItem('username'),
      userID: sessionStorage.getItem('userID'),
    };
    this.setUserProps = this.setUserProps.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  setUserProps(name) {
    sessionStorage.setItem('username', name);
    this.setState({
      username: name,
    });
  }

  signOut() {
    this.setState({
      username: null,
      userID: null,
    });
  }

  render() {
    console.log(this.state.username)
    return (
      <div>
        <MainMenu shown={this.state.username !== null} username={this.state.username} signOut={this.signOut}/>
        <SignIn shown={this.state.username === null} setUserProps={this.setUserProps}/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
