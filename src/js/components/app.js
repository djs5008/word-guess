import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';


import SignIn from './sign-in';
import MainMenu from './menu';
import CreateMenu from './create-menu';
import JoinMenu from './join-menu';
import Loading from './loading';
import Game from './game';

import socket from '../client';
import {
  sendRegister,
  getRegistrationStatus,
  getGameStatus, 
  sendJoinLobby,
  sendLeaveLobby,
  sendUnregister,

  getClearCanvas,
  getCorrectGuess,
  getGameInfo,
  getGuess,
  getKick,
  getLine,
  getLobbyList,
  getMousePos,
  getPlayerList,
} from '../actions/action';

const MAX_LOADING_TIME = 5000;

const classes = theme => ({
  
});

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      activeState: undefined,
      loadingText: 'Loading...',
      loadingCancellable: false,
      loadTimer: undefined,
      shownName: false,
      sessionTimer: undefined,
    };

    /* Setup Socket Handlers */
    const { dispatch } = this.props;
    dispatch(getMousePos(socket));
    dispatch(getGuess(socket));
    dispatch(getCorrectGuess(socket));
    dispatch(getLobbyList(socket));
    dispatch(getPlayerList(socket));
    dispatch(getLine(socket));
    dispatch(getClearCanvas(socket));
    dispatch(getKick(socket));
    dispatch(getGameInfo(socket));

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
        if (this.props.reconnecting) {
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

  shouldAutoRegister() {
    return sessionStorage.getItem('userID') !== null;
  }

  autoRegister() {
    const { dispatch } = this.props;
    let username = sessionStorage.getItem('username');
    this.startLoading(false, 'Welcome ' + username + '!\nSigning in...');
    dispatch(sendRegister(socket, username, () => {
      this.loadMenu();
    }));
  }

  loadMenu() {
    const { dispatch } = this.props;
    setTimeout(() => {
      // Check if they are registered
      dispatch(getRegistrationStatus(socket, this.props.userID, (result) => {
        if (result) {
          this.startLoading(false, 'Loading...');
          // Check if they are currently in a game
          dispatch(getGameStatus(socket, this.props.userID, (gameID) => {
            if (gameID !== null) {
              // Join currently active game
              this.startLoading(false, 'Joining game...');
              dispatch(sendLeaveLobby(socket, this.props.userID, () => {
                dispatch(sendJoinLobby(socket, this.props.userID, gameID, null, (status) => {
                  if (status) {
                    this.showGameLobby();
                  } else {
                    this.showMenu();
                  }
                }));
              }));
            } else {              
              this.showMenu();
            }
          }));
        } else {
          if (this.shouldAutoRegister()) {
            this.autoRegister();
          } else {
            this.signOut();
          }
        }
      }));
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
    const { dispatch } = this.props;
    this.cancelLoading();
    setTimeout(() => {
      dispatch(sendUnregister(socket, this.props.userID));
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
            showMenu={this.showMenu}
            startLoading={this.startLoading}
          />
        );
      case 'createmenu': 
        return (
          <CreateMenu 
            shown={true}
            startLoading={this.startLoading}
            showMenu={this.showMenu}
            showGameLobby={this.showGameLobby}
          />
        );
      case 'joinmenu':
        return (
          <JoinMenu 
            shown={true}
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

const mapStateToProps = (store = {}) => {
  return {
    userID: store.userID,
    reconnecting: store.reconnecting,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(App));