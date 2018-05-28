import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { List, Typography, Divider, Button, Icon, Slide, Grid, ListItem, Avatar, Paper } from '@material-ui/core';

const ANIM_SLIDE_TIME = 500;
// const DRAWER_WIDTH = 200;

const styles = theme => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
  },
  content: {
    padding: 5,
    overflowY: 'auto',
    height: '100%',
  },
  iconAlign: {
    marginTop: '-0.125em',
    verticalAlign: 'middle',
  },
  controls: {
    position: 'fixed',
    margin: 5,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 1,
  },
  paper: {
    position: 'absolute',
    top: '3%',
    left: 0,
    opacity: 1,
    minWidth: 50,
    width: '15%',
    height: '94%',
    overflow: 'hidden',
  },
  controlButton: {
    opacity: 1,
  },
  playerButton: {
    width: '100%',
    paddingBottom: 2,
    paddingTop: 2,
    paddingLeft: 0,
    paddingRight: 0,
    opacity: 1,
  },
  avatar: {
    marginRight: 10,
  },
});

class Game extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      shown: false,
      lobbyID: props.lobbyID,
      players: [],
    };
    this.leaveGame = this.leaveGame.bind(this);
  }

  getConnectedPlayers() {
    const { classes } = this.props;
    let items = [];
    let id = 0;
    this.state.players.forEach(player => {
      items.push(
        <ListItem key={player + id++} className={classes.playerButton}>
          <Button
            color='primary'
            fullWidth
          >
            <Avatar className={classes.avatar}>{player.split('')[0]}</Avatar>
            <Typography variant='body2' color='textSecondary' align='center'>{player}</Typography>
          </Button>
        </ListItem>
      );
    });
    return (
      <List>
        {items}
      </List>
    );
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
      <Grid container className={classes.root} justify='center' alignContent='center' alignItems='center'>
        <Grid item xs={2}>
          <Slide
            in={this.state.shown}
            direction='right'
            timeout={ANIM_SLIDE_TIME}
          >
            <Paper className={classes.paper}>
              <br/>
              <Typography variant='body2' align='center'>Connected Players:</Typography>
              <br/>
              <Divider/>
              <div className={classes.content}>
                <div>
                  {this.getConnectedPlayers()}
                </div>
              </div>
              <div className={classes.controls}>
                <Divider/>
                <Button
                  className={classes.controlButton}
                  variant='raised'
                  color='secondary'
                  fullWidth
                  onClick={this.leaveGame}
                >
                  <Icon className={classes.iconAlign}>meeting_room</Icon>
                  <Typography variant='button' color='textSecondary'>&nbsp;Leave</Typography>
                </Button>
              </div>
            </Paper>
          </Slide>
        </Grid>
        <Grid item xs={10}>

        </Grid>
      </Grid>
    );
  }

}

export default withStyles(styles)(Game);