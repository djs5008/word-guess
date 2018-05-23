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

  render() {
    const { classes } = this.props;
    return(
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item xs={10} className={classes.row}>
            <Slide className={classes.content} in={!this.state.typing} direction='left' style={{width: '100%'}}>
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
                  error={this.password === ''}
                  required={true}
                  placeholder='Lobby Password'
                  disabled={!this.state.typing}
                  onChange={
                    (evt) => {
                      this.setState({
                        password: this.password.value,
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
                      typing: this.state.buttonDown,
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
              disabled={this.isLobbyFull()}
              className={classes.button}
              buttonRef={(button) => this.joinButton = button}
              onMouseDown={(evt) => {
                this.setState({
                  buttonDown: true,
                  typing: (this.state.privateLobby) ? true : false,
                });
                if (this.state.privateLobby) {
                  setTimeout(() => this.password.focus(), 0);
                }
              }}
              onMouseUp={
                (evt) => {
                  this.setState({
                    buttonDown: false,
                  });
                }
              }
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