const express = require('express');
const { rejectUnauthenticated } = require('../modules/authentication-middleware');
const Appointment = require('../models/Appointment');
const Calendar = require('../models/Calendar');

const router = express.Router();

router.get('/appointments', rejectUnauthenticated, (req, res) => {
    Appointment.find({})
    .then(response => {
      res.send(response);
    })
    .catch(error => {
      console.log('Error getting appointments from MongoDB: ', error);
      res.sendStatus(500);
    })
});

router.get('/calendars', (req, res) => {
    Calendar.find({}).sort({ name: 1 })
    .then(response => {
      res.send(response)
    })
    .catch(error => {
      console.log('Error getting calendars from MongoDB: ', error);
      res.sendStatus(500);
    })
});

// ID should be ID from mongo object, i.e. _id, not acuity appointment ID, id
router.put('/appointment/:id', rejectUnauthenticated, (req, res) => {
  const appointmentId = req.params.id;
  const updatedValues = req.body;
  Appointment.findByIdAndUpdate(appointmentId, updatedValues)
    .then(response => {
      res.sendStatus(201);
    })
    .catch(error => {
      console.log(error);
      res.sendStatus(500);
    })
});

module.exports = router;
