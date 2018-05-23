import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './js/registerServiceWorker';
import SignIn from './components/sign-in';
import MainMenu from './components/menu';
import uuid from 'uuid/v4'
import 'bootstrap/dist/css/bootstrap.css';
import './css/index.css';

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
    const userID = uuid().toString().replace(/-/g, '');
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
