# Campus Resource & Event Management System

A full-stack web application for managing campus room bookings and college events.

## Tech Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Auth:** JWT

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB on port 27017)

### 1. Configure Environment
Create `backend/.env`:
```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Start Backend
```bash
cd backend
npm install
npm run seed      # Seed demo data (run once)
npm run dev       # Start backend on port 5001
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm start         # Start frontend on port 3000
```

## Demo Accounts

Demo credentials are configured in `backend/seed.js`.
Run `npm run seed` to create them, then login with the credentials you set.

> ⚠️ Never commit real credentials. Update `backend/seed.js` with your own before pushing.

## Features

### Module 1: Room Booking
- JWT-based auth with 3 roles (Admin, Teacher, Student)
- Admin: Add/Edit/Delete rooms with type, capacity, facilities
- Users: Submit booking requests with date, time slot, purpose
- Admin: Approve/Reject with conflict detection (no double booking)
- Priority booking: Teacher > Student
- Status tracking: Pending / Approved / Rejected

### Module 2: Event Management
- Create events (hackathon, fest, workshop, seminar, etc.)
- Admin approval flow before publishing
- Student registration with capacity limits
- Participant management & cancellation
- Auto room blocking via linked booking
- Status: Pending / Upcoming / Ongoing / Completed

### Additional Features
- 🔔 In-app notifications (approval, rejection, registration)
- 🔍 Search & filter rooms/events
- 📊 Admin analytics dashboard (top rooms, booking stats)
- ⚠️ Conflict detection for overlapping bookings/events
- 📱 Responsive UI

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login

### Rooms
- `GET /api/rooms` — List rooms (with filters)
- `POST /api/rooms` — Add room (admin)
- `PUT /api/rooms/:id` — Update room (admin)
- `DELETE /api/rooms/:id` — Delete room (admin)

### Bookings
- `GET /api/bookings` — List bookings
- `POST /api/bookings` — Create booking
- `PUT /api/bookings/:id/status` — Approve/Reject (admin)
- `DELETE /api/bookings/:id` — Delete booking

### Events
- `GET /api/events` — List events
- `POST /api/events` — Create event
- `PUT /api/events/:id/status` — Approve/Reject (admin)
- `DELETE /api/events/:id` — Delete event

### Registrations
- `GET /api/registrations/my` — My registrations
- `GET /api/registrations/event/:id` — Event participants
- `POST /api/registrations` — Register for event
- `PUT /api/registrations/:id/cancel` — Cancel registration

### Notifications
- `GET /api/notifications` — Get notifications
- `PUT /api/notifications/read-all` — Mark all read

### Analytics (Admin only)
- `GET /api/analytics` — Dashboard stats

## Database Schema
- **Users:** id, name, email, password, role
- **Rooms:** id, room_name, type, capacity, availability, facilities
- **Bookings:** id, user_id, room_id, date, start_time, end_time, purpose, status
- **Events:** id, created_by, name, description, date, start_time, end_time, room_id, max_participants, category, status, booking_id
- **Registrations:** id, event_id, user_id, status
- **Notifications:** id, user_id, message, type, read
