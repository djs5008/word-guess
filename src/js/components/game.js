import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { List, Typography, Divider, Button, Icon, Slide, Grid, Paper, Hidden } from '@material-ui/core';
import PlayerControlButton from './player-control-button';

const ANIM_SLIDE_TIME = 500;
// const DRAWER_WIDTH = 200;

const styles = theme => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
  },
  content: {
    padding: 5,
    overflowY: 'auto',
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
    position: 'absolute',
    top: '3%',
    left: 0,
    opacity: 1,
    minWidth: 50,
    width: '15%',
    height: '94%',
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

class Game extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      lobbyID: props.lobbyID,
      created: props.created,
      openControl: -1,
      players: [],
    };
    this.leaveGame = this.leaveGame.bind(this);
    this.setControlOpen = this.setControlOpen.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  setControlOpen(id) {
    setTimeout(() => {
      this.setState({
        openControl: id,
      });
    }, 0);
  }

  getConnectedPlayers() {
    let items = [];
    let id = 0;
    this.state.players.forEach(player => {
      items.push(
        <PlayerControlButton 
          id={id} 
          key={player + id} 
          player={player} 
          created={this.state.created} 
          open={this.state.openControl === id}
          setControlOpen={this.setControlOpen}
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
  
  leaveGame() {
    setTimeout(() => {
      this.props.startLoading(false, 'Leaving game...');
      this.props.leaveGame(() => {
        this.props.showMenu();
      });
    }, 0);
  }

  startGame() {

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
          onClick={this.startGame}
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

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
      players: props.players,
      created: props.created,
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid container className={classes.root} justify='center' alignContent='center' alignItems='center'>
        <Grid item xs={2}>
          <Slide
            in={this.state.shown}
            direction='right'
            timeout={ANIM_SLIDE_TIME}
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
                  onClick={this.leaveGame}
                >
                  <Icon className={classes.iconAlign}>meeting_room</Icon>
                  <Hidden xsDown>
                    <Typography variant='button' color='textSecondary'>&nbsp;Leave</Typography>
                  </Hidden>
                </Button>
              </div>
            </Paper>
          </Slide>
        </Grid>
        <Grid item xs={10}>

        </Grid>
      </Grid>
    );
  }

}

export default withStyles(styles)(Game);