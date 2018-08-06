import { put, takeEvery } from 'redux-saga/effects';
import { MAP_ACTIONS } from '../actions/mapActions';
import { getData, getGeoCoordinates, getTravelDistance } from '../requests/mapRequests';

function* fetchData() {
    try {
        let mapData = yield getData()
        // const geoCodeData = yield getGeoCoordinates()
        // const travelDistance = yield getTravelDistance()
        mapData = yield addMarkerTo(mapData);
        // console.log('data checking 123123123123123123123', mapData);
        yield put({
            type: MAP_ACTIONS.SET_DATA,
            payload: mapData,
        });
        yield put({
            type: MAP_ACTIONS.SET_MILES_VIEW_DATA,
            payload: yield constructMilesData(mapData),
        });
    } catch (error) {
        console.log('GET getLatLng error', error);
    }
}

function* addMarkerTo(data){
      //Logic for marker to display per photog
      let newData = data;
    //   console.log(';;;;;;;;;;;;;;; new data: ', newData);
      let photogMarker = [];// contain objects == {photog, marker}
      let markers = [];// store marker image name
      for (let i = 1; i < 21; i++) {
        markers.push(i + '.png');
      }

      let counter = 0;// use to change the marker image for photog

      //looping through the appointment/appointments data(array)
      for (let i = 0; i < data.length; i++) {

        let photogMarkerIndex = -1;// initialize variable to -1 (false/out of bound)

        //looping thought the photogMarker to check if a marker is assign to the photog already
        for (let j = 0; j < photogMarker.length; j++) {
          if (photogMarker[j].photog == newData[i].calendar) {
            //if photog is assign set the photogMarkerIndex to the current index of j (which represent where the photog marker is store in photogMarker)
            photogMarkerIndex = j;
            break;
          }
        }
        //If no marker is assign to photog (-1 == does not exist in array)
        if (photogMarkerIndex == -1) {

          //Assign a new marker to current photog at i

          photogMarker.push({ photog: newData[i].calendar, marker: markers[counter] })// save assign marker to photog

          newData[i].marker = markers[counter];// adding the marker to the appointment/data data(array) for photog at position i;

          //logic to increment counter so it dont go out of bound
          if (counter == markers.length - 1) {
            counter = 0;
          } else {
            counter++;
          }

        } else {
          //marker is already assign to photog

          // adding the marker at photogMarkerIndex to the appointment/data data(array) for photog at position i;
          newData[i].marker = photogMarker[photogMarkerIndex].marker;
        }

      }
    //   console.log('new data after change', newData)
      return newData;
}

function constructMilesData(appointments){

    let photogArray = [];

    let counter = 0;

    for (let i = 0; i < appointments.length; i++) {

      let photogExist = false;

      //check if travel distant is undefine, if so continue to next appointment
      if(appointments[i].driveDistanceToNextAppointment == null){
        appointments[i].driveDistanceToNextAppointment = 0;
      }

      for (let j = 0; j < photogArray.length; j++) {
        if (photogArray[j].photog == appointments[i].calendar) {
          photogExist = true;
          // photogArray[j].miles += appointments[i].travel_distance;
          // console.log('distant i at ' + i, appointments[i].driveDistanceToNextAppointment)
          photogArray[j].miles += parseFloat(appointments[i].driveDistanceToNextAppointment);

          break;
        }
      }

      if (!photogExist) {
        // photogArray.push({ photog: appointments[i].calendar, marker: markers[counter], miles: appointments[i].travel_distance })
        photogArray.push({ photog: appointments[i].calendar, marker: appointments[i].marker , miles: parseFloat(appointments[i].driveDistanceToNextAppointment) })
      }

    }
//End of mileage table only allow one one marker to show and add all the travel distance/mileages of the photog together

    for (let i = 0; i < photogArray.length ; i++) {
    photogArray[i].miles = photogArray[i].miles.toFixed(2);
    }

    return photogArray;
}

function* mapSaga() {
    yield takeEvery(MAP_ACTIONS.GET_DATA, fetchData);
}

export default mapSaga;