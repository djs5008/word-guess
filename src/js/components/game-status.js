import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Hidden } from '@material-ui/core';
import {
  
} from '../actions/action';

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
    whiteSpace: 'pre-wrap',
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
    this.state = {};
  }

  getStatusText() {
    const { classes } = this.props;
    let text = '';
    let items = [];
    let key = 0;

    if (this.props.gameStarted) {
      text = 'Word:\n' + this.props.currentWord;
    } else {
      if (this.props.winner) {
        text = 'Winner:\n' + this.props.winner;
      } else {
        text = 'Game Starting Soon';
      }
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

    if (this.props.gameStarted) {
      text = 'Round: ' + this.props.round;
    }

    return (
      <Typography variant='body2' className={classes.roundText} align='center'>
        {text}
      </Typography>
    );
  }

  getRoundTimer() {
    const { classes } = this.props;

    let gbColor = (255 * (this.props.timeLeft / 45));
    gbColor = (gbColor > 255) ? 255 : gbColor;

    return (
      <Typography variant='body2' className={classes.roundTimerText} align='center'>
        <Hidden xsDown>
          <span>Time Left: </span>
        </Hidden>
        <span style={{color: 'rgb(255,' + gbColor + ',' + gbColor + ')'}}>{this.props.timeLeft}</span>
      </Typography>
    );
  }

  render() {
    const { classes } = this.props;
    const gameRoundTransform = (this.props.gameStarted) ? 'translateX(-95%)' : null;
    const roundTimerTransform = (this.props.gameStarted) ? 'translateX(95%)' : null;

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

const mapStateToProps = (store = {}) => {
  return {
    gameStarted: store.gameState.started,
    currentWord: store.gameState.currentWord,
    round: store.gameState.round,
    timeLeft: store.gameState.timeLeft,
    winner: store.gameState.winner,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(GameStatus));