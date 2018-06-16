import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, Typography, Modal, Divider, Grid, Grow } from '@material-ui/core';
import Lobby from './lobby';

const classes = theme => ({
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
    paddingLeft: 10,
    paddingRight: 10,
  },
  nolobbies: {
    textAlign: 'center',
  }
});

const ANIM_GROW_TIME = 500;

class JoinMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shown: props.shown,
    };
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

  getAvailableLobbies() {
    const { classes } = this.props;
    let items = [];
    if (Object.keys(this.props.lobbies).length > 0) {
      Object.keys(this.props.lobbies).forEach(lobbyID => {
        let lobby = this.props.lobbies[lobbyID];
        items.push(
          <ListItem key={lobbyID} className={classes.lobby}>
            <Lobby 
              closeMenu={this.closeMenu}
              showGameLobby={this.props.showGameLobby}
              showJoinLobby={this.props.showJoinLobby}
              startLoading={this.props.startLoading}
              lobbyID={lobbyID}
              lobbyName={lobby.lobbyName}
              maxPlayers={lobby.maxPlayers}
              playerCount={lobby.connectedUsers.length}
              rounds={lobby.rounds}
              privateLobby={lobby.privateLobby}
              password={lobby.password}
              bannedUsers={lobby.bannedUsers}
            />
          </ListItem>
        );
      });
    } else {
      items.push(
        <div key={1}>
          <br/>
          <Typography variant='caption' className={classes.nolobbies}>
            No Lobbies Available :(
          </Typography>
          <br/>
        </div>
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
        onBackdropClick={this.closeMenu.bind(this)}
        onEscapeKeyDown={this.closeMenu.bind(this)}
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

const mapStateToProps = (store = {}) => {
  return {
    lobbies: store.lobbies,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(JoinMenu));