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
import Game from './js/components/game';

const MAX_LOADING_TIME = 5000;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeState: undefined,
      loadingText: 'Loading...',
      loadingCancellable: false,
      loadTimer: undefined,
      lobbies: undefined,
      players: undefined,
      shownName: false,
      sessionTimer: undefined,
      createdLobby: false,
    };

    this.showMenu = this.showMenu.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showCreateLobby = this.showCreateLobby.bind(this);
    this.showJoinLobby = this.showJoinLobby.bind(this);
    this.showGameLobby = this.showGameLobby.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.stopSnackbar = this.stopSnackbar.bind(this);
    this.cancelLoading = this.cancelLoading.bind(this);
  }

  componentDidMount() {
    this.setState({
      sessionTimer: setInterval(() => {
        this.setState({
          lobbies: Client.state.lobbies,
          players: Client.state.players,
          createdLobby: Client.state.createdLobby,
        });
        if (Client.state.reconnecting) {
          this.startLoading(false, 'Reconnecting...');
        } else {
          if (this.state.activeState === 'loading'
            && this.state.loadingText === 'Reconnecting...') {
            this.loadMenu();
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

  cancelLoading() {
    if (this.state.loadTimer !== undefined) {
      setTimeout(() => {
        clearTimeout(this.state.loadTimer);
        this.setState({
          loadTimer: undefined,
        });
      }, 0);
    }
  }

  autoRegister() {
    let username = sessionStorage.getItem('username');
    this.startLoading(false, 'Welcome ' + username + '!\nSigning in...');
    Client.register(username, () => {
      this.loadMenu();
    });
  }

  loadMenu() {
    setTimeout(() => {
      // Check if they are registered
      Client.registered((result) => {
        if (result) {
          this.startLoading(false, 'Loading...');
          // Check if they are currently in a game
          Client.getCurrentGame((gameID) => {
            if (gameID !== null) {
              // Join currently active game
              this.startLoading(false, 'Joining game...');
              Client.state.activeLobby = gameID;
              Client.joinLobby(gameID, null, (status) => {
                if (status) {
                  this.showGameLobby();
                } else {
                  this.showMenu();
                }
              })
            } else {              
              this.showMenu();
            }
          });
        } else {
          if (Client.shouldAutoRegister()) {
            this.autoRegister();
          } else {
            this.signOut();
          }
        }
      });
    }, 0);
  }

  showMenu() {
    this.cancelLoading();
    setTimeout(() => {
      this.setState({
        activeState: 'menu',
        shownName: true,
      });
    }, 0);
  }

  signOut() {
    this.cancelLoading();
    setTimeout(() => {
      Client.unregister();
      this.setState({
        activeState: 'signin',
      });
    }, 0);
  }

  showCreateLobby() {
    this.cancelLoading();
    setTimeout(() => {
      this.setState({
        activeState: 'createmenu',
      });
    }, 0);
  }

  showJoinLobby() {
    this.cancelLoading();
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
        loadTimer: setTimeout(() => {
          this.cancelLoading();
        }, MAX_LOADING_TIME),
      });
    }, 0);
  }

  showGameLobby() {
    this.cancelLoading();
    setTimeout(() => {
      this.setState({
        activeState: 'game',
      });
    }, 0);
  }

  componentWillMount() {
    this.loadMenu();
  }

  getCurrentState() {
    switch (this.state.activeState) {
      case 'signin':
        return (
          <SignIn 
            shown={true}
            register={Client.register}
            showMenu={this.showMenu}
            startLoading={this.startLoading}
          />
        );
      case 'createmenu': 
        return (
          <CreateMenu 
            shown={true}
            createLobby={Client.createLobby}
            joinLobby={Client.joinLobby}
            startLoading={this.startLoading}
            showMenu={this.showMenu}
            showGameLobby={this.showGameLobby}
          />
        );
      case 'joinmenu':
        return (
          <JoinMenu 
            shown={true}
            lobbies={this.state.lobbies}
            joinLobby={Client.joinLobby}
            startLoading={this.startLoading}
            showGameLobby={this.showGameLobby}
            showJoinLobby={this.showJoinLobby}
            showMenu={this.showMenu}
          />
        );
      case 'game':
        return (
          <Game
            shown={true}
            players={Client.state.players}
            lobbyID={Client.state.activeLobby}
            created={this.state.createdLobby}
            leaveGame={Client.leaveLobby}
            showMenu={this.showMenu}
            startLoading={this.startLoading}
          />
        );
      case 'loading':
      default:
        return (
          <Loading 
            loading={true}
            loadingText={this.state.loadingText}
            cancellable={this.state.loadingCancellable}
            showMenu={this.showMenu}
            cancelLoading={this.cancelLoading}
            hidden={this.state.activeState !== 'loading' && this.state.activeState !== undefined}
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
