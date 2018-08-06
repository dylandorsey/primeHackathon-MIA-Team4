import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  button: {
    width: 500,
  },
}

const mapStateToProps = state => ({
  user: state.user,
  login: state.login,
});

class RegisterPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
    };
  }

  registerUser = (event) => {
    event.preventDefault();

    if (this.state.username === '' || this.state.password === '') {
      this.setState({
        message: 'Choose a username and password!',
      });
    } else {
      const body = {
        username: this.state.username,
        password: this.state.password,
      };

      // making the request to the server to post the new user's registration
      axios.post('/api/user/register/', body)
        .then((response) => {
          if (response.status === 201) {
            this.props.history.push('/home');
          } else {
            this.setState({
              message: 'Ooops! That didn\'t work. The username might already be taken. Try again!',
            });
          }
        })
        .catch(() => {
          this.setState({
            message: 'Ooops! Something went wrong! Is the server running?',
          });
        });
    }
  }

  handleInputChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  renderAlert = () => {
    if (this.state.message !== '') {
      return (
        <h2
          className="alert"
          role="alert"
        >
          {this.state.message}
        </h2>
      );
    }
    return (<span />);
  }

  render() {
    const {classes} = this.props;
    return (
      <div>
        {this.renderAlert()}
        <form onSubmit={this.registerUser}>
          <div className="loginAndRegisterTitle">
            <div>
              <h1>Register User</h1>
            </div>
          </div>
          <div className = "inputFieldsAndButtonsDiv">
          <div>
            <div className="inputFieldsDiv">
              <div className="usernameInput">
                <label htmlFor="username">
                  <i class="fas fa-user"></i>
                  <Input
                    className="inputFields"
                    placeholder="Username"
                    type="text"
                    name="username"
                    value={this.state.username}
                    onChange={this.handleInputChange}
                    style={{fontSize: 25}}
                  />
                </label>
              </div>
              <div className="passwordInput">
                <label htmlFor="password">
                  <i class="fas fa-lock"></i>
                  <Input
                    className="inputFields"
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    style={{fontSize: 25}}
                  />
                </label>
              </div>
            </div>
            <div>
              <div className="loginButton">
                <Button className={classes.button} variant="contained" color="primary" onClick={this.registerUser}>Login</Button>
              </div>
              <div className="registerAndCancelButton">
                <Button className={classes.button} variant="contained" color="default" ><Link to="/home" style={{ textDecoration: 'none' }}>Cancel</Link></Button>
              </div>
            </div>
          </div>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withStyles(styles)(RegisterPage));

