import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, PlusCircle, LogOut, Home, Bell, X, Check, Users, MessageSquare, Settings, Tag } from 'lucide-react';

const OrganizerLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
      if (!token) return;
      const { data } = await axios.get('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('userInfo')).token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Dashboard', path: '/organizer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Events', path: '/organizer/events', icon: <Calendar size={20} /> },
    { name: 'Create Event', path: '/organizer/create-event', icon: <PlusCircle size={20} /> },
    { name: 'Registrations', path: '/organizer/registrations', icon: <Users size={20} /> },
    { name: 'Promotions', path: '/organizer/coupons', icon: <Tag size={20} /> },
    { name: 'Reviews', path: '/organizer/reviews', icon: <MessageSquare size={20} /> },
    { name: 'Settings', path: '/organizer/profile', icon: <Settings size={20} /> },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold tracking-tight text-white">CityPulse <span className="text-sm font-normal text-slate-400">Org</span></h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 text-slate-300 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'O'
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 sticky top-0 z-20 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname.split('/').pop().replace('-', ' ')}
          </h2>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-blue-600 transition relative"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-700">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition ${n.read ? 'opacity-60' : 'bg-blue-50/50'}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-800 mb-1">{n.message}</p>
                          {!n.read && (
                            <button onClick={() => markAsRead(n._id)} className="text-blue-600 hover:text-blue-800" title="Mark as read">
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
