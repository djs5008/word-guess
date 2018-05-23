import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import SignIn from './components/sign-in.js';
import MainMenu from './components/menu.js';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import uuid from 'uuid/v4'

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
    const userID = uuid().toString().replace('-', '');
    sessionStorage.setItem('username', name);
    sessionStorage.setItem('userID', userID);
    this.setState({
      username: name,
      userID: userID,
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
        <MainMenu shown={this.state.userID !== null} username={this.state.username} userID={this.state.userID} signOut={this.signOut}/>
        <SignIn shown={this.state.userID === null} setUserProps={this.setUserProps}/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
