import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as Client from './client';
import { Paper, Typography } from '@material-ui/core';

const classes = theme => ({
  root: {
    width: '100%',
  },
  statusContainer: {
    width: '35%',
    maxWidth: 200,
    height: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    opacity: 1,
    backgroundColor: '#333',
  },
  gameRound: {
    width: '25%',
    maxWidth: 150,
    height: 45,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    opacity: 0.7,
    backgroundColor: '#333',
    transition: 'transform .3s',
  },
  roundTimer: {
    width: '25%',
    maxWidth: 150,
    height: 45,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    opacity: 0.7,
    backgroundColor: '#333',
    transition: 'transform .3s',
  },
  statusText: {
    color: 'white',
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  roundText: {
    color: 'white',
    position: 'relative',
    top: '50%',
    right: '10%',
    transform: 'translateY(-50%)',
  },
  roundTimerText: {
    color: 'white',
    position: 'relative',
    top: '50%',
    left: '10%',
    transform: 'translateY(-50%)',
  },
  textContainer: {
    width: '100%',
    height: '100%',
  }
});

class GameStatus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gameStarted: true,
      round: 0,
      currentWord: 'loading...',
      timeLeft: 90,
    };
  }

  getStatusText() {
    const { classes } = this.props;
    let text = '';
    let items = [];
    let key = 0;

    if (this.state.gameStarted) {
      text = 'Word:\nExample Word';
    } else {
      text = 'Game Starting Soon';
    }
    
    text.split('\n').forEach(line => {
      items.push(
        <div key={key++}>
          <span>{line}</span>
          <br/>
        </div>
      );
    });

    return (
      <Typography variant='body2' className={classes.statusText} align='center'>
        {items}
      </Typography>
    );
  }
  
  getRoundText() {
    const { classes } = this.props;
    let text = undefined;

    if (this.state.gameStarted) {
      text = 'Round: ' + this.state.round;
    }

    return (
      <Typography variant='body2' className={classes.roundText} align='center'>
        {text}
      </Typography>
    );
  }

  getRoundTimer() {
    const { classes } = this.props;
    let text = undefined;

    if (this.state.gameStarted) {
      text = 'Time Left: ' + this.state.timeLeft;
    }

    return (
      <Typography variant='body2' className={classes.roundTimerText} align='center'>
        {text}
      </Typography>
    );
  }

  render() {
    const { classes } = this.props;
    const gameRoundTransform = (this.state.gameStarted) ? 'translateX(-95%)' : null;
    const roundTimerTransform = (this.state.gameStarted) ? 'translateX(95%)' : null;

    return (
      <div id='game-status' className={classes.root}>
        <Paper className={classes.gameRound} style={{transform: gameRoundTransform}}>
          <div className={classes.textContainer}>
            {this.getRoundText()}
          </div>
        </Paper>
        <Paper className={classes.roundTimer} style={{ transform: roundTimerTransform }}>
          <div className={classes.textContainer}>
            {this.getRoundTimer()}
          </div>
        </Paper>
        <Paper className={classes.statusContainer}>
          <div className={classes.textContainer}>
            {this.getStatusText()}
          </div>
        </Paper>
      </div>
    );
  }

}

export default withStyles(classes)(GameStatus);