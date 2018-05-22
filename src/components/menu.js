import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import CreateMenu from './create-menu.js';
import { Row,Col, } from 'reactstrap';

const styles = theme => ({
  button: {
    margin: '5px 10px 5px 10px',
    padding: '25px 50px 25px 50px',
  },
  createButton: {
    color: 'white',
    fontFamily: 'roboto',
    textShadow: '1px 1px 2px #000',
  },
  joinButton: {
    color: '#111',
    fontFamily: 'roboto',
    textShadow: '1px 1px 2px #555',
  },
  iconAlign: {
    'margin-top': '-0.125em',
    'vertical-align': 'middle',
  },
  title: {
    color: '#999',
    fontFamily: 'Lobster',
    textShadow: '0 1px 0 rgb(204,204,204) , 0 2px 0 rgb(201,201,201) , 0 3px 0 rgb(187,187,187) , 0 4px 0 rgb(185,185,185) , 0 5px 0 rgb(170,170,170) , 0 6px 1px rgba(0,0,0,0.0980392) , 0 0 5px rgba(0,0,0,0.0980392) , 0 1px 3px rgba(0,0,0,0.298039) , 0 3px 5px rgba(0,0,0,0.2) , 0 5px 10px rgba(0,0,0,0.247059) , 0 10px 10px rgba(0,0,0,0.2) , 0 20px 20px rgba(0,0,0,0.14902)',
    textAlign: 'center',
    margin: '50px 0px 50px 0px',
    fontSize: '100pt',
  },
  verticalCenter: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0px',
  },
});

class MainMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shown: true,
      creating: false,
      joining: false,
    }
    this.resetMenu = this.resetMenu.bind(this);
  }

  showMenu() {
    return this.state.shown && !this.state.creating;
  }

  resetMenu() {
    this.setState({
      shown: true,
      creating: false,
      joining: false,
    });
  }

  render() {
    const { classes } = this.props;
    return(
      <div className='vignette'>
        <Row>
          <Col sm='12' md='12' lg='12' className={`text-center ${classes.verticalCenter}`}>
            <Slide direction='down' in={this.showMenu()} timeout={300}>
              <Typography 
                variant='display4' 
                id='menu-title' 
                className={classes.title}
              >
                Word Guesser!
              </Typography>
            </Slide>
            <Slide direction='up' in={this.showMenu()} timeout={300}>
              <div>
                <Button 
                  variant='raised'
                  color='primary'
                  className={classes.button}
                  onClick={(evt) => this.setState({
                    creating: true,
                  })}
                >
                  <Typography variant='title' className={classes.createButton}>
                    Create Game&nbsp;
                    <Icon className={classes.iconAlign}>create</Icon>
                  </Typography>
                </Button>

                <Button 
                  variant='raised'
                  className={classes.button}
                >
                  <Typography variant='title' className={classes.joinButton}>
                    Join Game&nbsp;
                    <Icon className={classes.iconAlign}>send</Icon>
                  </Typography>              
                </Button>
              </div>
            </Slide>
            <CreateMenu creating={this.state.creating} resetMenu={this.resetMenu}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withStyles(styles)(MainMenu);