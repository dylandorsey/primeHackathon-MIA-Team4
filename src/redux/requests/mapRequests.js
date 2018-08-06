import axios from 'axios';
import moment from 'moment';

export function getData() {
    const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      };
      return axios.get('api/data/appointments', config)
        .then(response => response.data)
        .catch((error) => { throw error; });
}


// export function getGeoCoordinates() {
//   const config = {
//     headers: { 'Content-Type': 'application/json' },
//     withCredentials: true,
//   };
//   console.log(' getGeoCoordinates');
//   return axios.get('/api/google/geocode', config)
//   .then(response => response.data)
//   .catch((error) => {
//     throw error;
//   });
// }

// export function getTravelDistance(mapData) {
//   console.log('-----mapData----', mapData)
//   const config = {
//     headers: { 'Content-Type': 'application/json' },
//     withCredentials: true,
//   };
//   const params = ({
//     origins: `${mapData.origins.lat},${mapData.origins.lng}`,
//     destinations: `${mapData.destinations.lat},${mapData.destinations.lng}`,
//     departure_time: moment(mapData.origins.end).unix(),
// });
//   console.log(' getTravelDistance');
//   return axios.get('/api/google/distance', {params}, config)
//   .then(response => response.data)
//   .catch((error) => {
//     throw error;
//   });
// }


