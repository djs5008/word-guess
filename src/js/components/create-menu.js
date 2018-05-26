import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Modal, TextField, Button, Checkbox, Divider, Grid, Grow, Tooltip } from '@material-ui/core';

const styles = theme => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    width: 'auto',
  },
  button: {
    marginTop: 15,
  },
});

const MAX_LOBBY_LENGTH = 20;
const MAX_PASSWORD_LENGTH = 20;
const MIN_PLAYER_COUNT = 2;
const MAX_PLAYER_COUNT = 10;
const MIN_ROUND_COUNT = 1;
const MAX_ROUND_COUNT = 10;
const LOBBY_NAME_MATCHER = /^[A-Za-z0-9]+[A-Za-z0-9 ]*$/;
const ANIM_GROW_TIME = 500;

class CreateMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lobbyName: '',
      maxPlayers: 5,
      rounds: 3,
      private: false,
      password: '',
      shown: props.shown,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
    });
  }

  checkValidLobbyName() {
    return this.state.lobbyName.match(LOBBY_NAME_MATCHER);
  }

  checkMaxPlayers(value) {
    return value >= MIN_PLAYER_COUNT && value <= MAX_PLAYER_COUNT;
  }

  checkRounds(value) {
    return value >= MIN_ROUND_COUNT && value <= MAX_ROUND_COUNT;
  }

  checkPassword() {
    return !this.state.private || (this.state.private && this.state.password !== '');
  }

  checkAllOptions() {
    return this.checkValidLobbyName() 
      && this.checkMaxPlayers(this.state.maxPlayers) 
      && this.checkRounds(this.state.rounds)
      && this.checkPassword();
  }

  closeMenu() {
    this.setState({
      shown: false,
      lobbyName:'',
    });
    this.props.showMenu();
  }

  createLobby() {
    this.props.startLoading(true, 'Setting up lobby...');
    this.props.createLobby(
      this.state.lobbyName, 
      this.state.maxPlayers, 
      this.state.rounds, 
      this.state.private, 
      this.state.password, (status) => {
        if (status) {
          this.props.showGameLobby();
        } else {
          this.props.showMenu();
        }
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={this.state.shown}
        onBackdropClick={() => this.closeMenu()}
        onEscapeKeyDown={() => this.closeMenu()}
        disableRestoreFocus
      >
        <Grid container justify='center' alignContent='center' alignItems='center' style={{pointerEvents: 'none'}}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Grow in={this.state.shown} timeout={ANIM_GROW_TIME}>
              <div className={classes.paper} style={{pointerEvents: 'auto'}}>
                <Typography variant='title' id='modal-title'>
                  Create Word Guesser Lobby
                </Typography>
                <Typography variant='caption' id='simple-modal-description'>
                  Fill out the lobby information below
                </Typography>
                <br/>
                <Divider/>
                <Tooltip
                  open={this.state.lobbyName.length > 0 && !this.checkValidLobbyName()}
                  placement='bottom'
                  title={'Invalid Characters: \'' + this.state.lobbyName.replace(/[a-zA-Z0-9 ]/g, '') + '\''}
                  enterDelay={500}
                >
                  <TextField
                    id='lobbyname-field'
                    type='text'
                    error={!this.checkValidLobbyName()}
                    value={this.state.lobbyName}
                    helperText='LOBBY NAME (ALPHANUMERIC)'
                    fullWidth
                    autoFocus
                    required
                    onChange={(evt) => {
                      const value = evt.target.value;
                      if (value.length <= MAX_LOBBY_LENGTH) {
                        this.setState({
                          lobbyName: value,
                        });
                      }
                    }}
                  />
                </Tooltip>
                <TextField
                  id='maxplayers-field'
                  type='number'
                  error={!this.checkMaxPlayers(this.state.maxPlayers)}
                  helperText='MAX PLAYERS'
                  fullWidth
                  required
                  value={this.state.maxPlayers}
                  onChange={(evt) => {
                    const value = evt.target.valueAsNumber;
                    if (this.checkMaxPlayers(value)) {
                      this.setState({
                        maxPlayers: value,
                      })
                    }
                  }}
                />
                <TextField
                  id='round-field'
                  type='number'
                  error={!this.checkRounds(this.state.rounds)}
                  fullWidth
                  required
                  helperText='NUM OF ROUNDS'
                  value={this.state.rounds}
                  onChange={(evt) => {
                    const value = evt.target.valueAsNumber;
                    if (this.checkRounds(value)) {
                      this.setState({
                        rounds: value,
                      });
                    }
                  }}
                />
                <Grid container>
                  <Grid item xs={4}>
                    <Checkbox
                      id='private-field'
                      checked={this.state.private}
                      color='primary'
                      required
                      onChange={(evt, checked) => {
                        this.setState({
                          private: checked,
                        });
                      }}
                    />
                    <Typography variant='caption' id='private-label' align='left'>
                      PRIVATE GAME?
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      id='password-field'
                      type='text'
                      helperText='LOBBY PASSWORD'
                      value={this.state.password}
                      disabled={!this.state.private}
                      error={!this.checkPassword()}
                      style={{visibility: this.state.private ? 'visible' : 'hidden'}}
                      required
                      onChange={(evt) => {
                        const value = evt.target.value;
                        if (value.length <= MAX_PASSWORD_LENGTH) {
                          this.setState({
                            password: value,
                          })
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <br/>
                <Divider/>
                <Button 
                  id='create-button'
                  className={classes.button}
                  fullWidth={true}
                  variant='raised'
                  color='primary'
                  buttonRef={(button) => this.signinButton = button}
                  disabled={!this.checkAllOptions()}
                  onClick={() => {
                    this.createLobby();
                  }}
                >
                  Create Game
                </Button>
              </div>
            </Grow>
          </Grid>
        </Grid>
      </Modal>
    );
  }
}

export default withStyles(styles)(CreateMenu);