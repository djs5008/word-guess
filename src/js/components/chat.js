import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as Client from './client';
import { Paper, Slide, TextField, Divider, Grid } from '@material-ui/core';

const classes = theme => ({
  chatContainer: {
    width: '99.1%',
    height: '97%',
    marginBottom: 0,
  },
  chatTextContainer: {
    height: '75%',
  },
  chatFieldContainer: {},
  chatField: {},
  chatText: {
    maxHeight: '100%',
    flexDirection: 'inherit',
  },
  chatContent: {
    height: '100%',
    padding: 5,
  }
});

const MAX_GUESS_LENGTH = 30;
const SPACING = '\\n\\n\\n\\n\\n\\n\\n';
const MOTD = 'Welcome to the game!\\nFeel free to chat / make guesses below...\\n';
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
    let guessField = document.getElementById('guessfield');
    let guess = guessField.value;
    Client.sendGuess(guess);
    guessField.value = '';
  }

  componentWillMount() {
    this.setState({
      chatTimer:
        setInterval(() => {
          let chatTextNew = DEFAULT_TEXT;
          Client.state.guesses.forEach(guessObj => {
            if (!Client.state.mutedUsers.includes(guessObj.userID)) {
              chatTextNew += '\\n' + guessObj.username.toUpperCase() + ": " + guessObj.guess;
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

  render() {
    const { classes } = this.props;
    return (
      <Slide in={this.state.shown} direction='up'>
        <Paper className={classes.chatContainer}>
          <Grid container className={classes.chatContent}>  
            <Grid item xs={12} className={classes.chatTextContainer}>
              <TextField
                id='chatarea'
                className={classes.chatText}
                disabled
                multiline
                fullWidth
                value={this.state.chatText.replace(/\\n/g, '\n')}
                rows={7}
              />
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

export default withStyles(classes)(Chat);