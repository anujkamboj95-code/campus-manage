const router = require('express').Router();
const Booking = require('../models/Booking');
const { auth, adminOnly } = require('../middleware/auth');
const { createNotification } = require('../middleware/notify');

const hasConflict = async (room_id, date, start_time, end_time, excludeId = null) => {
  const query = {
    room_id, date, status: 'approved',
    $or: [
      { start_time: { $lt: end_time }, end_time: { $gt: start_time } }
    ]
  };
  if (excludeId) query._id = { $ne: excludeId };
  return await Booking.findOne(query);
};

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    const bookings = await Booking.find(filter).populate('user_id', 'name email role').populate('room_id', 'room_name type capacity');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { room_id, date, start_time, end_time, purpose } = req.body;
    if (await hasConflict(room_id, date, start_time, end_time))
      return res.status(400).json({ message: 'Time slot conflict: room already booked' });
    const booking = await Booking.create({ user_id: req.user.id, room_id, date, start_time, end_time, purpose });
    await createNotification(req.user.id, `Booking request submitted for ${date} ${start_time}-${end_time}`, 'booking');
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    const booking = await Booking.findById(req.params.id).populate('room_id', 'room_name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status === 'approved') {
      const conflict = await hasConflict(booking.room_id._id, booking.date, booking.start_time, booking.end_time, booking._id);
      if (conflict) return res.status(400).json({ message: 'Conflict with another approved booking' });
    }

    booking.status = status;
    booking.admin_note = admin_note;
    await booking.save();

    await createNotification(booking.user_id, `Your booking for ${booking.room_id.room_name} on ${booking.date} has been ${status}`, 'booking');
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.user_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });
    await booking.deleteOne();
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
