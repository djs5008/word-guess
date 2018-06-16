import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Button, Icon, Tooltip, Zoom, Paper } from '@material-ui/core';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import socket from '../client';
import {
  SetPenColor,
  SetPenSize,
  sendClearCanvas,
} from '../actions/action';

const classes = theme => ({
  root: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  controlButton: {
    margin: 5,
    pointerEvents: 'auto',
  },
  controlPopup: {},
  canvasControls: {
    maxWidth: 200,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    opacity: 0.7,
    backgroundColor: '#333',
  },
  controlWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: 'auto',
  },
  pickerContainer: {
    width: '50%',
    height: '50%',
  },
});

class CanvasControls extends Component {

  constructor(props) {
    super(props);
    this.state = {
      colorOpen: false,
      sizeOpen: false,
      hidden: false,
      drawOptions: {},
    };
  }

  toggleColorPalette() {
    this.setState({
      sizeOpen: false,
      colorOpen: !this.state.colorOpen,
    });
  }

  togglePenSize() {
    this.setState({
      colorOpen: false,
      sizeOpen: !this.state.sizeOpen,
    });
  }
  
  setPenColor(color) {
    const { dispatch } = this.props;
    if (color !== '#rainbow') {
      // Client.state.drawOptions.rainbow = false;
      dispatch(SetPenColor(color));
    } else {
      // Client.state.drawOptions.rainbow = true;
    }
    this.toggleColorPalette();
  }

  setPenSize(size) {
    const { dispatch } = this.props;
    dispatch(SetPenSize(size));
    this.togglePenSize();
  }

  loadPresetColors() {
    const { classes } = this.props;
    const colors = ['#333333', '#ffffff', '#0099ff', '#ff0000', '#00cc00', '#ffff00', '#ff6600', '#9900ff', '#654321', '#FF00FF', '#rainbow', ];
    let items = [];
    let key = 0;
    let degreeDelta = 360 / colors.length;
    let degree = degreeDelta;
    let radius = colors.length / 2;

    colors.forEach(color => {
      items.push(
        <Grid item key={key++} style={{ position: 'absolute', transform: 'rotate(' + degree + 'deg) translate(' + radius + 'em) rotate(-' + degree + 'deg)'}}>
          <Button
            variant='fab'
            mini
            onClick={() => this.setPenColor(color)}
            className={classes.controlButton}
          >
            <FiberManualRecord nativeColor={color}/>
          </Button>
        </Grid>
      );
      degree += degreeDelta;
    });

    return (items);
  }

  loadPresetSizes() {
    const { classes } = this.props;
    const sizes = [ 1, 3, 5, 7, 9, 11, 20];
    let items = [];
    let key = 0;
    let degreeDelta = 360 / sizes.length;
    let degree = degreeDelta;
    let radius = sizes.length / 2;

    sizes.forEach(size => {
      items.push(
        <Grid item key={key++} style={{ position: 'absolute', transform: 'rotate(' + degree + 'deg) translate(' + radius + 'em) rotate(-' + degree + 'deg)'}}>
          <Button
            variant='fab'
            mini
            onClick={() => this.setPenSize(size)}
            className={classes.controlButton}
          >
            <FiberManualRecord nativeColor={this.props.drawOptions.color} style={{ width: size*2, height: size*2,}}/>
          </Button>
        </Grid>
      );
      degree += degreeDelta;
    });

    return (items);
  }

  render() {
    const { classes, dispatch } = this.props;

    return (
      <div className={classes.root} hidden={this.props.hidden}>
        <Grid container justify='center' align='center' alignContent='center' alignItems='center' className={classes.controlWrapper}>
          <Grid item xs={12} hidden={!this.state.sizeOpen} className={classes.controlPopup}>
            <Zoom in={this.state.sizeOpen} >
              <Grid container justify='center' align='center' spacing={8}>
                {this.loadPresetSizes()}
              </Grid>
            </Zoom>
          </Grid>
          <Grid item xs={12} hidden={!this.state.colorOpen} className={classes.controlPopup}>
            <Zoom in={this.state.colorOpen} >
              <Grid container justify='center' align='center' spacing={8} className={classes.pickerContainer}>
                {this.loadPresetColors()}
              </Grid>
            </Zoom>
          </Grid>
        </Grid>
        <Paper id='canvasControls' className={classes.canvasControls}>
          <Grid container justify='center' align='center'>
            <Grid item xs={4}>
              <Tooltip title='Pen Color' placement='top'>   
                <Button
                  className={classes.controlButton}
                  variant='fab'
                  mini
                  onClick={this.toggleColorPalette.bind(this)}
                >
                  <Icon>color_lens</Icon>
                </Button>
              </Tooltip>  
            </Grid>  
            <Grid item xs={4}>
              <Tooltip title='Pen Size' placement='top'>     
                <Button
                  className={classes.controlButton}  
                  variant='fab'
                  mini
                  onClick={this.togglePenSize.bind(this)}
                >
                  <Icon>line_weight</Icon>
                </Button>
              </Tooltip>
            </Grid>  
            <Grid item xs={4}>
              <Tooltip title='Clear Drawing' placement='top'>    
                <Button
                  className={classes.controlButton}
                  variant='fab'
                  mini
                  onClick={() => dispatch(sendClearCanvas(socket, this.props.userID))}
                >
                  <Icon>layers_clear</Icon>
                </Button>
              </Tooltip>  
            </Grid>  
          </Grid>
        </Paper>
      </div>  
    );
  }

}

const mapStateToProps = (store = {}) => {
  return {
    hidden: (store.gameState.started && (store.gameState.activeDrawer !== store.userID)),
    drawOptions: store.drawOptions,
    userID: store.userID,
  }
}

export default withStyles(classes)(connect(mapStateToProps)(CanvasControls));