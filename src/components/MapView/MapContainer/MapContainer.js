import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';

const mapStateToProps = state => ({
    user: state.user,
    reduxState: state,
});

const API_KEY = process.env.REACT_APP_API_KEY;

class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latLng: {
                lat: 44.986656,
                lng: -93.258133,
            },
            zoom: 11,
        };
    }

    render() {

        let appointments = this.props.reduxState.mapData.mapData;
        let placeDisplayOnMarker = appointments.map(((appointment, i) => {
            return (
                <Marker key={appointment._id} position={{ lat: appointment.lat, lng: appointment.lng }} icon={appointment.marker} title={`${appointment.calendar}: ${appointment.time}`}/>
            )
        }));

        return (

            <div className="mapContainer">
                <Map
                    google={this.props.google}
                    zoom={this.state.zoom}
                    initialCenter={this.state.latLng}
                >
                    {placeDisplayOnMarker}
                </Map>
            </div>
        )
    }
}

const connectToGoogleMaps = GoogleApiWrapper({
    // apiKey: API_KEY,
    apiKey: ('AIzaSyAfrUvtgh7j4JKGW6bkFPspZ4ZZ8uqlE-M')
})(MapContainer)

export default connect(mapStateToProps)(connectToGoogleMaps)
