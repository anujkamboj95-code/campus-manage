const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

exports.register = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || event.status !== 'approved') return res.status(400).json({ message: 'Event not available' });

    const count = await Registration.countDocuments({ event_id: event._id });
    if (count >= event.max_participants) return res.status(400).json({ message: 'Event is full' });

    const reg = await Registration.create({ event_id: event._id, user_id: req.user._id });

    await Notification.create({
      user_id: req.user._id,
      message: `You have successfully registered for "${event.name}"`,
      type: 'registration',
      ref_id: event._id
    });

    res.status(201).json(reg);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already registered' });
    res.status(500).json({ message: err.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOneAndDelete({ event_id: req.params.eventId, user_id: req.user._id });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventParticipants = async (req, res) => {
  try {
    const regs = await Registration.find({ event_id: req.params.eventId }).populate('user_id', 'name email role');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user_id: req.user._id })
      .populate({ path: 'event_id', populate: { path: 'room_id', select: 'room_name' } });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
