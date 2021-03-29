import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@material-ui/core';
import './TopBar.css';
import {
  withRouter
} from 'react-router-dom';

import axios from 'axios';
//import fetchModel from '../../lib/fetchModelData.js';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      showAddPhoto: false,
      showSuccessMessage: false,
      loggedInUser: false,
    }

    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleAddPhoto = this.handleAddPhoto.bind(this);
  }

  componentDidMount() {
    if (this.props.loggedInUser) {
      this.setState({loggedInUser: true});
      let pathname = this.props.pathname;
      let userId = pathname.substring(pathname.lastIndexOf('/') + 1);
      if (pathname !== '') axios.get('http://localhost:3000/user/' + userId).then(data => {
        let user = data.data;
        this.setState({username: user.first_name + " " + user.last_name});
      }).catch(error => {
        console.log(error);
      });
    }
  }

  componentDidUpdate() {
    if (this.state.loggedInUser) {
      let pathname = this.props.pathname;
      let userId = pathname.substring(pathname.lastIndexOf('/') + 1);
      if (pathname !== '') axios.get('http://localhost:3000/user/' + userId).then(data => {
        let user = data.data;
        this.setState({username: user.first_name + " " + user.last_name});
      }).catch(error => {
        console.log(error);
        this.setState({loggedInUser: false});
      });
    }
  }

  handleLogOut = () => {
    axios.post('http://localhost:3000/admin/logout', {
      destroy: false,
    }).then(() => {
      this.props.updateLoggedIn(undefined);
      this.setState({username: ''});
      console.log(this.state.username);
    }).catch(error => {
      console.log(error)
    });
  }

  handleAddPhoto() {
    this.setState({showAddPhoto: true});
    this.setState({showSuccessMessage: false});
  }

  handleUploadButtonClicked = (event) => {
    event.preventDefault();
    this.setState({showAddPhoto: false});
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then(() => {
          this.setState({showSuccessMessage: true});
          //alert('successfully uploaded photo with id ' + res.data._id);
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  changePath = (path) => {
    this.props.history.push(path);
  }

 
  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar className="cs142-topbar-toolbar">
          <Typography variant="h5" color="inherit" className="cs142-topbar-name">
              James Chao
          </Typography>
          {this.props.loggedInUser ? <button className="cs142-topbar-activitiesButton" onClick={() => this.changePath('/activity/feed')}>
              Activity Feed
            </button> : null}
          <div className="cs142-topbar-middleContainer">
            {!this.props.loggedInUser ? <Typography variant="h5" color="inherit" className="cs142-topbar-loginMessage">
              Please Login
            </Typography> : 
            <div>
            <Typography variant="h5" color="inherit" className="cs142-topbar-loginMessage">
              Welcome, {this.props.loggedInUser}
          </Typography>
          {this.state.showAddPhoto? 
          <div className="cs142-topbar-uploadContainer">
          <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} /> 
          <button onClick={this.handleUploadButtonClicked}>Upload</button>
          </div>
          : <button className="cs142-topbar-addPhotoButton" onClick={this.handleAddPhoto}>Add Photo</button>}
          <button className="cs142-topbar-logoutButton" onClick={this.handleLogOut}>Logout</button>
          </div>}
          </div>
          <div>{(this.state.showSuccessMessage && !this.state.loggedInUser) ? <p className="cs142-topbar-photoUploadSuccess">Successfully uploaded photo!</p> : null}</div>
          <Typography variant="h5" color="inherit" className="cs142-topbar-rightSide">
              {this.state.username === '' ? null : (this.props.pathname.includes('users') ? this.state.username : "Photos of " + this.state.username)}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
