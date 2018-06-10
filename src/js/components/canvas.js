import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import * as Client from './client';

const createjs = window.createjs;

const classes = theme => ({
  canvas: {
    boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
    cursor: 'url(img/pencil.png),auto', // Icon made by Situ Herrera (situ-herrera) from www.flaticon.com is licensed by Creative Commons BY 3.0
  },
});

class Canvas extends Component {

  constructor(props) {
    super(props);
    this.vars = {
      penDown: false,
      hue: 0,
      lastDrawTick: 0,
    };
  }

  componentDidMount() {
    let canvas = ReactDOM.findDOMNode(this.refs.canvas);

    this.stage = new createjs.Stage(canvas);
    this.background = new createjs.Shape();
    this.cursorLayer = new createjs.Shape();
    this.buffer = new createjs.Container();
    this.drawArea = new createjs.Shape();
    this.stage.addChild(this.background);
    this.stage.addChild(this.buffer);
    this.buffer.addChild(this.drawArea);
    this.stage.addChild(this.cursorLayer);
    
    this.stage.mouseMoveOutside = true;
    
    createjs.Touch.enable(this.stage, true);
    createjs.Ticker.on("tick", this.paint.bind(this));
    createjs.Ticker.framerate = 60;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

    window.addEventListener('resize', this.fitStage.bind(this), false);
    this.fitStage();

    this.registerMouseEvents();
  }

  fillBackground() {
    this.background.graphics.clear();
    this.background.graphics
      .beginFill('rgba(0,0,0,0.4)')
      .beginStroke('rgba(255,255,255,0.3)')
      .setStrokeStyle(3)
      .drawRect(0, 0, this.stage.canvas.width, this.stage.canvas.height)
      .endFill()
      .endStroke()
      .setStrokeStyle();
    this.background.uncache();
    this.background.cache(0, 0, this.stage.canvas.width, this.stage.canvas.height);
    this.stage.update();
  }

  fitStage() {
    this.stage.canvas.height = 0;
    let divHeight = document.getElementById('canvasContainer').clientHeight;
    let divWidth = parseFloat(window.getComputedStyle(document.getElementById('canvasContainer')).width);
    this.stage.canvas.height = divHeight;
    this.stage.canvas.width = divWidth;
    this.buffer.uncache();
    this.buffer.cache(0, 0, this.stage.canvas.width, this.stage.canvas.height);
    this.fillBackground();
    this.drawAllLines();
  }

  registerMouseEvents() {
    this.oldX = undefined;
    this.oldY = undefined;

    this.stage.on("stagemousedown", this.handleMouseDown.bind(this));
    this.stage.on("stagemouseup", this.handleMouseUp.bind(this));
    this.stage.on("stagemousemove", this.handleMouseMove.bind(this));
  }
  
  handleMouseUp() {
    this.vars.penDown = false;
  }

  handleMouseDown() {
    this.vars.penDown = true;

    let pos = this.getPercentPos({x: this.stage.mouseX, y: this.stage.mouseY});
    this.oldX = pos.x;
    this.oldY = pos.y;
    this.drawLine(pos);
  }

  handleMouseMove() {
    if (Client.state.drawOptions.drawing && this.vars.penDown) {
      if ((Date.now() - this.vars.lastDrawTick) >= 10) {
        let pos = this.getPercentPos({ x: this.stage.mouseX, y: this.stage.mouseY });
        this.drawLine(pos);
        this.oldX = pos.x;
        this.oldY = pos.y;
        this.vars.lastDrawTick = Date.now();
      }
    } else {
      let percentMousePos = this.getPercentPos({x: this.stage.mouseX, y: this.stage.mouseY});
      Client.sendMouse(percentMousePos.x, percentMousePos.y, Client.state.drawOptions.color, Client.state.drawOptions.size);
    }
  }

  getPercentPos(pos) {
    let x = (pos.x / this.stage.canvas.width);
    let y = (pos.y / this.stage.canvas.height);
    return { x, y };
  }

  drawLine(pos) {
    let line = {
      color: Client.state.drawOptions.color, 
      size: Client.state.drawOptions.size, 
      oldX: this.oldX, 
      oldY: this.oldY, 
      x: pos.x, 
      y: pos.y,
    };
    Client.addToLines(line);
    Client.sendLine(line);
    
    if (Client.state.drawOptions.rainbow) {
      this.vars.hue = this.vars.hue < 355 ? this.vars.hue + 5 : 0;
      Client.state.drawOptions.color = createjs.Graphics.getHSL(this.vars.hue, 100, 50);
    }
  }

  drawAllLines() {
    Client.state.lineBuffer = Client.state.allLines.concat(Client.state.lineBuffer);
  }

  paint() {

    this.cursorLayer.graphics.clear();
    this.cursorLayer.graphics
      .beginFill(Client.state.drawOptions.color)
      .moveTo(this.stage.mouseX, this.stage.mouseY)
      .drawCircle(this.stage.mouseX, this.stage.mouseY, Client.state.drawOptions.size/2)
      .endFill();
    Object.keys(Client.state.mousePos).forEach(userID => {
      let mousePos = Client.state.mousePos[userID];
      this.cursorLayer.graphics
        .beginFill(mousePos.color)
        .drawCircle(this.stage.canvas.width * mousePos.x, this.stage.canvas.height * mousePos.y, mousePos.size/2)
        .endFill();
    });

    let lineBuffer = Client.getLines();
    if (lineBuffer.length > 0) {
      lineBuffer.forEach(line => {
        let oldX = this.stage.canvas.width * line.oldX;
        let oldY = this.stage.canvas.height * line.oldY;
        let x = this.stage.canvas.width * line.x;
        let y = this.stage.canvas.height * line.y;
        
        this.drawArea.graphics
          .beginStroke(line.color)
          .setStrokeStyle(line.size, 'round','round')
          .moveTo(oldX, oldY)
          .lineTo(x, y)
          .endStroke();

        Client.removeLine(line);
      });

      this.buffer.updateCache('source-over');
      this.drawArea.graphics.clear();
    }

    if (Client.state.drawOptions.clear) {
      this.buffer.updateCache();
      Client.state.drawOptions.clear = false;
    }
    
    this.stage.update();
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