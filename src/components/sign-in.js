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
    justifyContent: 'center'
  },
  button: {
    "margin-top": 5,
  },
  textfield: {
    width: `100%`,
  }
});

class SignIn extends Component {
  
  setSignedIn(signedIn) {
    this.signedIn = signedIn;
  }

  checkValidUsername() {
    const username = this.usernameField.value;
    return username.matches('Aa-Zz0-9');
  }

  render() {
    const { classes } = this.props;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!this.signedIn}
        onClose={this.setSignedIn(true)}
        className={classes.modal}
      >
        <div className={classes.paper}>
          <Typography variant="title" id="modal-title">
            Sign-In to Word Guesser!
          </Typography>
          <Typography variant="caption" id="simple-modal-description">
            Enter a valid username below (alphanumeric)
          </Typography>
          <TextField
            id="usernameField"
            inputRef={(input) => this.usernameField = input}
            className={classes.textfield}
            type="text"
            autoFocus={true}
            required={true}
            helperText="USERNAME"
          >
          </TextField>
          <Button 
            className={classes.button}
            fullWidth={true}
            variant="raised"
            color="primary"
            //disabled={this.checkValidUsername()}
            onClick={() => {
              //alert(this.refs.usernameField.value);
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