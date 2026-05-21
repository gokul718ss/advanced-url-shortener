/**
 * Authentication Context
 * Manages global authentication state and user session
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

// Auth State
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext(null);

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Initialize auth state from localStorage
   */
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    try {
      // Verify token is still valid
      const response = await authService.verifyToken();
      const { user } = response.data.data;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });
    } catch (error) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authService.register(userData);
      const { user, token } = response.data.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } });
      toast.success('Welcome! Your account has been created successfully.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authService.login(credentials);
      const { user, token } = response.data.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } });
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully. See you soon!');
  };

  /**
   * Update user data in context
   */
  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    const updated = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updated));
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
