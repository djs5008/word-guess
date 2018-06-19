import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Grow, CircularProgress, Button } from '@material-ui/core';
import {
  SetUIState,
  CancelLoading,
} from '../actions/action';

const classes = theme => ({
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
      hidden: props.hidden,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      hidden: props.hidden,
    });
  }

  cancel() {
    const { dispatch } = this.props;
    this.setState({
      hidden: true,
    });
    dispatch(CancelLoading());
    dispatch(SetUIState('menu'));
  }

  renderCancelButton() {
    if (this.props.loadingCancellable) {
      return (
        <Button
          color='secondary'
          variant='raised'
          size='small'
          onClick={this.cancel}
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
        <Grow in={this.props.loading} timeout={ANIM_GROW_TIME}>
          <Grid container direction='column' spacing={16} justify='center' align='center' alignItems='center' alignContent='center'>
            <Grid item xs={12}>
              <CircularProgress className={classes.progress} size={100} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='title' className={classes.text}>
                {this.processText(this.props.loadingText)}
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

const mapStateToProps = (store = {}) => {
  return {
    loading: store.loading,
    loadingText: store.loadingText,
    loadingCancellable: store.loadingCancellable,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(Loading));