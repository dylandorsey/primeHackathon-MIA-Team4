const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const axios = require('axios');

const getGeocode = (appointmentObject) => {
  return new Promise((resolve, reject) => {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?`, {
      params: {
        address: appointmentObject.location,
        key: process.env.GOOGLE_API_KEY
      }
    }).then(response => {
      const geoCodes = response.data.results[0].geometry.location;
      appointmentObject.lat = geoCodes.lat;
      appointmentObject.lng = geoCodes.lng;
      resolve(appointmentObject);
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  })
}

const getMarketMileage = (appointmentObject) => {
  return new Promise((resolve, reject) => {
    axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?', {
      params: {
        units: 'imperial',
        origins: '44.977034,-93.174156|45.250413,-93.265450',
        destinations: appointmentObject.location,
        key: process.env.GOOGLE_API_KEY || NULL,
      }
    }).then(response => {
      const mileage = response.data.rows;
      appointmentObject.forms[0].values[0].value = mileage[0].elements[0].distance.text;
      appointmentObject.forms[0].values[1].value = mileage[1].elements[0].distance.text;
      resolve(appointmentObject);
    }).catch(error => {
      console.log(error);
      reject(error);
    })
  })
}

router.get('/geocode', (req, res) => {
  (async () => {
    try {
      const appointments = await Appointment.find({});
      let appointmentsWithGeocodes = [];
      for (let i = 0; i < appointments.length; i++) {
        const geocodedAppointment = await getGeocode(appointments[i]);
        appointmentsWithGeocodes.push(geocodedAppointment);
      };
      for (let i = 0; i < appointmentsWithGeocodes.length; i++) {
        let appointmentToUpdate = appointmentsWithGeocodes[i];
        await Appointment.update({ _id: appointmentToUpdate._id }, appointmentToUpdate);
      }
      res.sendStatus(201);
    } catch (error) {
      throw error;
    }
  })().catch(error => {
    console.log(error);
    res.sendStatus(500);
  });
});

router.get('/distance', (req, res) => {
  let queryParams = req.query;
  axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?`, {
    params: {
      units: 'imperial',
      origins: queryParams.origins, //lat and long separated by , with no spaces
      destinations: queryParams.destinations, //lat and long separated by , with no spaces
      departure_time: queryParams.departure_time, //convert to Epoch time in seconds
      travel_mode: 'pessimistic',
      key: process.env.GOOGLE_API_KEY || NULL,
    }
  }).then((response) => {
    let results = response.data.rows[0].elements[0];
    let travelInfo = {
      distance: results.distance.value, // distance in meters
      duration: results.duration_in_traffic.value, // travel time with traffic in seconds
    };
    res.send(travelInfo);
  }).catch((error) => {
    console.log('error with distance GET to API', error);
  });
});

router.get('/market', (req, res) => {
  (async () => {
    try {
      const appointments = await Appointment.find({});
      let appointmentsMarketMileage = [];
      for (let i = 0; i < appointments.length; i++) {
        const marketAppointment = await getMarketMileage(appointments[i]);
        appointmentsMarketMileage.push(marketAppointment);
      };
      for (let i = 0; i < appointmentsMarketMileage.length; i++) {
        let appointmentToUpdate = appointmentsMarketMileage[i];
        await Appointment.update({ _id: appointmentToUpdate._id }, appointmentToUpdate);
      }
      res.sendStatus(201);
    } catch (error) {
      throw error;
    }
  })().catch(error => {
    console.log(error);
    res.sendStatus(500);
  });
});

module.exports = router;
