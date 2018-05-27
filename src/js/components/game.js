import React, { Component } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Drawer, List, Typography, Divider, Button, Icon, Grid } from '@material-ui/core';

// const ANIM_SLIDE_TIME = 500;
// const DRAWER_WIDTH = 200;

const styles = theme => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
  },
  iconAlign: {
    marginTop: '-0.125em',
    verticalAlign: 'middle',
  },
  controls: {
    position: 'absolute',
    margin: 5,
    bottom: 0,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: 300,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
});

class Game extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      lobbyID: props.lobbyID,
      players: undefined,
    };
    this.leaveGame = this.leaveGame.bind(this);
  }

  getConnectedPlayers() {

  }
  
  leaveGame() {
    setTimeout(() => {
      this.props.startLoading(false, 'Leaving game...');
      this.props.leaveGame(() => {
        this.props.showMenu();
      });
    }, 0);
  }

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
      players: props.players,
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid item xs={12} className={classes.root}>
        <Drawer
          anchor='left'
          variant='permanent'
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.shown && classes.drawerPaperClose),
          }}
        >
          <div>
            <br/>
            <Typography variant='caption'>Connected Players:</Typography>
            <List>
              {this.getConnectedPlayers()}
            </List>
            <Divider/>
            <div className={classes.controls}>
              <Button
                variant='raised'
                color='secondary'
                onClick={this.leaveGame}
              >
                <Icon className={classes.iconAlign}>meeting_room</Icon>
                <Typography variant='button' color='textSecondary'>&nbsp;Leave</Typography>
              </Button>
            </div>
          </div>
        </Drawer>
      </Grid>
    );
  }

}

export default withStyles(styles)(Game);