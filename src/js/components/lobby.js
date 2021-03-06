import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button, Icon, Slide, TextField, Grid } from '@material-ui/core';
import socket from '../client';
import {
  sendJoinLobby, StartLoading, SetUIState,
} from '../actions/action';

const classes = theme => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: 5,
    width: '100%',
    overflowX: 'hidden',
  },
  container: {
    padding: 5,
    width: '100%',
  },
  content: {
    position: 'absolute',
    overflowX: 'hidden',
  },
  passwordField: {
    padding: 0,
    margin: 0,
    minWidth: 0,
    maxWidth: '100%',
  },
  row: {
    margin: 0,
    padding: 0,
  },
  button: {
    width: '100%',
    minWidth: 0,
  }
});

class Lobby extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      lobbyID: props.lobbyID,
      name: props.lobbyName,
      privateLobby: props.privateLobby,
      maxPlayers: props.maxPlayers,
      playerCount: props.playerCount,
      typing: false,
      password: '',
      buttonColor: 'invalid',
      buttonIcon: 'invalid',
      buttonDown: false,
    };
    this.state.buttonColor = (this.state.privateLobby) ? 'secondary' : 'primary';
    this.state.buttonIcon = (this.state.privateLobby) ? 'lock' : 'arrow_forward';
  }

  isLobbyFull() {
    return this.state.playerCount >= this.state.maxPlayers;
  }

  isButtonDisabled() {
    return this.isLobbyFull() 
      || (this.state.privateLobby && this.state.typing && this.state.password === '')
      || (this.props.bannedUsers.includes(this.props.userID));
  }

  isTyping() {
    return this.password.focused || this.joinButton.focused
  }

  componentWillMount() {
    this.handleButtonDown = this.handleButtonDown.bind(this);
    this.handleButtonUp = this.handleButtonUp.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      lobbyID: props.lobbyID,
      name: props.lobbyName,
      privateLobby: props.privateLobby,
      maxPlayers: props.maxPlayers,
      playerCount: props.playerCount,
    });
  }

  joinLobby(lobbyID, password) {
    const { dispatch } = this.props;
    dispatch(StartLoading({ text: 'Joining game...', cancellable: true }));
    dispatch(sendJoinLobby(socket, this.props.userID, lobbyID, password, (status) => {
      dispatch(SetUIState((status) ? 'game' : 'joinmenu'));
    }));
  }

  handleButtonDown() {
    this.setState({
      buttonDown: true,
      typing: (this.state.privateLobby) ? true : false,
    });
    if (this.state.privateLobby && !this.state.typing) {
      setTimeout(() => this.password.focus(), 0);
    } else {
      this.joinLobby(this.state.lobbyID, this.state.password);
    }
  }

  handleButtonUp() {
    this.setState({
      buttonDown: false,
    });
  }

  handleMouseEnter() {
    if (this.state.privateLobby && !this.state.typing) {
      this.setState({
        buttonIcon: 'lock_open',
      });
    }
  }

  handleMouseLeave() {
    if (this.state.privateLobby && !this.state.typing) {
      this.setState({
        buttonIcon: 'lock',
      });    
    }
  }

  render() {
    const { classes } = this.props;
    return(
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item xs={10} className={classes.row}>
            <Slide appear={false} className={classes.content} in={!this.state.typing} direction='left' style={{width: '100%'}}>
              <div style={{visibility: this.state.typing ? 'hidden' : 'visible'}}>
                <Typography align='left' variant='caption' id='simple-modal-description'>
                  Lobby: {this.state.name}
                </Typography>
                <Typography align='left' variant='caption' id='simple-modal-description'>
                  ({this.state.playerCount}/{this.state.maxPlayers})
                </Typography>
              </div>
            </Slide>
            <Slide className={classes.content} in={this.state.typing} direction='right'>
              <div style={{visibility: this.state.typing ? 'visible' : 'hidden'}}>
                <TextField
                  id='password-field'
                  className={classes.passwordField}
                  inputRef={(input) => this.password = input}
                  autoFocus
                  error={this.state.password === ''}
                  placeholder='Lobby Password'
                  disabled={!this.state.typing}
                  onChange={
                    (evt) => {
                      const value = evt.target.value;
                      this.setState({
                        password: value,
                      })
                    }
                  }
                  onFocus={
                    (evt) => {
                      this.setState({
                        buttonColor: 'primary',
                        buttonIcon: 'arrow_forward',
                      });
                    }
                  }
                  onBlur={(evt) => {
                    this.setState({
                      typing: this.isTyping(),
                      buttonColor: 'secondary',
                      buttonIcon: 'lock',
                    });
                  }}
                />
              </div>
            </Slide>
          </Grid>
          <Grid item xs={2} className={classes.row}>
            <Button
              variant='raised'
              color={this.state.buttonColor}
              disabled={this.isButtonDisabled()}
              className={classes.button}
              buttonRef={(button) => this.joinButton = button}
              onMouseDown={this.handleButtonDown}
              onMouseUp={this.handleButtonUp}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
            >
              <Icon>{this.state.buttonIcon}</Icon>
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }

}

const mapStateToProps = (store = {}) => {
  return {
    userID: store.userID,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(Lobby));