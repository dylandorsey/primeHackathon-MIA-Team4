const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlockSchema = new Schema({
  id: { type: Number, index:{ unique: true } },
  notes: { type: String },
  description: { type: String }
});

module.exports = mongoose.model('Block', BlockSchema);