import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/LoginRegister/LoginRegister';
import ActivityFeed from './components/activityFeed/activityFeed';
//import { pink } from '@material-ui/core/colors';

import axios from 'axios';
//import fetchModel from './lib/fetchModelData.js';


class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pathname: '',
      version: '',
      loggedInUser: undefined,
    }
    //this.isLoggedIn = this.isLoggedIn.bind(this);
    this.updateLoggedIn = this.updateLoggedIn.bind(this);
    this.updatePathname = this.updatePathname.bind(this);
  }

  componentDidMount() {
    axios.get('http://localhost:3000/test/info').then(data => {
      let v = data.data.__v;
      this.setState({version: v});
    }).catch(error => {
      console.log(error);
    });

  }
  updateLoggedIn = (user) => {
    this.setState({loggedInUser: user});
  }

  updatePathname = (pathname) => {this.setState({pathname: pathname})}


  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar 
          pathname={this.state.pathname} 
          version={this.state.version} 
          loggedInUser={this.state.loggedInUser}
          updateLoggedIn={this.updateLoggedIn} />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper  className="cs142-main-grid-item">
            {this.state.loggedInUser ? <UserList /> : null}
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              {this.state.loggedInUser ? 
                <Route path="/users/:userId"
                render={ props => <UserDetail {...props} callback={this.updatePathname} updateLoggedIn={this.updateLoggedIn}/> }
              /> : 
                <Redirect path="/users/:userId" to="/login-register" />}
              {this.state.loggedInUser ? 
                <Route path="/photos/:userId"
                render={ props => <UserPhotos {...props} callback={this.updatePathname} loggedInUser={this.state.loggedInUser}/> }
              /> : 
                <Redirect path="/photos/:userId" to="/login-register" />}
              {this.state.loggedInUser ? 
                <Route path="/users" component={UserList}  /> : 
                <Redirect path="/photos/:userId" to="/login-register" />}
                {this.state.loggedInUser ? 
                <Route path="/activity/feed" component={ActivityFeed}  /> : 
                <Redirect path="/photos/:userId" to="/login-register" />}
              <Route
                    path="/login-register"
                    render={ props => (
                      <LoginRegister
                        {...props}
                        updateLoggedIn={this.updateLoggedIn}
                        prop={'hello'}
                      />
                    )}
                  />
              {this.state.loggedInUser ? null : <Redirect path="/" to="/login-register" />}
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
