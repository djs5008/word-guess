import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

const styles = theme => ({
  button: {
    'align-items': 'center',
    justifyContent: 'center',
    'margin-top': `50px`,
    'margin-left':`10px`,
    'margin-right':`10px`,
    'padding-top': 50,
    'padding-bottom': 50,
    'padding-right': 75,
    'padding-left': 75,
  },
  title: {
    display: 'flex',
    'align-items': 'center',
    justifyContent: 'center',
    color: '#999',
    'font-family': 'Lobster',
    'text-shadow': '3px 3px 3px #222'
  },
  center: {
    display: 'flex',
    'align-items': 'center',
    justifyContent: 'center'
  }
});

class MainMenu extends Component {
  
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <div className={{position: 'absolute'}}>
        <Typography 
          variant='display4' 
          id='menu-title' 
          className={classes.title}
        >
          Word Guesser!
        </Typography>
        <div className={classes.center}>
          <Button 
            variant='raised'
            color='primary'
            className={classes.button}
          >
            <Typography variant='title'><Icon>create</Icon>&nbsp;Create Game</Typography>
          </Button>

          <Button 
            variant='raised'
            className={classes.button}
          >
            <Typography variant='title'><Icon>send</Icon>&nbsp;Join Game</Typography>
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(MainMenu);