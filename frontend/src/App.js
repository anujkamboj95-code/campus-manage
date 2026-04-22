import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import MyRegistrations from './pages/MyRegistrations';
import Analytics from './pages/Analytics';

import Chatbot from './components/Chatbot';

const Layout = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 py-6">
      <Outlet />
    </main>
    <Chatbot />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/events" element={<Events />} />
            <Route path="/my-registrations" element={
              <ProtectedRoute roles={['student']}><MyRegistrations /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
