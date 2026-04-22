const router = require('express').Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { createNotification } = require('../middleware/notify');

router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const regs = await Registration.find({ event_id: req.params.eventId, status: 'registered' })
      .populate('user_id', 'name email role');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const regs = await Registration.find({ user_id: req.user.id })
      .populate({ path: 'event_id', populate: { path: 'room_id', select: 'room_name' } });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { event_id } = req.body;
    const event = await Event.findById(event_id);
    if (!event || event.status !== 'upcoming') return res.status(400).json({ message: 'Event not available for registration' });

    const count = await Registration.countDocuments({ event_id, status: 'registered' });
    if (count >= event.max_participants) return res.status(400).json({ message: 'Event is full' });

    const existing = await Registration.findOne({ event_id, user_id: req.user.id });
    if (existing) {
      if (existing.status === 'registered') return res.status(400).json({ message: 'Already registered' });
      existing.status = 'registered';
      await existing.save();
      return res.json(existing);
    }

    const reg = await Registration.create({ event_id, user_id: req.user.id });
    await createNotification(req.user.id, `Successfully registered for "${event.name}"`, 'registration');
    res.status(201).json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Not found' });
    if (reg.user_id.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    reg.status = 'cancelled';
    await reg.save();
    res.json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
