const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_name: { type: String, required: true },
  type: { type: String, enum: ['classroom', 'lab', 'auditorium', 'conference', 'seminar'], required: true },
  capacity: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  facilities: [String]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
