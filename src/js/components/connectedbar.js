import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { List, Typography, Divider, Button, Icon, Slide, Paper, Hidden } from '@material-ui/core';
import * as Client from './client'
import PlayerControlButton from './player-control-button';

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
      playerMaintainer: undefined,
      players: [],
      openControl: -1,
      created: false,
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
    this.state.players.forEach(playerInfo => {
      items.push(
        <PlayerControlButton 
          id={id} 
          key={playerInfo.username + id} 
          playerInfo={playerInfo} 
          created={this.state.created} 
          open={this.state.openControl === id}
          setControlOpen={this.setControlOpen}
          showMenu={this.props.showMenu}
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

    if (this.state.created) {
      result = (
        <Button
          className={classes.controlButton}
          variant='raised'
          color='primary'
          fullWidth
          onClick={this.props.startGame}
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

  componentDidMount() {
    this.setState({
      playerMaintainer: setInterval(() => {
        if (Client.state.activeLobby !== undefined) {
          if (JSON.stringify(this.state.players) !== JSON.stringify(Client.state.players)
            || this.state.created !== Client.state.createdLobby) {
            this.setState({
              players: Client.state.players,
              created: Client.state.createdLobby,
            });
          }
        } else {
          this.props.showMenu();
        }
      }, 100),
    });
  }

  componentWillUnmount() {
    clearTimeout(this.state.playerMaintainer);
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
              onClick={this.props.leaveGame}
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

export default withStyles(classes)(ConnectedBar);