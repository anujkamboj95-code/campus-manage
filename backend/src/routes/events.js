const router = require('express').Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { createNotification } = require('../middleware/notify');

router.get('/', auth, async (req, res) => {
  try {
    const { status, category, search, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (date) filter.date = date;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const events = await Event.find(filter)
      .populate('created_by', 'name email role')
      .populate('room_id', 'room_name type capacity')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, date, start_time, end_time, room_id, max_participants, category } = req.body;

    const conflict = await Booking.findOne({
      room_id, date, status: 'approved',
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }]
    });
    if (conflict) return res.status(400).json({ message: 'Room is already booked during this time' });

    const booking = await Booking.create({
      user_id: req.user.id, room_id, date, start_time, end_time,
      purpose: `Event: ${name}`, status: 'approved'
    });

    const event = await Event.create({
      created_by: req.user.id, name, description, date, start_time, end_time,
      room_id, max_participants, category, booking_id: booking._id
    });

    await createNotification(req.user.id, `Event "${name}" submitted for approval`, 'event');
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const finalStatus = status === 'approved' ? 'upcoming' : status;
    event.status = finalStatus;
    await event.save();

    if (status === 'rejected' && event.booking_id) {
      await Booking.findByIdAndUpdate(event.booking_id, { status: 'rejected' });
    }

    await createNotification(event.created_by, `Your event "${event.name}" has been ${status}`, 'event');
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (event.created_by.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (event.created_by.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });
    if (event.booking_id) await Booking.findByIdAndDelete(event.booking_id);
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
