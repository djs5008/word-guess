import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { ListItem, Button, Avatar, Hidden, Typography, Collapse, ListItemText, List, Divider, Grid, Slide, ListItemIcon, Icon } from '@material-ui/core';
import socket from '../client';
import {
  sendKickUser,
  sendBanUser,
  MuteUser,
  UnmuteUser,
} from '../actions/action';

const classes = theme => ({
  avatar: {
  },
  activeAvatar: {
    backgroundColor: 'lightblue',
  },
  correctAvatar: {
    backgroundColor: 'lightgreen',
  },
  playerButtonContainer: {
    width: '100%',
    padding: '2px 0px 2px 0px',
    margin: 0,
    minWidth: 0,
    opacity: 1,
  },
  playerButton: {
    width: '100%',
    padding: '5px 0px 5px 0px',
    minWidth: 0,
  },
  nested: {
    // boxShadow: 'inset 0px 20px 20px -20px #666, inset 0px -20px 20px -20px #666',
    border: '1px #CCC solid',
  },
  nestedItem: {
    height: 20,
  },
  controlOption: {
    textAlign: 'left',
  },
});

class PlayerControlButton extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shown: true,
      id: props.id,
      playerInfo: props.playerInfo,
      created: props.created,
      active: props.active,
      open: false,
    };
  }

  kickUser() {
    const { dispatch } = this.props;
    dispatch(sendKickUser(socket, this.props.userID, this.state.playerInfo.userID, (userID) => {
      console.log('kicked user: ' + this.state.playerInfo.username);
    }));
    this.props.setControlOpen(-1);
  }

  banUser() {
    const { dispatch } = this.props;
    dispatch(sendBanUser(socket, this.props.userID, this.state.playerInfo.userID, (userID) => {
      console.log('banned user: ' + this.state.playerInfo.username);
    }));
    this.props.setControlOpen(-1);
  }

  toggleMute() {
    const { dispatch } = this.props;
    if (this.props.mutedUsers.includes(this.state.playerInfo.userID)) {
      dispatch(UnmuteUser(this.state.playerInfo.userID));
    } else {
      dispatch(MuteUser(this.state.playerInfo.userID));
    }
  }

  getControlItems(playerInfo) {

    const { classes } = this.props;
    let items = [];

    items.push(
      <ListItem key={1} button className={classes.nestedItem}>
        <ListItemIcon>
          <Icon>{this.props.mutedUsers.includes(this.state.playerInfo.userID) ? 'speaker_notes' : 'speaker_notes_off'}</Icon>
        </ListItemIcon>
        <Hidden smDown>
          <ListItemText
            className={classes.controlOption}
            primary={this.props.mutedUsers.includes(this.state.playerInfo.userID) ? 'Unmute' : 'Mute'}
            onClick={this.toggleMute.bind(this)}
          />
        </Hidden>  
      </ListItem>
    );

    if (this.props.createdLobby) {
      items.push(
        <ListItem key={2} button className={classes.nestedItem}>
          <ListItemIcon>
            <Icon>warning</Icon>
          </ListItemIcon>
          <Hidden smDown>  
            <ListItemText
              className={classes.controlOption}
              primary='Kick'
              onClick={this.kickUser.bind(this)}
            />
          </Hidden>  
        </ListItem>
      );
      items.push(
        <ListItem key={3} button className={classes.nestedItem}>
          <ListItemIcon>
            <Icon>error_outline</Icon>
          </ListItemIcon>
          <Hidden smDown>
            <ListItemText
              className={classes.controlOption}
              primary='Ban'
              onClick={this.banUser.bind(this)}
            />
          </Hidden>  
        </ListItem>
      );
    }

    return (
      <List component="div" disablePadding>
        <Divider key={'d1'}/>
        {items}
        <Divider key={'d2'}/>
      </List>
    );
  }

  componentWillReceiveProps(props) {
    this.setState({
      created: props.created,
      open: props.open,
      active: props.active,
      guessedCorrectly: props.guessedCorrectly,
    })
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container justify='center' alignContent='center' alignItems='center' key={this.state.playerInfo.userID}>
        <Grid item xs={12}>
          <Slide in={this.state.shown} direction='right'>
            <div>  
              <ListItem className={classes.playerButtonContainer}>
                <Button
                  className={classes.playerButton}
                  color='default'
                  variant='flat'
                  fullWidth
                  disabled={this.state.playerInfo.userID === this.props.userID}
                  onClick={evt => this.props.setControlOpen(this.state.id)}
                >
                  <Grid container justify='center' align='center' alignContent='center' alignItems='center'>
                    <Grid item xs={12} md={4}>
                      <Avatar className={this.state.active ? classes.activeAvatar : (this.props.correctUsers.includes(this.state.playerInfo.userID)) ? classes.correctAvatar : classes.avatar}>{this.state.playerInfo.username.split('')[0]}</Avatar>
                    </Grid>
                    <Hidden smDown>
                      <Grid item xs={12} md={6}>
                        <Typography variant='body2' color='textSecondary' align='left'>{this.state.playerInfo.username}</Typography>
                        <Typography variant='body2' color='textSecondary' align='left'>Score: {this.props.scores[this.state.playerInfo.userID]}</Typography>
                      </Grid>
                    </Hidden>
                    <Hidden mdUp>
                      <Grid item xs={12} md={6}>
                        <Typography variant='body2' color='textSecondary' align='center'>{this.state.playerInfo.username}</Typography>
                        <Typography variant='body2' color='textSecondary' align='center'>Score: {this.props.scores[this.state.playerInfo.userID]}</Typography>
                      </Grid>
                    </Hidden>
                  </Grid>
                </Button>
              </ListItem>
              <Collapse in={this.state.open} unmountOnExit className={classes.nested}>
                {this.getControlItems()}
              </Collapse>
            </div>
          </Slide>  
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (store = {}) => {
  return {
    userID: store.userID,
    mutedUsers: store.mutedUsers,
    createdLobby: store.createdLobby,
    correctUsers: store.gameState.correctUsers,
    scores: store.gameState.scores,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(PlayerControlButton));
