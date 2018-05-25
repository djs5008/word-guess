import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Modal, TextField, Button, Grid, Grow } from '@material-ui/core';

const styles = theme => ({
  paper: {
    width: 'auto',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  button: {
    marginTop: 15,
  },
  textfield: {
    width: '100%',
  }
});

const ANIM_GROW_TIME = 500;

class SignIn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shown: props.shown,
      username: '',
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
    });
  }
  
  setSignedIn(status) {
    this.props.startLoading(false);
    this.props.setLoadingText('Signing in...');
    this.props.register(this.state.username, () => {
      this.props.showMenu();
    });
  }

  checkValidUsername() {
    return this.state.username.match('^[A-Za-z0-9]+$');
  }

  render() {
    const { classes } = this.props;
    return (
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={this.state.shown}
        disableRestoreFocus
      >
        <Grid container justify='center' alignContent='center' alignItems='center'>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Grow in={this.state.shown} timeout={ANIM_GROW_TIME}>
              <div className={classes.paper}>
                <Typography variant='title' id='modal-title'>
                  Sign-In to Word Guesser!
                </Typography>
                <Typography variant='caption' id='simple-modal-description'>
                  Enter a valid username below (alphanumeric)
                </Typography>
                <TextField
                  id='username-field'
                  inputRef={(input) => this.usernameField = input}
                  className={classes.textfield}
                  type='text'
                  error={!this.checkValidUsername()}
                  autoFocus={true}
                  required={true}
                  helperText='USERNAME'
                  onKeyPress={(evt) => {
                    if (evt.key === 'Enter') {
                      if (this.checkValidUsername()) {
                        this.signinButton.click();
                      }
                    }
                  }}
                  onChange={(evt) => this.setState({
                    username: this.usernameField.value,
                  })}
                >
                </TextField>
                <Button 
                  id='signin-button'
                  className={classes.button}
                  fullWidth={true}
                  variant='raised'
                  color='primary'
                  buttonRef={(button) => this.signinButton = button}
                  disabled={!this.checkValidUsername()}
                  onClick={() => {
                    this.setSignedIn(true);
                  }}
                >
                  Sign-In
                </Button>
              </div>
            </Grow>
          </Grid>
        </Grid>
      </Modal>
    );
  }
}

export default withStyles(styles)(SignIn);