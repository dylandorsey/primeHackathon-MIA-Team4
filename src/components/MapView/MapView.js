import React, { Component } from 'react';
import { connect } from 'react-redux';
import Nav from '../../components/Nav/Nav';
import { USER_ACTIONS } from '../../redux/actions/userActions';
import { MAP_ACTIONS } from '../../redux/actions/mapActions';
import MapContainer from './MapContainer/MapContainer';
import Mileage from './Mileage/Mileage';
import map from './map.css'

const mapStateToProps = state => ({
  user: state.user,
  reduxState: state
});

class MapView extends Component {

  constructor(props) {
    super(props);
}

  componentDidMount() {
    this.props.dispatch({
      type: USER_ACTIONS.FETCH_USER
    });
    this.props.dispatch({
      type: MAP_ACTIONS.GET_DATA
    });
  }

  componentDidUpdate() {
    if (!this.props.user.isLoading && this.props.user.userName === null) {
      this.props.history.push('home');
    }
  }

  render() {
    let content = null;


    if (this.props.user.userName) {
      content = (
        <div>
        </div>
      );
    }

    return (
      <div className="mapView">
      <div className="navbar">
        <Nav />
        </div>
        <div className="instructions">
         </div> 
        {content}
        <div className="wrapper">
          <MapContainer />
          <Mileage/>
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps)(MapView);

