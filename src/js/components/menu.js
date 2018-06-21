import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { Typography, Snackbar, Icon, Grid, Slide, Button, Hidden } from '@material-ui/core';
import socket from '../client';
import { 
  SetUIState,
  sendUnregister
} from '../actions/action';

const classes = theme => ({
  button: {
    margin: '5px 10px 5px 10px',
    padding: '25px 50px 25px 50px',
  },
  createButton: {
    color: 'white',
    fontFamily: 'roboto',
    textShadow: '1px 1px 2px #000',
    fontSize: 18,
    whiteSpace: 'nowrap',
  },
  joinButton: {
    color: '#111',
    fontFamily: 'roboto',
    textShadow: '1px 1px 2px #555',
    fontSize: 18,
    whiteSpace: 'nowrap',
  },
  iconAlign: {
    marginTop: '-0.125em',
    verticalAlign: 'middle',
  },
  title: {
    color: '#999',
    fontFamily: 'Lobster',
    textShadow: '0 1px 0 rgb(204,204,204) , 0 2px 0 rgb(201,201,201) , 0 3px 0 rgb(187,187,187) , 0 4px 0 rgb(185,185,185) , 0 5px 0 rgb(170,170,170) , 0 6px 1px rgba(0,0,0,0.0980392) , 0 0 5px rgba(0,0,0,0.0980392) , 0 1px 3px rgba(0,0,0,0.298039) , 0 3px 5px rgba(0,0,0,0.2) , 0 5px 10px rgba(0,0,0,0.247059) , 0 10px 10px rgba(0,0,0,0.2) , 0 20px 20px rgba(0,0,0,0.14902)',
    textAlign: 'center',
    margin: '0px 0px 50px 0px',
    fontSize: '17vmin',
  },
  snackbar: {
    marginBottom: 10,
  }
});

const ANIM_SLIDE_SPEED = 250;

class MainMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shown: props.shown,
      creating: false,
      joining: false,
      hidden: true,
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      shown: props.shown,
      hidden: props.hidden,
    });
  }

  stopSnackbar(evt, reason) {
    if (reason === 'clickaway') return;
  }

  handleSignout() {
    const { dispatch } = this.props;
    dispatch(sendUnregister(socket, this.props.userID));
  }

  render() {
    const { classes, dispatch } = this.props;
    return(
      <Grid item xs={12} hidden={this.state.hidden}>
        <div>
          <Slide 
            direction='down'
            in={this.state.shown}
            timeout={ANIM_SLIDE_SPEED}
          >
            <Typography 
              variant='display4'
              id='menu-title'
              className={classes.title}
            >
              Word Guesser!
            </Typography>
          </Slide>
        </div>
        <div>
          <Slide 
            direction='up'
            in={this.state.shown}
            timeout={ANIM_SLIDE_SPEED}
          >
            <div>
              <Grid container spacing={8} justify='center' alignItems='center' alignContent='center'>
                <Hidden mdUp>
                  <Grid item xs={3} />
                </Hidden>
                <Grid item md={3} lg={2} xs={6} zeroMinWidth>
                  <Button 
                    variant='raised'
                    color='primary'
                    className={classes.button}
                    fullWidth
                    size='medium'
                    onClick={(evt) => dispatch(SetUIState('createmenu'))}
                  >
                    <Typography variant='title' className={classes.createButton}>
                      Create Game&nbsp;
                      <Icon className={classes.iconAlign}>create</Icon>
                    </Typography>
                  </Button>
                </Grid>
                <Hidden mdUp>
                  <Grid item xs={3} />
                  <Grid item xs={3} />
                </Hidden>
                <Grid item md={3} lg={2} xs={6} zeroMinWidth>
                  <Button 
                    variant='raised'
                    className={classes.button}
                    fullWidth
                    size='medium'
                    onClick={(evt) => dispatch(SetUIState('joinmenu'))}
                  >
                    <Typography variant='title' className={classes.joinButton}>
                      Join Game&nbsp;
                      <Icon className={classes.iconAlign}>send</Icon>
                    </Typography>              
                  </Button>
                </Grid>
                <Hidden mdUp>
                  <Grid item xs={3} />
                </Hidden>
              </Grid>
            </div>
          </Slide>
        </div>
        <Snackbar 
          className={classes.snackbar}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.shown}
          autoHideDuration={0}
          onClose={this.stopSnackbar.bind(this)}
          onExit={this.stopSnackbar.bind(this)}
          message={
            <div>
              <Typography variant='body2' className={classes.createButton}>
                Signed in as '{this.props.username}'!
              </Typography>
              <Typography variant='caption'>
                user id: {this.props.userID}
              </Typography>
            </div>
          }
          action={[
            <Button key="undo" color="secondary" size="small" onClick={(evt) => {
              dispatch(sendUnregister(socket, this.props.userID));
            }}>
              CHANGE
            </Button>,
          ]}
        />
      </Grid>
    );
  }
}

const mapStateToProps = (store = {}) => {
  return {
    username: store.username,
    userID: store.userID,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(MainMenu));