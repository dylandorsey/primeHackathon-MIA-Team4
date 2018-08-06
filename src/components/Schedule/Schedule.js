import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from '../../components/Nav/Nav';
import { USER_ACTIONS } from '../../redux/actions/userActions';


const mapStateToProps = state => ({
  user: state.user,
});

class Schedule extends Component {

  constructor(props) {
    super(props);


  }

  componentDidMount() {
    this.props.dispatch({
      type: USER_ACTIONS.FETCH_USER
    });
  }

  componentDidUpdate() {
    if (!this.props.user.isLoading && this.props.user.userName === null) {
      this.props.history.push('home');
    }
  }

  render() {

    const content = (
      <div>
        <h1 id="schedule">Schedule</h1>
      </div>
    );

    return (
      <div>
        <Nav />
        {content}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Schedule);

