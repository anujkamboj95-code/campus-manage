require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Room = require('./src/models/Room');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Room.deleteMany({});

  const hash = async pw => bcrypt.hash(pw, 10);

  await User.insertMany([
    { name: 'Admin User', email: process.env.ADMIN_EMAIL || 'admin@campus.com', password: await hash(process.env.ADMIN_PASSWORD || 'changeme_admin'), role: 'admin' },
    { name: 'Prof. Smith', email: process.env.TEACHER_EMAIL || 'teacher@campus.com', password: await hash(process.env.TEACHER_PASSWORD || 'changeme_teacher'), role: 'teacher' },
    { name: 'Alice Student', email: process.env.STUDENT_EMAIL || 'student@campus.com', password: await hash(process.env.STUDENT_PASSWORD || 'changeme_student'), role: 'student' },
  ]);

  await Room.insertMany([
    { room_name: 'Room 101', type: 'classroom', capacity: 40, availability: true, facilities: ['Projector', 'Whiteboard', 'AC'] },
    { room_name: 'Room 102', type: 'classroom', capacity: 35, availability: true, facilities: ['Whiteboard'] },
    { room_name: 'CS Lab 1', type: 'lab', capacity: 30, availability: true, facilities: ['Computers', 'Projector', 'AC'] },
    { room_name: 'CS Lab 2', type: 'lab', capacity: 25, availability: true, facilities: ['Computers', 'AC'] },
    { room_name: 'Main Auditorium', type: 'auditorium', capacity: 500, availability: true, facilities: ['Stage', 'Sound System', 'AC', 'Projector'] },
    { room_name: 'Conference Hall A', type: 'conference', capacity: 20, availability: true, facilities: ['TV Screen', 'AC', 'Whiteboard'] },
    { room_name: 'Seminar Hall', type: 'seminar', capacity: 80, availability: true, facilities: ['Projector', 'AC', 'Mic'] },
  ]);

  console.log('✅ Seed data inserted successfully');
  console.log('Login with the credentials set in your .env file (ADMIN_EMAIL, TEACHER_EMAIL, STUDENT_EMAIL)');
  console.log('Default emails: admin@campus.com, teacher@campus.com, student@campus.com');
  console.log('⚠️  Make sure to set strong passwords via environment variables before production use.');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
