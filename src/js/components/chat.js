import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as Client from './client';
import { Paper, Slide, TextField, Divider } from '@material-ui/core';

const classes = theme => ({
  chatContainer: {
    width: '99.1%',
    height: '97%',
    marginBottom: 0,
    opacity: 1,
  },
  chatTextContainer: {
    height: '75%',
    maxHeight: '75%',
    overflow: 'auto',
  },
  chatFieldContainer: {
    height: '25%',
  },
  chatField: {
    height: '100%',
  },
  chatText: {
    // height: '100%',
    overflow: 'hidden',
  },
  chatContent: {
    height: '93%',
    padding: 5,
  }
});

class Chat extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      shown: true,
      chatText: '\\n\\n\\n\\n\\n\\n\\n'
    };

    // Keep chat up to date
    setInterval(() => {
      
      let chatTextNew = '\\n\\n\\n\\n\\n\\n\\n';
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
    }, 1);
  }

  submitGuess() {
    let guessField = document.getElementById('guessfield');
    let guess = guessField.value;
    Client.sendGuess(guess);
    guessField.value = '';
  }

  componentDidMount() {
    document.getElementById('chatarea').scrollTop = document.getElementById('chatarea').scrollHeight;
  }

  render() {
    const { classes } = this.props;
    return (
      <Slide in={this.state.shown} direction='up'>
        <Paper className={classes.chatContainer}>
          <div className={classes.chatContent}>  
            <div className={classes.chatTextContainer}>
              <TextField
                id='chatarea'
                className={classes.chatText}
                disabled
                multiline
                fullWidth
                value={this.state.chatText.replace(/\\n/g, '\n')}
                rows={5}
              />
            </div>
            <div className={classes.chatFieldContainer}>
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
              />
            </div>  
          </div>  
        </Paper>
      </Slide>  
    );
  }
}

export default withStyles(classes)(Chat);