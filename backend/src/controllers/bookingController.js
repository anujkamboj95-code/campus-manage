const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

const hasConflict = async (room_id, date, start_time, end_time, excludeId = null) => {
  const query = {
    room_id,
    date,
    status: 'approved',
    $or: [
      { start_time: { $lt: end_time }, end_time: { $gt: start_time } }
    ]
  };
  if (excludeId) query._id = { $ne: excludeId };
  return await Booking.findOne(query);
};

exports.getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user_id: req.user._id };
    const { status, date } = req.query;
    if (status) filter.status = status;
    if (date) filter.date = date;
    const bookings = await Booking.find(filter)
      .populate('user_id', 'name email role')
      .populate('room_id', 'room_name type capacity')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { room_id, date, start_time, end_time, purpose } = req.body;
    if (await hasConflict(room_id, date, start_time, end_time)) {
      return res.status(409).json({ message: 'Time slot conflict: room already booked' });
    }
    const booking = await Booking.create({ user_id: req.user._id, room_id, date, start_time, end_time, purpose });
    const admins = await User.find({ role: 'admin' });
    await Notification.insertMany(admins.map(a => ({
      user_id: a._id,
      message: `New booking request from ${req.user.name} for ${date}`,
      type: 'booking',
      ref_id: booking._id
    })));
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    const booking = await Booking.findById(req.params.id).populate('room_id', 'room_name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status === 'approved') {
      const conflict = await hasConflict(booking.room_id._id, booking.date, booking.start_time, booking.end_time, booking._id);
      if (conflict) return res.status(409).json({ message: 'Conflict with another approved booking' });
    }

    booking.status = status;
    if (admin_note) booking.admin_note = admin_note;
    await booking.save();

    await Notification.create({
      user_id: booking.user_id,
      message: `Your booking for ${booking.room_id.room_name} on ${booking.date} has been ${status}`,
      type: 'booking',
      ref_id: booking._id
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await booking.deleteOne();
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCalendarBookings = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = `${year}-${String(month).padStart(2, '0')}-31`;
      filter.date = { $gte: start, $lte: end };
    }
    const bookings = await Booking.find({ ...filter, status: 'approved' })
      .populate('room_id', 'room_name')
      .populate('user_id', 'name');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
