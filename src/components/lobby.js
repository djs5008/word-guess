import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Paper, Button, Icon, Slide, TextField } from '@material-ui/core';
import { Container,Row,Col, } from 'reactstrap';

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
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0,
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
        <Container className={classes.container}>
          <Row className={classes.row}>
            <Col xs='10' sm='10' md='10' lg='10' className={classes.row}>
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
            </Col>
            <Col xs='2' sm='2' md='2' lg='2' className={classes.row}>
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
            </Col>
          </Row>
        </Container>
      </Paper>
    );
  }

}

export default withStyles(styles)(Lobby);