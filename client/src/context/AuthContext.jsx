import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios base URL - assume proxy or CORS set
  // For dev, if proxy not set, use full URL.
  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);

          // Optional: Verify token valid with backend?
          // For now, just trust sessionStorage + backend 401 checks
        }
      } catch (error) {
        console.error("Auth Check Error", error);
        sessionStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('userInfo');
    setUser(null);
  };

  const loginOrganizer = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/organizer/login`, { email, password });
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const registerOrganizer = async (organizerData) => {
    try {
      const { data } = await axios.post(`${API_URL}/organizer/register`, organizerData);
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginOrganizer, registerOrganizer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
