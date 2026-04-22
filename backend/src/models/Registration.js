const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['registered', 'cancelled'], default: 'registered' }
}, { timestamps: true });

registrationSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
