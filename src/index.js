import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './js/registerServiceWorker';
import './css/index.css';
import { Grid } from '@material-ui/core';

import * as Client from './js/components/client';
import SignIn from './js/components/sign-in';
import MainMenu from './js/components/menu';
import CreateMenu from './js/components/create-menu';
import JoinMenu from './js/components/join-menu';
import Loading from './js/components/loading';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      signInShown: false,
      menuShown: false,
      joinMenuShown: false,
      createMenuShown: false,
      loadingShown: false,
      loadingText: 'Loading...',
      loadingCancellable: false,
    };

    this.showMenu = this.showMenu.bind(this);
    this.signOut = this.signOut.bind(this);
    this.createLobby = this.createLobby.bind(this);
    this.joinLobby = this.joinLobby.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.setLoadingText = this.setLoadingText.bind(this);
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
      Client.unregister();
      this.setState({
        signInShown: true,
        menuShown: false,
        loadingShown: false,
        createLobby: false,
        joinLobby: false,
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

  startLoading(cancellable) {
    setTimeout(() => {
      this.setState({
        menuShown: false,
        joinMenuShown: false,
        createMenuShown: false,
        signInShown: false,
        loadingShown: true,
        loadingCancellable: cancellable,
      });
    }, 0);
  }

  componentWillMount() {
    if (Client.shouldRegister()) {
      let presetUser = sessionStorage.getItem('username');
      this.startLoading(false);
      this.setLoadingText('Welcome ' + presetUser + '!', 'Signing in...');
      Client.register(presetUser, () => {
        this.showMenu();
      });
    } else {
      this.signOut();
    }
  }

  getCurrentState() {
    if (this.state.signInShown) {
      return (
        <SignIn 
          shown={this.state.signInShown}
          register={Client.register}
          showMenu={this.showMenu}
          startLoading={this.startLoading}
          setLoadingText={this.setLoadingText}
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
          cancellable={this.state.loadingCancellable}
        />
      );
    }
  }

  render() {
    return (
      <Grid container className='root' justify='center' alignItems='center' alignContent='center'>
        <MainMenu 
          shown={this.state.menuShown}
          username={Client.state.username}
          userID={Client.state.userID}
          signOut={this.signOut}
          joinLobby={this.joinLobby}
          createLobby={this.createLobby}
          hidden={this.state.loadingShown || this.state.signInShown}
        />
        {this.getCurrentState()}
      </Grid>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
