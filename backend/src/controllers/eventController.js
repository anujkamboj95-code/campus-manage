const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getEvents = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const events = await Event.find(filter)
      .populate('created_by', 'name email role')
      .populate('room_id', 'room_name type capacity')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, start_time, end_time, room_id, max_participants, category } = req.body;

    const conflict = await Booking.findOne({
      room_id, date, status: 'approved',
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }]
    });
    if (conflict) return res.status(409).json({ message: 'Room is already booked for this time slot' });

    const booking = await Booking.create({
      user_id: req.user._id, room_id, date, start_time, end_time,
      purpose: `Event: ${name}`, status: 'pending'
    });

    const event = await Event.create({
      created_by: req.user._id, name, description, date, start_time, end_time,
      room_id, max_participants, category, booking_id: booking._id
    });

    booking.event_id = event._id;
    await booking.save();

    const admins = await User.find({ role: 'admin' });
    await Notification.insertMany(admins.map(a => ({
      user_id: a._id,
      message: `New event "${name}" submitted for approval by ${req.user.name}`,
      type: 'event',
      ref_id: event._id
    })));

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    await event.save();

    if (event.booking_id) {
      const bookingStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : null;
      if (bookingStatus) await Booking.findByIdAndUpdate(event.booking_id, { status: bookingStatus });
    }

    await Notification.create({
      user_id: event.created_by,
      message: `Your event "${event.name}" has been ${status}`,
      type: 'event',
      ref_id: event._id
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (event.created_by.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (event.booking_id) await Booking.findByIdAndDelete(event.booking_id);
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
