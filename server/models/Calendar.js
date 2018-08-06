const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CalendarSchema = new Schema({
  id: { type: Number, index:{ unique: true } },
  name: { type: String }
});

module.exports = mongoose.model('Calendar', CalendarSchema);
