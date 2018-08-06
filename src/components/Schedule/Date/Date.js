import React, { Component } from 'react';
import { connect } from 'react-redux';


const mapStateToProps = state => ({
  user: state.user,
});

class Date extends Component {


  render() {

    return (
      <div>
        <h3>Date (MM/DD/YYYY)</h3>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Date);

