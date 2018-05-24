import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Grow, CircularProgress } from '@material-ui/core';

const styles = theme => ({
  progress: {
    margin: 0,
    position: 'relative',
    left: '15%',
  },
  text: {
    textAlign: 'center',
    color: 'white',
    textShadow: '1px 1px 2px #000',
  },
});

const MIN_LOADING_TIME = 2000;
const ANIM_GROW_TIME = 250;

class Loading extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: props.loading||false,
      loadingText: props.text||'LOADING...',
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      loading: props.loading,
      loadingText: props.loadingText,
    });
    // setTimeout(() => {
    //   this.props.resetMenu();
    // }, MIN_LOADING_TIME);
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid item>
        <Grow in={this.state.loading} timeout={ANIM_GROW_TIME}>
          <div>
            <CircularProgress className={classes.progress} size={100} />
            <Typography variant='title' className={classes.text}>
              {this.state.loadingText}
            </Typography>
          </div>
        </Grow>
      </Grid>
    );
  }
}

export default withStyles(styles)(Loading);