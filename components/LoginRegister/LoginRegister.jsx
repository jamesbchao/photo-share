import React from 'react';
import './LoginRegister.css';

import axios from 'axios';

export default class LoginRegister extends React.Component {
    constructor(props) {
        super();

        //this.props = props;

        this.state = {
            username: '',
            password: '',
            usernameRegister: '',
            passwordRegister: '',
            passwordRegisterConfirm: '',
            firstName: '',
            lastName: '',
            location: '',
            description: '',
            occupation: '',
            showInvalidLoginMessage: false,
            showSuccessfulRegistration: false,
            showErrorMesage: false,
            errorMessage: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
        this.handleSubmitRegister = this.handleSubmitRegister.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    componentDidMount() {
        axios.get('http://localhost:3000/login-check').then(() => {
            //console.log(data.data);
        }).catch(err => {
            console.log(err);
        });
    }

    handleSubmitLogin(event) {
        event.preventDefault();
        axios.post('http://localhost:3000/admin/login', {
            login_name: this.state.username,
            password: this.state.password
        }).then((response) => {
            let user = response.data;
            console.log('user logged in with username: ' + response.data.login_name);
            this.props.updateLoggedIn(user.first_name);
            window.location.href = `#/users/${user._id}`;
        }).catch((err) => {
            this.setState({showInvalidLoginMessage: true});
            //alert('Invalid username or password.');
            console.log(err);
        });
        
    }

    handleSubmitRegister(event) {
        event.preventDefault();

        if (this.state.passwordRegister !== this.state.passwordRegisterConfirm) {
            this.setState({errorMessage: 'Passwords do not match', showErrorMesage: true, showSuccessfulRegistration: false});
            //alert('Passwords do not match');
            return;
        }

        axios.post('http://localhost:3000/user', {
            login_name: this.state.usernameRegister,
            password: this.state.passwordRegister,
            first_name: this.state.firstName,
            last_name: this.state.lastName,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation,
        }).then(() => {
            this.setState({
                showSuccessfulRegistration: true,
                showErrorMesage: false,
                usernameRegister: '',
                passwordRegister: '',
                passwordRegisterConfirm: '',
                firstName: '',
                lastName: '',
                location: '',
                description: '',
                occupation: ''
            });
        }).catch(err => {
            this.setState({errorMessage: String(err.response.data), showErrorMesage: true, showSuccessfulRegistration: false});
        })
    }

    render() {
        return (
            <div className="cs142-LoginRegister-maincontainer">
                <div className="cs142-LoginRegister-login">
                    <h1 className="cs142-LoginRegister-login-message">Login</h1>
                    {this.state.showInvalidLoginMessage ? <p className="cs142-LoginRegister-invalidMessage"><i>Invalid username or password</i></p>: null}
                    <form className="cs142-LoginRegister-formContainer" onSubmit={this.handleSubmitLogin}>
                        <label className="cs142-LoginRegister-input-field">
                            Username: 
                            <input type="text" name="username" value={this.state.username} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Password: 
                            <input type="text" name="password" value={this.state.password} onChange={this.handleChange} />
                        </label>
                        <input className="cs142-LoginRegister-submit" type="submit" value="Log In" />
                    </form>  
                </div>
                <div className="cs142-LoginRegister-register">
                    <h1 className="cs142-LoginRegister-register-message">Register</h1>
                    {this.state.showSuccessfulRegistration ? <p className="cs142-LoginRegister-successMessage"><i>Successfully registered user!</i></p>: null}
                    {this.state.showErrorMesage ? <p className="cs142-LoginRegister-invalidMessage"><i>{this.state.errorMessage}</i></p>: null}
                    <form className="cs142-LoginRegister-formContainer" onSubmit={this.handleSubmitRegister}>
                        <label className="cs142-LoginRegister-input-field">
                            Username: 
                            <input type="text" name="usernameRegister" value={this.state.usernameRegister} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Password: 
                            <input type="password" name="passwordRegister" value={this.state.passwordRegister} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Confirm Password: 
                            <input type="password" name="passwordRegisterConfirm" value={this.state.passwordRegisterConfirm} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            First Name: 
                            <input type="text" name="firstName" value={this.state.firstName} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Last Name: 
                            <input type="text" name="lastName" value={this.state.lastName} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Location: 
                            <input type="text" name="location" value={this.state.location} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Description: 
                            <input type="text" name="description" value={this.state.description} onChange={this.handleChange} />
                        </label>
                        <label className="cs142-LoginRegister-input-field">
                            Occupation: 
                            <input type="text" name="occupation" value={this.state.occupation} onChange={this.handleChange} />
                        </label>
                        <input className="cs142-LoginRegister-submit" type="submit" value="Register Me" />
                    </form>    
                </div>
            </div>
        );
    }
}
