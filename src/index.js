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
      activeState: undefined,
      loadingText: 'Loading...',
      loadingCancellable: false,
      lobbies: undefined,
      shownName: false,
      sessionTimer: undefined,
    };

    this.showMenu = this.showMenu.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showCreateLobby = this.showCreateLobby.bind(this);
    this.showJoinLobby = this.showJoinLobby.bind(this);
    this.showGameLobby = this.showGameLobby.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.stopSnackbar = this.stopSnackbar.bind(this);
  }

  componentDidMount() {
    this.setState({
      sessionTimer: setInterval(() => {
        this.setState({
          lobbies: Client.state.lobbies,
        });
        if (Client.state.reconnecting) {
          this.startLoading(false, 'Reconnecting...');
        } else {
          if (this.state.activeState === 'loading'
            && this.state.loadingText === 'Reconnecting...') {
            this.showMenu();
          }
        }
      }, 500),
    });
  }

  stopSnackbar() {
    setTimeout(() => {      
      this.setState({
        shownName: false,
      })
    }, 0);
  }

  showMenu() {
    setTimeout(() => {
      Client.registered((result) => {
        if (result) {
          this.setState({
            activeState: 'menu',
            shownName: true,
          });
        } else {
          this.signOut();
        }
      });
    }, 0);
  }

  signOut() {
    setTimeout(() => {
      Client.unregister();
      this.setState({
        activeState: 'signin',
      });
    }, 0);
  }

  showCreateLobby() {
    setTimeout(() => {
      this.setState({
        activeState: 'createmenu',
      });
    }, 0);
  }

  showJoinLobby() {
    setTimeout(() => {
      this.setState({
        activeState: 'joinmenu',
      });
    }, 0);
  }

  startLoading(cancellable, text) {
    setTimeout(() => {
      this.setState({
        activeState: 'loading',
        loadingCancellable: cancellable,
        loadingText: text,
      });
    }, 0);
  }

  showGameLobby() {
    setTimeout(() => {
      this.setState({
        activeState: 'game',
      });
    }, 0);
  }

  componentWillMount() {
    if (Client.shouldAutoRegister()) {
      let username = sessionStorage.getItem('username');
      this.startLoading(false, 'Welcome ' + username + '!', 'Signing in...');
      Client.register(username, () => {
        this.showMenu();
      });
    } else {
      this.signOut();
    }
  }

  getCurrentState() {
    switch (this.state.activeState) {
      case 'signin':
        return (
          <SignIn 
            shown={this.state.activeState === 'signin'}
            register={Client.register}
            showMenu={this.showMenu}
            startLoading={this.startLoading}
          />
        );
      case 'createmenu': 
        return (
          <CreateMenu 
            shown={this.state.activeState === 'createmenu'}
            createLobby={Client.createLobby}
            startLoading={this.startLoading}
            showMenu={this.showMenu}
            showGameLobby={this.showGameLobby}
          />
        );
      case 'joinmenu':
        return (
          <JoinMenu 
            shown={this.state.activeState === 'joinmenu'}
            lobbies={this.state.lobbies}
            joinLobby={Client.joinLobby}
            startLoading={this.startLoading}
            showGameLobby={this.showGameLobby}
            showMenu={this.showMenu}
          />
        );
      case 'loading':
      default:
        return (
          <Loading 
            loading={this.state.activeState === 'loading'}
            loadingText={this.state.loadingText}
            cancellable={this.state.loadingCancellable}
            showMenu={this.showMenu}
            hidden={this.state.activeState !== 'loading'}
          />
        );
    }
  }

  render() {
    return (
      <Grid container className='root' justify='center' alignItems='center' alignContent='center'>
        <MainMenu 
          shown={this.state.activeState === 'menu'}
          shownName={this.state.shownName}
          username={Client.state.username}
          userID={Client.state.userID}
          signOut={this.signOut}
          showJoinLobby={this.showJoinLobby}
          showCreateLobby={this.showCreateLobby}
          stopSnackbar={this.stopSnackbar}
          hidden={['loading', 'signin', 'game', undefined].includes(this.state.activeState)}
        />
        {this.getCurrentState()}
      </Grid>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
registerServiceWorker();
