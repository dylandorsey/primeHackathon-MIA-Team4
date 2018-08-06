const express = require('express');
const Acuity = require('acuityscheduling');
const { rejectUnauthenticated } = require('../modules/authentication-middleware');
const Appointment = require('../models/Appointment');
const Block = require('../models/Block');
const Calendar = require('../models/Calendar');

const appointments = require('../constants/demoAppointments');
const calendars = require('../constants/demoCalendars');

const acuity = Acuity.basic({
  userId: process.env.ACUITY_USER_ID,
  apiKey: process.env.ACUITY_API_KEY
});

const router = express.Router();

const filterCalendars = (unfilteredCalendars) => {
  let filteredCalendars = [];
  let ignoredCalendars = ['*members', '*placeHolder', 'zPhotog', 'zSched'];
  unfilteredCalendars.forEach(calendar => {
    if (!ignoredCalendars.some(ignoredString => calendar.name.includes(ignoredString))) {
      filteredCalendars.push(calendar);
    }
  });
  return filteredCalendars;
}

router.get('/appointments', rejectUnauthenticated, (req, res) => {
  (async () => {
    try {
      await Appointment.remove({});
      await Appointment.create(appointments);
      res.sendStatus(201);
    } catch (error) {
      throw error;
    }
  })().catch(error => {
    console.log(error);
    res.sendStatus(500);
  });
});

router.get('/calendars', rejectUnauthenticated, (req, res) => {
  (async () => {
    try {
      await Calendar.remove({});
      const filteredCalendars = await filterCalendars(calendars);
      await Calendar.create(filteredCalendars);
      res.sendStatus(201);
    } catch (error) {
      throw error;
    }
  })().catch(error => {
    console.log(error);
    res.sendStatus(500);
  });
});

router.post('/blocks', rejectUnauthenticated, (req, res) => {
  let options = {
    method: 'POST',
    body: {
      start: '07-10-2018 12:00am',
      end: '07-10-2018 11:59pm',
      calendarID: 116754,
      notes: 'EDITING SCHEDULE',
    },
  };
  acuity.request('blocks', options, (error, response, block) => {
    if (error) return console.error(error);
    res.send(block);
  })
});

router.delete('/blocks/:id', rejectUnauthenticated, (req, res) => {
  let url = `blocks/${req.params.id}`;
  let options = {
    method: 'DELETE',
  };
  acuity.request(url, options, (error, response) => {
    if (error) return console.error(error);
    res.sendStatus(200);
  })
})

router.get('/blocks', (req, res) => {
  acuity.request('blocks', (error, response, blocks) => {
    if (error) return console.error(error);
    res.send(blocks);
  })
})

module.exports = router;
