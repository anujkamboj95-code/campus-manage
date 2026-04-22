const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  max_participants: { type: Number, required: true },
  category: { type: String, enum: ['hackathon', 'fest', 'workshop', 'seminar', 'meeting', 'other'], default: 'other' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'upcoming', 'ongoing', 'completed'], default: 'pending' },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
