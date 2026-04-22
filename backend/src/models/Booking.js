const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  admin_note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
