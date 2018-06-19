import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { Paper, Slide, TextField, Divider, Grid, Typography } from '@material-ui/core';
import socket from '../client';
import {
  sendGuess,
} from '../actions/action';

const classes = theme => ({
  chatContainer: {
    height: '100%',
  },
  chatTextContainer: {
    height: '75%',
  },
  chatFieldContainer: {},
  chatField: {},
  chatText: {
    maxHeight: '100%',
    overflow: 'auto',
  },
  chatContent: {
    height: '100%',
    padding: 5,
  },
  chatFont: {
    fontSize: '1.8vmin',
  },
  username: {
    fontWeight: 'bold',
  },
  motd: {
    color: 'teal',
  },
  correct: {
    color: 'lightgreen',
  },
});

const MAX_GUESS_LENGTH = 30;
const SPACING = '\n \n \n \n \n \n \n';
const MOTD = '&motd(Welcome to the game!)\n&motd(Feel free to chat / make guesses below...)\n\t\n';
const DEFAULT_TEXT = SPACING + MOTD;

class Chat extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      shown: true,
      chatText: DEFAULT_TEXT,
      chatTimer: undefined,
    };
  }

  submitGuess() {
    const { dispatch } = this.props;
    let guessField = document.getElementById('guessfield');
    let guess = guessField.value;
    dispatch(sendGuess(socket, this.props.userID, guess));
    guessField.value = '';
  }

  componentWillMount() {
    this.setState({
      chatTimer:
        setInterval(() => {
          let chatTextNew = DEFAULT_TEXT;
          this.props.guesses.forEach(guessObj => {
            if (!guessObj.notification) {
              if (!this.props.mutedUsers.includes(guessObj.userID)) {
                chatTextNew += '\n&b(' + guessObj.username.toUpperCase() + "): " + guessObj.guess;
              }
            } else {
              chatTextNew += '\n' + guessObj.guess;
            }
          });

          if (this.state.chatText !== chatTextNew) {
            this.setState({
              chatText: chatTextNew,
            });
            document.getElementById('chatarea').scrollTop = document.getElementById('chatarea').scrollHeight;
          }  
        }, 1),
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.chatTimer);
  }

  componentDidMount() {
    document.getElementById('chatarea').scrollTop = document.getElementById('chatarea').scrollHeight;
  }

  renderChat() {
    const { classes } = this.props;
    const chatLines = this.state.chatText.split('\n');
    let items = [];
    let key = 0;

    chatLines.forEach(line => {
      let nameMatch = line.match(/^&b\(([^()]*)\)(.*)$/);
      let motdMatch = line.match(/^&motd\(([^()]*)\)$/);
      let correctMatch = line.match(/^&g\(([^()]*)\)$/);
      if (nameMatch) {
        let namePart = nameMatch[1];
        let messagePart = nameMatch[2];
        items.push(
          <Typography align='left' key={key++} variant='body2' className={classes.chatFont}>
            <span className={classes.username}>{namePart}</span>
            <span>{messagePart}</span>
          </Typography>
        );
      } else if (motdMatch) {
        let motdLine = motdMatch[1];
        items.push(
          <Typography align='left' key={key++} variant='body2' className={classes.chatFont}>
            <span className={classes.motd}>{motdLine}</span>
          </Typography>
        );
      } else if (correctMatch) {
        let correctLine = correctMatch[1];
        items.push(
          <Typography align='left' key={key++} variant='body2' className={classes.chatFont}>
            <span className={classes.correct}>{correctLine}</span>
          </Typography>
        );
      } else {
        items.push(
          <Typography align='left' key={key++} variant='body2' className={classes.chatFont}>
            {line}
          </Typography>
        );
      }  
    });

    return (
      items
    );
  }
  
  render() {
    const { classes } = this.props;
    return (
      <Slide in={this.state.shown} direction='up'>
        <Paper className={classes.chatContainer}>
          <Grid container className={classes.chatContent}>  
            <Grid item xs={12} className={classes.chatTextContainer}>
              <div id='chatarea' className={classes.chatText}>
                {this.renderChat()}
              </div>  
            </Grid>
            <Grid item xs={12} className={classes.chatFieldContainer}>
              <Divider/>
              <TextField
                id='guessfield'
                className={classes.chatField}
                placeholder='Enter Word Guess...'
                fullWidth
                onKeyPress={(evt) => {
                  if (evt.key === 'Enter') {
                    this.submitGuess();
                  }
                }}
                onChange={(evt) => {
                  let value = evt.target.value;
                  if (value.length > MAX_GUESS_LENGTH) {
                    evt.target.value = value.substring(0, MAX_GUESS_LENGTH - 1);
                  }
                }}
              />
            </Grid>  
          </Grid>  
        </Paper>
      </Slide>  
    );
  }
}

const mapStateToProps = (store = {}) => {
  return {
    userID: store.userID,
    guesses: store.guesses,
    mutedUsers: store.mutedUsers,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(Chat));