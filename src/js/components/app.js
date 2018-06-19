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
  SetUIState,
  StartLoading,
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
  getScoreUpdate,
} from '../actions/action';

const classes = theme => ({

});

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
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
    dispatch(getScoreUpdate(socket));

    this.stopSnackbar = this.stopSnackbar.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.setState({
      sessionTimer: setInterval(() => {
        if (this.props.reconnecting) {
          dispatch(StartLoading({ text: 'Reconnecting...', cancellable: false }));
        } else {
          if (this.props.uiState === 'loading'
            && this.props.loadingText === 'Reconnecting...') {
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

  shouldAutoRegister() {
    return sessionStorage.getItem('userID') !== null;
  }

  autoRegister() {
    const { dispatch } = this.props;
    let username = sessionStorage.getItem('username');
    dispatch(StartLoading({
      text: 'Welcome ' + username + '!\nSigning in...',
      cancellable: false,
    }));
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
          dispatch(StartLoading({ text: 'Loading...', cancellable: false }));
          // Check if they are currently in a game
          dispatch(getGameStatus(socket, this.props.userID, (gameID) => {
            if (gameID !== null) {
              // Join currently active game
              dispatch(StartLoading({ text: 'Joining game...', cancellable: false }));
              dispatch(sendLeaveLobby(socket, this.props.userID, true, () => {
                dispatch(sendJoinLobby(socket, this.props.userID, gameID, null, (status) => {
                  dispatch(SetUIState((status) ? 'game' : 'menu'))
                }));
              }));
            } else {              
              dispatch(SetUIState('menu'));
            }
          }));
        } else {
          if (this.shouldAutoRegister()) {
            this.autoRegister();
          } else {
            dispatch(sendUnregister(socket, this.props.userID));
            dispatch(SetUIState('signin'));
          }
        }
      }));
    }, 0);
  }

  componentWillMount() {
    this.loadMenu();
  }

  getCurrentState() {
    switch (this.props.uiState) {
      case 'signin':
        return (
          <SignIn shown={true} />
        );
      case 'createmenu': 
        return (
          <CreateMenu shown={true} />
        );
      case 'joinmenu':
        return (
          <JoinMenu shown={true} />
        );
      case 'game':
        return (
          <Game shown={true} />
        );
      case 'loading':
      default:
        return (
          <Loading 
            hidden={this.props.uiState !== 'loading' && this.props.uiState !== undefined}
          />
        );
    }
  }

  render() {
    return (
      <Grid container className='root' justify='center' align='center' alignItems='center' alignContent='center'>
        <MainMenu 
          shown={this.props.uiState === 'menu'}
          shownName={this.state.shownName}
          stopSnackbar={this.stopSnackbar}
          hidden={['loading', 'signin', 'game', undefined].includes(this.props.uiState)}
        />
        {this.getCurrentState()}
      </Grid>
    );
  }
}

const mapStateToProps = (store = {}) => {
  return {
    userID: store.userID,
    uiState: store.uiState,
    reconnecting: store.reconnecting,
    loading: store.loading,
    loadingText: store.loadingText,
    loadingCancellable: store.loadingCancellable,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(App));