import React, { Component } from 'react';
import { connect } from 'react-redux';


const mapStateToProps = state => ({
  user: state.user,
});

class DetailsModal extends Component {


  render() {

    return (
      <div>
        <h3>This compnent is for the 'More Details' modal</h3>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DetailsModal);

