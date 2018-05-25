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
      gameShown: false,
      loadingText: 'Loading...',
      loadingCancellable: false,
      lobbies: undefined,
      lobbyMaintainer: undefined,
    };

    this.showMenu = this.showMenu.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showCreateLobby = this.showCreateLobby.bind(this);
    this.showJoinLobby = this.showJoinLobby.bind(this);
    this.showGameLobby = this.showGameLobby.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.setLoadingText = this.setLoadingText.bind(this);
  }

  componentDidMount() {
    this.setState({
      lobbyMaintainer: setInterval(() => this.setState({lobbies: Client.state.lobbies}), 500),
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

  showCreateLobby() {
    setTimeout(() => {
      this.setState({
        menuShown: false,
        createMenuShown: true,
      });
    }, 0);
  }

  showJoinLobby() {
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

  showGameLobby() {
    setTimeout(() => {
      this.setState({
        menuShown: false,
        joinMenuShown: false,
        createMenuShown: false,
        signInShown: false,
        loadingShown: false,
        gameShown: true,
      });
    }, 0);
  }

  componentWillMount() {
    if (Client.shouldRegister()) {
      let username = sessionStorage.getItem('username');
      this.startLoading(false);
      this.setLoadingText('Welcome ' + username + '!', 'Signing in...');
      Client.register(username, () => {
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
          createLobby={Client.createLobby}
          showGameLobby={this.showGameLobby}
        />
      );
    } else if (this.state.joinMenuShown) {
      return (
        <JoinMenu 
          startLoading={this.startLoading}
          setLoadingText={this.setLoadingText}
          shown={this.state.joinMenuShown}
          showGameLobby={this.showGameLobby}
          showMenu={this.showMenu}
          joinLobby={Client.joinLobby}
          lobbies={this.state.lobbies}
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
          showJoinLobby={this.showJoinLobby}
          showCreateLobby={this.showCreateLobby}
          hidden={this.state.loadingShown || this.state.signInShown || this.state.gameShown}
        />
        {this.getCurrentState()}
      </Grid>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
