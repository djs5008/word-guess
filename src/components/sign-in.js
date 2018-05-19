import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  modal: {
    display: 'flex',
    'align-items': 'center',
    justifyContent: 'center'
  },
  button: {
    'margin-top': 15,
  },
  textfield: {
    width: `100%`,
  }
});

class SignIn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      signedIn: false,
    };
  }
  
  setSignedIn(status) {
    this.setState({
      signedIn: status
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
        open={!this.state.signedIn}
        className={classes.modal}
      >
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
      </Modal>
    );
  }
}

export default withStyles(styles)(SignIn);