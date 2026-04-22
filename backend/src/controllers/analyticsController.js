const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Room = require('../models/Room');

exports.getAnalytics = async (req, res) => {
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

    const topEvents = await Registration.aggregate([
      { $group: { _id: '$event_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { event_name: '$event.name', count: 1 } }
    ]);

    const bookingsByMonth = await Booking.aggregate([
      { $group: { _id: { $substr: ['$date', 0, 7] }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({ totalUsers, totalRooms, totalBookings, totalEvents, bookingsByStatus, eventsByStatus, topRooms, topEvents, bookingsByMonth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
