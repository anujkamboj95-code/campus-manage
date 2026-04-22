const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'event', 'registration', 'general'], default: 'general' },
  read: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
