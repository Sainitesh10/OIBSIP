import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Target base URL for local Express backend
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize axios interceptor for JWT authorization
  useEffect(() => {
    const storedUser = localStorage.getItem('pizzaUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  // Login callback
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      setUser(data);
      localStorage.setItem('pizzaUser', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        notVerified: error.response?.data?.notVerified || false,
      };
    }
  };

  // Register callback
  const register = async (name, email, password, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Verify OTP callback
  const verifyEmail = async (email, otp) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify`, { email, otp });
      setUser(data);
      localStorage.setItem('pizzaUser', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
      };
    }
  };

  // Forgot password OTP mailer callback
  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Forgot password request failed',
      };
    }
  };

  // Reset password update callback
  const resetPassword = async (email, otp, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, password });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed',
      };
    }
  };

  // Logout callback
  const logout = () => {
    setUser(null);
    localStorage.removeItem('pizzaUser');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout,
        API_URL,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
