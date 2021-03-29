import React from 'react';
import {
  Divider,
  List,
  ListItem,
}
from '@material-ui/core';
import {
  HashRouter, Link
} from 'react-router-dom';
import './userList.css';

import axios from 'axios';
//import fetchModel from '../../lib/fetchModelData.js';


/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: []
    }
  }

  componentDidMount() {
    axios.get('http://localhost:3000/user/list').then(data => {
      let userlist = data.data;
      this.setState({users: userlist});
    }).catch(error => {
      console.log(error);
    });
  }

  componentDidUpdate() {
    axios.get('http://localhost:3000/user/list').then(data => {
      let userlist = data.data;
      this.setState({users: userlist});
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    return (
      <div>
        <List component="nav">
          {this.state.users.map(elem => (
            <div key={elem._id}>
              <ListItem>
              <HashRouter><Link className="cs142-userList-buttonText" to={"/users/" + elem._id}>{elem.first_name + " " + elem.last_name}</Link></HashRouter>
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
