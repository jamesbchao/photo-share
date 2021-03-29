import React from 'react';
/*
import {
  Typography
} from '@material-ui/core';
*/
import './userDetail.css';

import { IoLocationOutline } from 'react-icons/io5';
import {
  HashRouter, Link
} from 'react-router-dom';

import axios from 'axios';
//import fetchModel from '../../lib/fetchModelData.js';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showId: false,
      user: {},
      showDeleteUserWarning: false,
      userId: '',
      showInvalidDeletion: false,
    };
    //this.handleShowDeleteUser = this.handleShowDeleteUser.bind(this);
    this.handleDeleteUser = this.handleDeleteUser.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  componentDidMount() {
    this.setState({userId: this.props.match.params.userId});
    this.props.callback('/users/' + this.props.match.params.userId);
    axios.get('http://localhost:3000/user/' + this.props.match.params.userId).then(data => {
      let u = data.data;
      this.setState({user: u});
    }).catch(error => {
      console.log(error);
    });
  }
  
  componentDidUpdate() {
    //this.props.callback('/users/' + this.props.match.params.userId);
    axios.get('http://localhost:3000/user/' + this.props.match.params.userId).then(data => {
      let u = data.data;
      this.setState({user: u});
    }).catch(error => {
      console.log(error);
      this.handleLogOut();
    });
  }

  onButtonClick = () => {
    this.state.showId === false ? this.setState({showId: true}) : this.setState({showId: false});
  };

  handleShowDeleteUser = () => {
    this.setState({showDeleteUserWarning: true});
  }

  handleHideDeleteUser = () => {
    this.setState({showDeleteUserWarning: false});
  }

  handleDeleteUser(id, first, last) {
    axios.delete('http://localhost:3000/delete/user/' + id).then(() => {
      console.log('Successfully deleted user.');
      this.handleLogOut(first, last);
    }).catch(error => {
      this.setState({showInvalidDeletion: false});
      console.log(error);
    })
  }

  handleLogOut() {
    axios.post('http://localhost:3000/admin/logout', {
      destroy: true,
    }).then(() => {
      this.props.updateLoggedIn(undefined);
      this.setState({user: {}});
    }).catch(error => {
      console.log(error)
    });
  }

  render() {
    
    let user = this.state.user;
    const id = user._id;
    const first = user.first_name;
    const last = user.last_name;
    const location = user.location;
    const description = user.description;
    const occupation = user.occupation;

    return (
      <div>
        <div className="cs142-userDetail-headerContainer">
          <h1 className="cs142-userDetail-name">{first + " " + last}</h1>
          <button className="cs142-userDetail-button" onClick={this.onButtonClick}><i>{this.state.showId === false ? "Show" : "Hide"} ID</i></button>
          <button className="cs142-userDetail-delete-user-button" onClick={this.handleShowDeleteUser}>Delete User</button>
        </div>
        {this.state.showId && <p className="cs142-userDetail-id"><i>{id}</i></p>}
        {this.state.showInvalidDeletion ? (<div><p className="cs142-userDetail-invalid-message"><i>You can only delete your own profile.</i></p></div>) : null}
        <p className="cs142-userDetail-location"><IoLocationOutline /> {location}</p>
        <p className="cs142-userDetail-occupation"><b>{occupation}</b></p>
        <p className="cs142-userDetail-description">description: {description}</p>
        <HashRouter><Link className="cs142-userDetail-toPhotos" to={"/photos/" + id}>View {first}'s photos</Link></HashRouter>
        {this.state.showDeleteUserWarning ?(<div className="cs142-userDetail-delete-form">
            <p className="cs142-userDetail-delete-warning">Are you sure you want to delete this profile? All comments and photos will be removed. (Note: You can only delete your own profile.)</p>
            <div className="cs142-userDetail-confirmation-buttons-container">
              <button onClick={() => this.handleDeleteUser(id, first, last)}>Yes</button>
              <button onClick={() => this.handleHideDeleteUser}>No</button>
            </div>
          </div>): null}
      </div>
      
    );
  }
}

export default UserDetail;
