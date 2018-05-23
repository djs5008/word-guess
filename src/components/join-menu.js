import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Divider from '@material-ui/core/Divider'
import Lobby from './lobby';
import { List, ListItem } from '@material-ui/core';

const styles = theme => ({
  paper: {
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  button: {
    'margin-top': 15,
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
        <ListItem key={i} className={classes.lobby} closeMenu={this.closeMenu}>
          <Lobby />
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
      >
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
      </Modal>
    );
  }
}

export default withStyles(styles)(JoinMenu);