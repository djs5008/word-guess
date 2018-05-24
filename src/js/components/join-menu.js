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
      shown: props.shown,
    };
    this.closeMenu = this.closeMenu.bind(this);
    this.joinLobby = this.joinLobby.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
    });
  }

  closeMenu() {
    this.setState({
      shown: false,
      lobbyName:'',
    });
    this.props.showMenu();
  }

  joinLobby() {
    this.props.startLoading();
    this.props.setLoadingText('Joining lobby...');
  }

  getAvailableLobbies() {
    const { classes } = this.props;
    let items = [];
    for (let i = 0; i < 5; i++) {
      items.push(
        <ListItem key={i} className={classes.lobby}>
          <Lobby closeMenu={this.closeMenu} joinLobby={this.joinLobby} />
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
        open={this.state.shown}
        className={classes.modal}
        onBackdropClick={() => this.closeMenu()}
        onEscapeKeyDown={() => this.closeMenu()}
        disableRestoreFocus
      >
        <Grid container justify='center' alignContent='center' alignItems='center' style={{pointerEvents: 'none'}}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Grow in={this.state.shown} timeout={ANIM_GROW_TIME}>
              <div className={classes.paper} style={{pointerEvents: 'auto'}}>
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