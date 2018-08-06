import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { triggerLogin, formError, clearError } from '../../redux/actions/loginActions';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  button: {
    width: 500
  },
}

const mapStateToProps = state => ({
  user: state.user,
  login: state.login,
});

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }

  componentDidMount() {
    this.props.dispatch(clearError());
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.userName) {
      this.props.history.push('/schedule');
    }
  }

  login = (event) => {
    event.preventDefault();

    if (this.state.username === '' || this.state.password === '') {
      this.props.dispatch(formError());
    } else {
      this.props.dispatch(triggerLogin(this.state.username, this.state.password));
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
    if (this.props.login.message !== '') {
      return (
        <h2
          className="alert"
          role="alert"
        >
          {this.props.login.message}
        </h2>
      );
    }
    return (<span />);
  }

  render() {
  const { classes } = this.props
    return (
      <div>
        {this.renderAlert()}
        
        <form onSubmit={this.login}>
          <div className="loginAndRegisterTitle">
          <div>
            <h1>Login Here</h1>
            </div>
          </div>
          <div className="inputFieldsAndButtonsDiv">
          <div className="inputFieldsDiv">
          <div className="usernameInput">
            <label htmlFor="username">
              <i className="fas fa-user"></i>
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
              <Button className={classes.button} variant="contained" color="primary" onClick={this.login}>Login</Button>
            </div>
            <div className="registerAndCancelButton">
              <Button className={classes.button} variant="contained" color="default" ><Link to="/register" style={{ textDecoration: 'none' }}>Register</Link></Button>
            </div>
          </div>
          </div>
        </form>
        
      </div>
    );
  }
}


export default connect(mapStateToProps)(withStyles(styles)(LoginPage));
