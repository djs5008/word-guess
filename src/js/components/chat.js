import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import * as Client from './client';
import { Paper } from '@material-ui/core';

const classes = theme => ({
  chatContainer: {
    width: '100%',
    height: '100%',
  }
});

class Chat extends Component {
  
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.chatContainer}>
      
      </Paper>
    );
  }
}

export default withStyles(classes)(Chat);