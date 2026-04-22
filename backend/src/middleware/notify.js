const Notification = require('../models/Notification');

const createNotification = async (user_id, message, type = 'general', link = '') => {
  try {
    await Notification.create({ user_id, message, type, link });
  } catch (err) {
    console.error('Notification error:', err);
  }
};

module.exports = { createNotification };
