import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, Typography, Modal, Divider, Grid, Grow } from '@material-ui/core';
import Lobby from './lobby';

const styles = theme => ({
  paper: {
    width: 'auto',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  button: {
    marginTop: 15,
  },
  scroll: {
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: 300,
    width: '100%',
  },
  lobby: {
    paddingTop: 5,
    paddingBottom: 5,
  }
});

const ANIM_GROW_TIME = 500;

class JoinMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      joining: false,
    };
    this.closeMenu = this.closeMenu.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      joining: props.joining,
    });
  }

  closeMenu() {
    this.setState({
      joining: false,
      lobbyName:'',
    });
    this.props.resetMenu();
  }

  getAvailableLobbies() {
    const { classes } = this.props;
    let items = [];
    for (let i = 0; i < 5; i++) {
      items.push(
        <ListItem key={i} className={classes.lobby}>
          <Lobby closeMenu={this.closeMenu} />
        </ListItem>
      );
    }
    return (
      <List className={classes.scroll}>
        {items}
      </List>
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={this.state.joining}
        className={classes.modal}
        onBackdropClick={() => this.closeMenu()}
        onEscapeKeyDown={() => this.closeMenu()}
        disableRestoreFocus
      >
        <Grid container justify='center' alignContent='center'>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Grow in={this.state.joining} timeout={ANIM_GROW_TIME}>
              <div className={classes.paper}>
                <Typography variant='title' id='modal-title'>
                  Join Word Guesser Lobby
                </Typography>
                <Typography variant='caption' id='simple-modal-description'>
                  Join an available lobby below
                </Typography>
                <br/>
                <Divider/>
                {this.getAvailableLobbies()}
                <Divider/>
              </div>
            </Grow>
          </Grid>
        </Grid>
      </Modal>
    );
  }
}

export default withStyles(styles)(JoinMenu);