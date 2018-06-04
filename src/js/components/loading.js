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

const ANIM_GROW_TIME = 250;

class Loading extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: props.loading,
      loadingText: props.loadingText||'Loading...',
      cancellable: props.cancellable||true,
      hidden: props.hidden,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      loading: props.loading,
      loadingText: props.loadingText,
      cancellable: props.cancellable,
      hidden: props.hidden,
    });
  }

  cancelLoading() {
    this.setState({
      hidden: true,
      loading: false,
      loadingText: 'Loading...',
    });
    this.props.cancelLoading();
    this.props.showMenu();
  }

  renderCancelButton() {
    if (this.state.cancellable) {
      return (
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
      );
    }
  }

  processText(text) {
    let result = [];
    let splits = text.split('\n');
    let i = 0;
    splits.forEach(seg => {
      result.push(seg);
      result.push(<br key={i++}/>);
    });
    result.pop();
    return result;
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid item xs={12} hidden={this.state.hidden}>
        <Grow in={this.state.loading} timeout={ANIM_GROW_TIME}>
          <Grid container direction='column' spacing={16} justify='center' alignItems='center' alignContent='center'>
            <Grid item xs={12}>
              <CircularProgress className={classes.progress} size={100} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='title' className={classes.text}>
                {this.processText(this.state.loadingText)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {this.renderCancelButton()}
            </Grid>
          </Grid>
        </Grow>
      </Grid>
    );
  }
}

export default withStyles(styles)(Loading);