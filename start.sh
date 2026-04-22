#!/bin/bash
echo "🚀 Starting Campus Resource & Event Management System..."

# Start backend
cd backend && npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 3

# Seed database
echo "🌱 Seeding database..."
npm run seed

# Start frontend
cd ../frontend && npm start &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Application running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Demo accounts:"
echo "   admin@campus.com / admin123"
echo "   teacher@campus.com / teacher123"
echo "   student@campus.com / student123"

wait
