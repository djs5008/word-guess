import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';

const createjs = window.createjs;

const classes = theme => ({
  canvas: {
    paddingLeft: 0,
    paddingRight: 0,
    margin: 'auto',
    display: 'block',
    height: '100%',
    width: '90%',
    boxShadow: '3px 3px 10px #000',
  },
});

class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      color: undefined,
      size: 5,
      drawing: true,
      penDown: false,
    };
  }

  componentDidMount() {
    this.canvas = ReactDOM.findDOMNode(this.refs.canvas);

    this.stage = new createjs.Stage(this.canvas);
    this.background = new createjs.Shape();
    this.stage.addChild(this.background);
    this.graphics = this.background.graphics;

    this.lines = [];

    this.fitStage = this.fitStage.bind(this);
    window.addEventListener('resize', this.fitStage, false);
    this.fitStage();

    this.fillBackground();
    this.registerMouseEvents();
  }

  fillBackground() {
    this.graphics
      .beginFill('rgba(255,255,255,0.8)')
      .drawRect(0, 0, this.stage.canvas.width, this.stage.canvas.height)
      .endFill();
    this.stage.update();
  }

  fitStage() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.stage.update();
  }

  registerMouseEvents() {
    this.oldX = undefined;
    this.oldY = undefined;

    createjs.Touch.enable(this.stage);
    this.stage.on("stagemousedown", (evt) => this.handleMouseDown(evt));
    this.stage.on("stagemouseup", (evt) => this.handleMouseUp(evt));
    this.stage.on("stagemousemove", (evt) => this.handleMouseMove(evt));
  }
  
  handleMouseUp(evt) {
    this.setState({
      color: createjs.Graphics.getHSL(Math.random()*360, 100, 50),
      penDown: false,
    });
    this.stage.update();
  }

  handleMouseDown(evt) {
    this.setState({
      penDown: true,
    });

    var s = new createjs.Shape();
    this.graphics = s.graphics;
    this.stage.addChild(s);
    this.currentShape = s;

    this.paint(evt.stageX, evt.stageY);
  }

  handleMouseMove(evt) {
    this.paint(evt.stageX, evt.stageY);
  }

  paint(x, y) {
    if (this.currentShape) {
      if (this.state.drawing && this.state.penDown) {
        this.lines.push({oldX: this.oldX, oldY: this.oldY, x, y});
        this.graphics
          .beginStroke(this.state.color)
          .setStrokeStyle(this.state.size, "round")
          .moveTo(this.oldX, this.oldY)
          .lineTo(x, y)
          .endStroke();
      }
      this.oldX = x;
      this.oldY = y;
      this.currentShape.draw(this.stage.canvas.getContext('2d'));
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <canvas ref="canvas" className={classes.canvas}>
        Your browser is not supported!
      </canvas>
    );
  }
}

export default withStyles(classes)(Canvas);