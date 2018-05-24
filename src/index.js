import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './js/registerServiceWorker';
import uuid from 'uuid/v4'
import './css/index.css';
import { Grid } from '@material-ui/core'

import SignIn from './js/components/sign-in';
import MainMenu from './js/components/menu';
import CreateMenu from './js/components/create-menu';
import JoinMenu from './js/components/join-menu';
import Loading from './js/components/loading';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: sessionStorage.getItem('username'),
      userID: sessionStorage.getItem('userID'),
      signInShown: false,
      menuShown: false,
      joinMenuShown: false,
      createMenuShown: false,
      loadingShown: false,
      loadingText: 'Loading...',
    };

    this.setUserProps = this.setUserProps.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.signOut = this.signOut.bind(this);
    this.signIn = this.signIn.bind(this);
    this.createLobby = this.createLobby.bind(this);
    this.joinLobby = this.joinLobby.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.setLoadingText = this.setLoadingText.bind(this);
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

  showMenu() {
    setTimeout(() => {
      this.setState({
        menuShown: true,
        joinMenuShown: false,
        createMenuShown: false,
        loadingShown: false,
        signInShown: false,
      });
    }, 0);
  }

  signOut() {
    setTimeout(() => {
      this.setState({
        username: null,
        userID: null,
        signInShown: true,
        menuShown: false,
        loadingShown: false,
        createLobby: false,
        joinLobby: false,
      });
    }, 0);
  }

  signIn() {
    setTimeout(() => {
      this.setState({
        signInShown: false,
        menuShown: true,
      });
    }, 0);
  }

  createLobby() {
    setTimeout(() => {
      this.setState({
        menuShown: false,
        createMenuShown: true,
      });
    }, 0);
  }

  joinLobby() {
    setTimeout(() => {
      this.setState({
        menuShown: false,
        joinMenuShown: true,
      });
    }, 0);
  }

  setLoadingText(text) {
    setTimeout(() => {
      this.setState({
        loadingText: text,
      });
    }, 0);
  }

  startLoading() {
    setTimeout(() => {
      this.setState({
        menuShown: false,
        joinMenuShown: false,
        createMenuShown: false,
        signInShown: false,
        loadingShown: true,
      });
    }, 0);
  }

  componentWillMount() {
    if (this.state.userID === null) {
      this.signOut();
    } else {
      this.signIn();
    }
  }

  getCurrentState() {
    if (this.state.signInShown) {
      return (
        <SignIn 
          shown={this.state.signInShown}
          setUserProps={this.setUserProps}
          signIn={this.signIn}
        />
      );
    } else if (this.state.createMenuShown) {
      return (
        <CreateMenu 
          startLoading={this.startLoading}
          setLoadingText={this.setLoadingText}
          shown={this.state.createMenuShown}
          showMenu={this.showMenu}
        />
      );
    } else if (this.state.joinMenuShown) {
      return (
        <JoinMenu 
          startLoading={this.startLoading}
          setLoadingText={this.setLoadingText}
          shown={this.state.joinMenuShown}
          showMenu={this.showMenu}
        />
      );
    } else if (this.state.loadingShown) {
      return (
        <Loading 
          loading={this.state.loadingShown}
          loadingText={this.state.loadingText}
          showMenu={this.showMenu}
        />
      );
    }
  }

  render() {
    return (
      <Grid container className='vignette' justify='center' alignItems='center' alignContent='center'>
        <MainMenu 
          shown={this.state.menuShown}
          username={this.state.username}
          userID={this.state.userID}
          signOut={this.signOut}
          joinLobby={this.joinLobby}
          createLobby={this.createLobby}
          hidden={this.state.loadingShown}
        />
        {this.getCurrentState()}
      </Grid>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
