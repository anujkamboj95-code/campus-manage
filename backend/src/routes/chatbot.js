const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Room = require('../models/Room');
const Registration = require('../models/Registration');

const getBotResponse = async (message, user) => {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|hii|helo|howdy|sup|yo)/.test(msg)) {
    return `Hey ${user.name}! 👋 I'm CampusBot, your assistant at Bennett University. I can help you with:\n\n• 🏫 Room bookings\n• 📅 Events & registrations\n• ℹ️ Campus info\n\nWhat do you need help with?`;
  }

  // Who are you
  if (/who are you|what are you|your name|introduce/.test(msg)) {
    return `I'm **CampusBot** 🤖 — the official assistant for Bennett University's Campus Resource & Event Management System.\n\nI can help you book rooms, find events, check your bookings, and answer campus queries!`;
  }

  // Help
  if (/help|what can you do|commands|options/.test(msg)) {
    return `Here's what I can help you with:\n\n🏫 **Rooms** — "show available rooms", "how to book a room"\n📅 **Bookings** — "my bookings", "booking status"\n🎉 **Events** — "upcoming events", "how to register"\n🏛️ **Campus** — "about bennett", "campus location"\n📊 **Status** — "my pending bookings"\n\nJust ask naturally!`;
  }

  // About Bennett
  if (/bennett|university|campus|college/.test(msg)) {
    return `🏛️ **Bennett University** is a private university in Greater Noida, Uttar Pradesh, established by the Times of India Group.\n\n📍 Plot No 8-11, TechZone II, Greater Noida, UP 201310\n🌐 www.bennett.edu.in\n📞 1800-103-8484\n\nKnown for engineering, management, law, and media programs!`;
  }

  // Room queries
  if (/room|rooms|available room|book a room|classroom|lab|auditorium/.test(msg)) {
    try {
      const rooms = await Room.find({ availability: true });
      if (rooms.length === 0) return `No rooms are currently available. Please check back later.`;
      const list = rooms.slice(0, 5).map(r => `• ${r.room_name} (${r.type}, cap: ${r.capacity})`).join('\n');
      return `🏫 **Available Rooms (${rooms.length} total):**\n\n${list}${rooms.length > 5 ? `\n...and ${rooms.length - 5} more` : ''}\n\nGo to the **Rooms** page to view all and submit a booking request!`;
    } catch {
      return `Head to the **Rooms** page to browse and book available rooms!`;
    }
  }

  // Booking status / my bookings
  if (/my booking|booking status|pending booking|approved booking|check booking/.test(msg)) {
    try {
      const bookings = await Booking.find({ user_id: user.id }).populate('room_id', 'room_name').sort({ createdAt: -1 }).limit(5);
      if (bookings.length === 0) return `You have no bookings yet. Go to the **Bookings** page to create one!`;
      const list = bookings.map(b => `• ${b.room_id?.room_name} on ${b.date} — **${b.status}**`).join('\n');
      return `📋 **Your Recent Bookings:**\n\n${list}\n\nVisit the **Bookings** page for full details.`;
    } catch {
      return `Visit the **Bookings** page to check your booking status!`;
    }
  }

  // How to book
  if (/how to book|create booking|make booking|submit booking/.test(msg)) {
    return `📝 **How to Book a Room:**\n\n1. Go to **Bookings** in the navbar\n2. Click **"New Booking"**\n3. Select a room, date & time slot\n4. Choose your purpose\n5. Submit — Admin will approve/reject\n\n⚡ Teachers get priority over students!`;
  }

  // Events
  if (/upcoming event|events|show event|event list/.test(msg)) {
    try {
      const events = await Event.find({ status: 'upcoming' }).populate('room_id', 'room_name').sort({ date: 1 }).limit(5);
      if (events.length === 0) return `No upcoming events right now. Check the **Events** page for updates!`;
      const list = events.map(e => `• **${e.name}** — ${e.date} at ${e.start_time} (${e.room_id?.room_name})`).join('\n');
      return `🎉 **Upcoming Events:**\n\n${list}\n\nGo to **Events** to register!`;
    } catch {
      return `Check the **Events** page to see all upcoming events!`;
    }
  }

  // How to create event
  if (/create event|make event|organize event|host event/.test(msg)) {
    return `🎯 **How to Create an Event:**\n\n1. Go to **Events** in the navbar\n2. Click **"Create Event"**\n3. Fill in name, description, date, time\n4. Select venue (room) & max participants\n5. Submit for Admin approval\n\nOnce approved, students can register!`;
  }

  // Register for event
  if (/register.*event|join event|event registration|sign up.*event/.test(msg)) {
    return `✅ **How to Register for an Event:**\n\n1. Go to **Events** page\n2. Find an event with **"Upcoming"** status\n3. Click **"Register"** button\n4. Done! Check **My Events** to see your registrations\n\nNote: Registration closes when capacity is full!`;
  }

  // My registrations
  if (/my registration|my event|registered event|cancel registration/.test(msg)) {
    if (user.role === 'student') {
      try {
        const regs = await Registration.find({ user_id: user.id, status: 'registered' })
          .populate('event_id', 'name date status').limit(5);
        if (regs.length === 0) return `You haven't registered for any events yet. Go to **Events** to explore!`;
        const list = regs.map(r => `• **${r.event_id?.name}** on ${r.event_id?.date}`).join('\n');
        return `🎟️ **Your Event Registrations:**\n\n${list}\n\nVisit **My Events** to manage them.`;
      } catch {
        return `Visit **My Events** in the navbar to see your registrations!`;
      }
    }
    return `Visit the **Events** page to manage event registrations!`;
  }

  // Admin queries
  if (/approve|reject|admin|manage/.test(msg)) {
    if (user.role === 'admin') {
      return `⚙️ **Admin Actions:**\n\n• **Bookings** — Approve/Reject pending room requests\n• **Events** — Approve/Reject event submissions\n• **Rooms** — Add, edit, delete rooms\n• **Analytics** — View stats & top rooms\n\nAll managed from the navbar!`;
    }
    return `Only admins can approve/reject bookings and events. Contact your campus admin for help!`;
  }

  // Conflict / double booking
  if (/conflict|double booking|overlap|already booked/.test(msg)) {
    return `⚠️ **Conflict Detection:**\n\nThe system automatically prevents double bookings. If a room is already booked for a time slot, your request will be blocked.\n\nTry a different time slot or room!`;
  }

  // Notifications
  if (/notification|alert|update/.test(msg)) {
    return `🔔 **Notifications:**\n\nYou'll get notified when:\n• Your booking is approved/rejected\n• Your event is approved/rejected\n• You register for an event\n\nCheck the bell icon 🔔 in the top navbar!`;
  }

  // Contact / support
  if (/contact|support|help desk|email|phone/.test(msg)) {
    return `📞 **Bennett University Support:**\n\n📧 info@bennett.edu.in\n📞 1800-103-8484\n🌐 www.bennett.edu.in\n📍 Plot 8-11, TechZone II, Greater Noida\n\nFor system issues, contact your campus admin!`;
  }

  // Goodbye
  if (/bye|goodbye|see you|thanks|thank you|ok thanks/.test(msg)) {
    return `You're welcome! 😊 Have a great day at Bennett University! Feel free to ask anytime. 👋`;
  }

  // Default fallback
  return `I'm not sure about that 🤔\n\nI can help you with:\n• Room bookings & availability\n• Upcoming events & registration\n• Your booking/event status\n• Campus information\n\nTry asking something like *"show available rooms"* or *"upcoming events"*!`;
};

router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });
    const reply = await getBotResponse(message, req.user);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: 'Sorry, I ran into an error. Please try again!' });
  }
});

module.exports = router;
