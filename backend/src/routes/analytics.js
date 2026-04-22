const router = require('express').Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Room = require('../models/Room');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalRooms, totalBookings, totalEvents] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Event.countDocuments()
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const eventsByStatus = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topRooms = await Booking.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$room_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $project: { room_name: '$room.room_name', count: 1 } }
    ]);

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5)
      .populate('user_id', 'name role').populate('room_id', 'room_name');

    res.json({ totalUsers, totalRooms, totalBookings, totalEvents, bookingsByStatus, eventsByStatus, topRooms, recentBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
