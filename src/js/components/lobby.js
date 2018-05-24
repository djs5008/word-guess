import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button, Icon, Slide, TextField, Grid } from '@material-ui/core';

const styles = theme => ({
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
      name: 'Test Lobby Name',
      privateLobby: true,
      maxPlayers: 5,
      playerCount: 2,
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
      || (this.state.privateLobby && this.state.typing && this.state.password === '');
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

  handleButtonDown() {
    this.setState({
      buttonDown: true,
      typing: (this.state.privateLobby) ? true : false,
    });
    if (this.state.privateLobby && !this.state.typing) {
      setTimeout(() => this.password.focus(), 0);
    } else {
      this.props.joinLobby();
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

export default withStyles(styles)(Lobby);