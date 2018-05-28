import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { ListItem, Button, Avatar, Hidden, Typography, Collapse, ListItemText, List, Divider, Grid } from '@material-ui/core';

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
    boxShadow: 'inset 0px 8px 8px -10px #666, inset 0px -8px 8px -10px #666',
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
      id: props.id,
      player: props.player,
      created: props.created,
      open: false,
    };
  }

  getControlItems() {

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
          <ListItemText className={classes.controlOption} primary="Kick" />
        </ListItem>
      );
      items.push(
        <ListItem key={3} button className={classes.nestedItem}>
          <ListItemText className={classes.controlOption} primary="Ban" />
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
      <Grid container justify='center' alignContent='center' alignItems='center' key={this.state.player}>
        <Grid item xs={12}>
          <ListItem className={classes.playerButtonContainer}>
            <Button
              className={classes.playerButton}
              color='default'
              variant='flat'
              fullWidth
              disabled={this.state.open}
              onClick={evt => this.props.setControlOpen(this.state.id)}
            >
              <Grid container justify='center' alignContent='center' alignItems='center'>
                <Grid item xs={4}>
                  <Avatar className={classes.avatar}>{this.state.player.split('')[0]}</Avatar>
                </Grid>
                <Grid item xs={6}>
                  <Hidden smDown>
                    <Typography variant='body2' color='textSecondary' align='left'>{this.state.player}</Typography>
                  </Hidden>
                </Grid>
              </Grid>
            </Button>
          </ListItem>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit className={classes.nested}>
            {this.getControlItems()}
          </Collapse>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(PlayerControlButton);