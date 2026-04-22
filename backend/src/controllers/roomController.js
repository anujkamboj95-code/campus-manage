const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const { type, capacity, availability, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (availability !== undefined) filter.availability = availability === 'true';
    if (search) filter.room_name = { $regex: search, $options: 'i' };
    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
