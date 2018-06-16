import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { List, Typography, Divider, Button, Icon, Slide, Paper, Hidden } from '@material-ui/core';
import PlayerControlButton from './player-control-button';
import socket from '../client';
import {
  sendLeaveLobby,
  startGame,
} from '../actions/action';

const classes = theme => ({
  content: {
    padding: 5,
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
  },
  iconAlign: {
    marginTop: '-0.125em',
    verticalAlign: 'middle',
  },
  controls: {
    position: 'fixed',
    margin: 5,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 1,
  },
  paper: {
    opacity: 1,
    minWidth: 50,
    minHeight: '100%',
    overflow: 'hidden',
  },
  controlHeader: {
    margin: 5,
    fontSize: '1.8vmin',
  },
  controlButton: {
    opacity: 1,
    minWidth: 0,
    overflow: 'hidden',
    marginBottom: 5,
  },
});

class ConnectedBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shown: true,
      openControl: -1,
      activeDrawer: undefined,
      correctUsers: [],
    };
    this.setControlOpen = this.setControlOpen.bind(this);
  }

  setControlOpen(id) {
    setTimeout(() => {
      if (this.state.openControl !== id) {
        this.setState({
          openControl: id,
        });
      } else {
        this.setState({
          openControl: -1,
        });
      }
    }, 0);
  }

  getConnectedPlayers() {
    let items = [];
    let id = 0;
    this.props.players.forEach(playerInfo => {
      items.push(
        <PlayerControlButton 
          id={id} 
          key={playerInfo.username + id} 
          playerInfo={playerInfo} 
          open={this.state.openControl === id}
          setControlOpen={this.setControlOpen}
          showMenu={this.props.showMenu}
          active={this.props.activeDrawer === playerInfo.userID}
          guessedCorrectly={this.props.correctUsers.includes(playerInfo.userID)}
        />
      );
      id++;
    });
    return (
      <List>
        {items}
      </List>
    );
  }

  showStartButton() {
    const { classes } = this.props;
    let result = null;

    if (this.props.createdLobby && this.props.activeDrawer === undefined) {
      result = (
        <Button
          className={classes.controlButton}
          variant='raised'
          color='primary'
          fullWidth
          onClick={this.startGame.bind(this)}
        >
          <Hidden xsDown>
            <Typography variant='button' color='textSecondary'>Start&nbsp;</Typography>
          </Hidden>
          <Icon>play_circle_filled</Icon>
        </Button>
      );
    }

    return (result);
  }

  leaveGame() {
    const { dispatch } = this.props;
    setTimeout(() => {
      this.props.startLoading(false, 'Leaving game...');
      dispatch(sendLeaveLobby(socket, this.props.userID, () => {
        this.props.showMenu();
      }));
    }, 0);
  }

  startGame() {
    const { dispatch } = this.props;
    dispatch(startGame(socket, this.props.userID, this.props.activeLobby));
  }

  render() {
    const { classes } = this.props;

    return (
      <Slide
        in={this.state.shown}
        direction='right'
      >
        <Paper className={classes.paper}>
          <Typography className={classes.controlHeader} variant='body2' align='center'>Connected Players:</Typography>
          <Divider/>
          <div className={classes.content}>
            <div>
              {this.getConnectedPlayers()}
            </div>
          </div>
          <div className={classes.controls}>
            <Divider/>
            {this.showStartButton()}
            <Button
              className={classes.controlButton}
              variant='raised'
              color='secondary'
              fullWidth
              onClick={this.leaveGame.bind(this)}
            >
              <Icon className={classes.iconAlign}>meeting_room</Icon>
              <Hidden xsDown>
                <Typography variant='button' color='textSecondary'>&nbsp;Leave</Typography>
              </Hidden>
            </Button>
          </div>
        </Paper>
      </Slide>
    );
  }
}

const mapStateToProps = (store = {}) => {
  return {
    userID: store.userID,
    activeLobby: store.activeLobby,
    createdLobby: store.createdLobby,
    players: store.players,
    activeDrawer: store.gameState.activeDrawer,
    correctUsers: store.gameState.correctUsers,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(ConnectedBar));