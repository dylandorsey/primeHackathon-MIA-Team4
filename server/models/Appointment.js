const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  id: { type: Number, index:{ unique: true } },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  email: { type: String },
  date: { type: String },
  time: { type: String },
  endTime: { type: String },
  dateCreated: { type: String },
  datetimeCreated: { type: Date },
  datetime: { type: Date },
  driveDistanceToNextAppointment: { type: String },
  driveTimeToNextAppointment: { type: String},
  price: { type: String },
  priceSold: { type: String },
  paid: { type: String },
  amountPaid: { type: String },
  type: { type: String },
  appointmentTypeID: { type: Number },
  addonIDs: { type: Array },
  category: { type: String },
  duration: { type: String },
  calendar: { type: String },
  calendarID: { type: Number },
  forms: { type: Array },
  location: { type: String },
  notes: { type: String },
  timezone: { type: String },
  calendarTimezone: { type: String },
  canceled: { type: Boolean },
  canClientCancel: { type: Boolean },
  canClientReschedule: { type: Boolean },
  lat: { type: String },
  lng: { type: String },
  travel_time: { type: String },
  travel_distance: { type: String }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
