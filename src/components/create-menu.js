import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox'
import Divider from '@material-ui/core/Divider'
import { Row,Col, } from 'reactstrap';

const styles = theme => ({
  paper: {
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  button: {
    'margin-top': 15,
  },
});

class CreateMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lobbyName: '',
      maxPlayers: 5,
      rounds: 3,
      private: false,
      password: '',
      creating: false,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      creating: props.creating,
    });
  }

  checkValidLobbyName() {
    return this.state.lobbyName.match('^[A-Za-z0-9]+$');
  }

  checkMaxPlayers(value) {
    return value >= 2 && value <= 10;
  }

  checkRounds(value) {
    return value >= 1 && value <= 10;
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
      creating: false,
      lobbyName:'',
    });
    this.props.resetMenu();
  }

  render() {
    const { classes } = this.props;
    return (
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={this.state.creating}
        className={classes.modal}
        onBackdropClick={() => this.closeMenu()}
        onEscapeKeyDown={() => this.closeMenu()}
      >
        <div className={classes.paper}>
          <Typography variant='title' id='modal-title'>
            Create Word Guesser Lobby
          </Typography>
          <Typography variant='caption' id='simple-modal-description'>
            Fill out the lobby information below
          </Typography>
          <br/>
          <Divider/>
          <TextField
            id='lobbyname-field'
            inputRef={(input) => this.lobbyName = input}
            fullWidth={true}
            type='text'
            error={!this.checkValidLobbyName()}
            autoFocus={true}
            required={true}
            helperText='LOBBY NAME (ALPHANUMERIC)'
            onChange={(evt) => this.setState({
              lobbyName: this.lobbyName.value,
            })}
          />
          <TextField
            id='maxplayers-field'
            inputRef={(input) => this.maxPlayers = input}
            fullWidth={true}
            type='number'
            error={!this.checkMaxPlayers(this.state.maxPlayers)}
            required={true}
            helperText='MAX PLAYERS'
            value={this.state.maxPlayers}
            onChange={
              (evt) => {
                if (this.checkMaxPlayers(evt.target.valueAsNumber)) {
                  this.setState({
                    maxPlayers: this.maxPlayers.value,
                  })
                }
              }
            }
          />
          <TextField
            id='round-field'
            inputRef={(input) => this.rounds = input}
            fullWidth={true}
            type='number'
            error={!this.checkRounds(this.state.rounds)}
            required={true}
            helperText='NUM OF ROUNDS'
            value={this.state.rounds}
            onChange={
              (evt) => {
                if (this.checkRounds(evt.target.valueAsNumber)) {
                  this.setState({
                    rounds: this.rounds.value,
                  })
                }
              }
            }
          />
          <Row>
            <Col xs='4' sm='4' md='4'>
              <Checkbox
                id='private-field'
                required={true}
                checked={this.state.private}
                color='primary'
                onChange={(evt, checked) => this.setState({
                  private: checked,
                })}
              />
              <Typography variant='caption' id='private-label' align='left'>
                PRIVATE GAME?
              </Typography>
            </Col>
            <Col xs='8' sm='8' md='8'>
              <TextField
                id='password-field'
                inputRef={(input) => this.password = input}
                type='text'
                required={true}
                helperText='LOBBY PASSWORD'
                value={this.state.password}
                disabled={!this.state.private}
                error={!this.checkPassword()}
                style={{visibility: this.state.private ? 'visible' : 'hidden'}}
                onChange={
                  (evt) => {
                    this.setState({
                      password: this.password.value,
                    })
                  }
                }
              />
            </Col>
          </Row>
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
              alert('game created?');
              this.closeMenu();
            }}
          >
            Create Game
          </Button>
        </div>
      </Modal>
    );
  }
}

export default withStyles(styles)(CreateMenu);