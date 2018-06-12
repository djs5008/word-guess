import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Slide, Grid } from '@material-ui/core';
import * as Client from './client';
import Canvas from './canvas';
import Chat from './chat';
import ConnectedBar from './connectedbar'
import CanvasControls from './canvas-controls';
import GameStatus from './game-status';

const styles = theme => ({
  root: {
    width: '100%',
    height: '95%',
    overflow: 'hidden',
  },
  gameContainer: {
    width: '100%',
    height: '100%',
  },
  canvasGridContainer: {
    width: '100%',
    height: '80%',
  },
  canvasContainer: {
    width: '82%',
    height: '74%',
    position: 'absolute',
  },
  chatContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  chatGridContainer: {
    width: '100%',
    height: '20%',
    position: 'relative',
  },
});

class Game extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      shown: props.shown,
      lobbyID: Client.state.activeLobby,
      created: props.created,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
      created: props.created,
    });
  }

  leaveGame() {
    setTimeout(() => {
      this.props.startLoading(false, 'Leaving game...');
      Client.leaveLobby(() => {
        this.props.showMenu();
      });
    }, 0);
  }

  startGame() {

  }

  render() {
    const { classes } = this.props;

    return (
      <Grid
        container
        className={classes.root}
        spacing={8}
        direction='row'
        justify='center'
        alignContent='stretch'
        alignItems='stretch'
      >
        <Grid item xs={2}>
          <ConnectedBar
            showMenu={this.props.showMenu}
            startGame={this.startGame.bind(this)}
            leaveGame={this.leaveGame.bind(this)}
          />  
        </Grid>
        <Grid item xs={10} style={{paddingBottom: 0}}>
          <Grid
            container
            className={classes.gameContainer}
            justify='center'
            alignItems='stretch'
            alignContent='stretch'
            spacing={8}
          >
            <Grid className={classes.canvasGridContainer} item xs={12}>
              <Slide in={this.state.shown} direction='down' >
                <div id='canvasContainer' className={classes.canvasContainer}>
                  <Canvas />
                  <GameStatus />
                  <CanvasControls />
                </div>
              </Slide>
            </Grid>
            <Grid className={classes.chatGridContainer} item xs={12} style={{paddingBottom: 0}}>
              <div className={classes.chatContainer}>  
                <Chat />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

}

export default withStyles(styles)(Game);