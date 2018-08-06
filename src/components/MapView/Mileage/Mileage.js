import React, { Component } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    user: state.user,
    reduxState: state,
});

class Mileage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        console.log('miles data in milieage:', this.props.reduxState.mapData.milesViewData );

        let milesViewData = this.props.reduxState.mapData.milesViewData;
        let photogs = milesViewData.map(((mapData, i) => {
            return <tr key={i}><td><img src={mapData.marker} />{mapData.photog}</td><td>{mapData.miles} miles</td></tr>
        }));

        return (

            <div className="mileage-table">
                <table className="map-table mileage">
                    <thead>
                        <tr>
                            <th>Photographer</th>
                            <th>Total Mileage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {photogs}
                    </tbody>
                </table>

          
            </div>
        )
    }
}

export default connect(mapStateToProps)(Mileage)
