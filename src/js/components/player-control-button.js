import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, Button, Avatar, Hidden, Typography, Collapse, ListItemText, List, Divider, Grid, Slide } from '@material-ui/core';
import * as Client from './client';

const styles = theme => ({
  avatar: {
    marginRight: 10,
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
    boxShadow: 'inset 0px 20px 20px -20px #666, inset 0px -20px 20px -20px #666',
    border: '0px #CCC solid',
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
      open: false,
    };
  }

  kickUser() {
    Client.kickUser(this.state.playerInfo.userID, (userID) => {
      console.log('kicked user: ' + this.state.playerInfo.username);
    });
    this.props.setControlOpen(-1);
  }

  banUser() {
    Client.banUser(this.state.playerInfo.userID, (userID) => {
      console.log('banned user: ' + this.state.playerInfo.username);
    });
    this.props.setControlOpen(-1);
  }

  getControlItems(playerInfo) {

    const { classes } = this.props;
    let items = [];

    items.push(
      <ListItem key={1} button className={classes.nestedItem}>
        <ListItemText className={classes.controlOption} primary="Mute" />
      </ListItem>
    );

    if (this.state.created) {
      items.push(
        <ListItem key={2} button className={classes.nestedItem}>
          <ListItemText className={classes.controlOption} primary="Kick" onClick={this.kickUser.bind(this)} />
        </ListItem>
      );
      items.push(
        <ListItem key={3} button className={classes.nestedItem}>
          <ListItemText className={classes.controlOption} primary="Ban" onClick={this.banUser.bind(this)} />
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
                  onClick={evt => this.props.setControlOpen(this.state.id)}
                >
                  <Grid container justify='center' alignContent='center' alignItems='center'>
                    <Grid item xs={4}>
                      <Avatar className={classes.avatar}>{this.state.playerInfo.username.split('')[0]}</Avatar>
                    </Grid>
                    <Grid item xs={6}>
                      <Hidden smDown>
                        <Typography variant='body2' color='textSecondary' align='left'>{this.state.playerInfo.username}</Typography>
                      </Hidden>
                    </Grid>
                  </Grid>
                </Button>
              </ListItem>
              <Collapse in={this.state.open} timeout="auto" unmountOnExit className={classes.nested}>
                {this.getControlItems()}
              </Collapse>
            </div>
          </Slide>  
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(PlayerControlButton);