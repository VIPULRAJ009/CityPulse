import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import OrganizerLayout from './layouts/OrganizerLayout';
import UserLayout from './layouts/UserLayout';
import UserDashboardLayout from './layouts/UserDashboardLayout';

// Pages (Placeholders)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OrganizerLogin from './pages/auth/OrganizerLogin';
import OrganizerSignup from './pages/auth/OrganizerSignup';
import OrganizerHome from './pages/organizer/Home';
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import MyEvents from './pages/organizer/MyEvents';
import UserHome from './pages/user/Home';
import EventDetails from './pages/user/EventDetails';
import UserBookings from './pages/user/MyBookings';
import UserProfile from './pages/user/UserProfile';
import ContactUs from './pages/user/ContactUs';
import AboutUs from './pages/user/AboutUs';
import Reviews from './pages/user/Reviews';
import OrganizerRegistrations from './pages/organizer/Registrations';
import OrganizerAnalytics from './pages/organizer/Analytics';
import OrganizerReviews from './pages/organizer/Reviews';
import OrganizerCoupons from './pages/organizer/Coupons';
import OrganizerProfile from './pages/organizer/Profile';

// Protected Routes
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/" />; // Redirect unauthorized role
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/organizer/login" element={<OrganizerLogin />} />
      <Route path="/organizer/signup" element={<OrganizerSignup />} />

      {/* Organizer Module */}
      <Route path="/organizer" element={
        <ProtectedRoute role="organizer">
          <OrganizerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/organizer/dashboard" />} />
        <Route path="home" element={<Navigate to="/organizer/dashboard" />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<MyEvents />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="edit-event/:id" element={<EditEvent />} />
        <Route path="registrations" element={<OrganizerRegistrations />} />
        <Route path="analytics" element={<OrganizerAnalytics />} />
        <Route path="reviews" element={<OrganizerReviews />} />
        <Route path="coupons" element={<OrganizerCoupons />} />
        <Route path="profile" element={<OrganizerProfile />} />
      </Route>

      {/* User Module (Public + Protected) */}
      // User Module (Public + Protected)
      <Route path="/" element={<UserLayout />}>
        <Route index element={<UserHome />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>

      {/* User Dashboard Module */}
      <Route path="/user" element={
        <ProtectedRoute role="user">
          <UserDashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/user/tickets" />} />
        <Route path="tickets" element={<UserBookings />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Redirects/Legacy */}
      <Route path="/my-tickets" element={<Navigate to="/user/tickets" />} />

      {/* 404 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
