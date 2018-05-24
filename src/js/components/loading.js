import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Grow, CircularProgress, Button } from '@material-ui/core';

const styles = theme => ({
  text: {
    textAlign: 'center',
    color: 'white',
    textShadow: '1px 1px 2px #000',
  },
});

const MIN_LOADING_TIME = 3000;
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
    setTimeout(() => {
      if (this.state.loading) {
        this.cancelLoading();
      }
    }, MIN_LOADING_TIME);
  }

  cancelLoading() {
    this.props.showMenu();
    this.setState({
      loading: false,
      loadingText: 'Loading...',
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid item xs={12}>
        <Grow in={this.state.loading} timeout={ANIM_GROW_TIME}>
          <Grid container direction='column' spacing={16} justify='center' alignItems='center' alignContent='center'>
            <Grid item xs={12}>
              <CircularProgress className={classes.progress} size={100} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='title' className={classes.text}>
                {this.state.loadingText}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                color='secondary'
                variant='raised'
                size='small'
                onClick={
                  (evt) => {
                    this.cancelLoading();
                  }
                }
              >cancel</Button>
            </Grid>
          </Grid>
        </Grow>
      </Grid>
    );
  }
}

export default withStyles(styles)(Loading);