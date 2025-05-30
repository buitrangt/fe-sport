import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services'; // Giả sử authService có phương thức googleLogin

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    console.log('Checking auth with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('No token found, setting loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      if (typeof token !== 'string' || token.length < 10) {
        console.log('❌ Invalid token format, removing');
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid token format' });
        return;
      }

      const response = await authService.getAccount();
      console.log('Account response:', response);
      
      let userData = null;
      
      if (response && response.success && response.data) {
        userData = response.data;
        console.log('✅ Wrapped format detected, user data:', userData);
      } else if (response && response.id && response.email) {
        userData = response;
        console.log('✅ Direct format detected, user data:', userData);
      } else {
        console.log('❌ Invalid response format:', response);
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid token response' });
        return;
      }
      
      if (!userData.id || !userData.email) {
        console.log('❌ Incomplete user data, removing token');
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Incomplete user data' });
        return;
      }
      
      console.log('✅ Auth check successful, user data:', userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData },
      });
    } catch (error) {
      console.log('❌ Auth check failed:', error);
      
      if (error.response?.status === 401 || 
          error.response?.status === 403 ||
          error.message?.includes('token') ||
          error.message?.includes('unauthorized')) {
        console.log('Authentication error, removing token');
        localStorage.removeItem('accessToken');
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || error.message }); // Sử dụng error.response?.data?.message nếu có
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false }); // Đảm bảo isLoading được đặt về false
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login(credentials);
      console.log('=== LOGIN RESPONSE DEBUG ===');
      console.log('Full response:', response);
      
      let accessToken, user;
      
      if (response?.data) { // Check if response.data exists first
        accessToken = response.data.accessToken || response.data.access_token;
        user = response.data.user;
      } else {
          accessToken = response.accessToken || response.access_token; // Direct access if no data wrapper
          user = response.user;
      }
      
      if (!accessToken) {
        console.error('❌ No access token found in response');
        console.error('Response structure:', JSON.stringify(response, null, 2));
        throw new Error('No access token received');
      }
      
      if (!user) {
        console.error('No user data found in response');
        throw new Error('No user data received');
      }
      
      console.log('✅ Storing token and user data...');
      localStorage.setItem('accessToken', accessToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user },
      });
      
      console.log('✅ Login successful, user authenticated');
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  // === THÊM HÀM loginWithGoogle NÀY VÀO ===
  const loginWithGoogle = async (accessTokenFromGoogle) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Gọi service để gửi access token của Google đến backend của bạn
      // Giả định authService.googleLogin có endpoint để xử lý
      const response = await authService.googleLogin(accessTokenFromGoogle); // <-- Cần tạo hàm này trong authService.js
      
      console.log('=== GOOGLE LOGIN RESPONSE DEBUG ===');
      console.log('Full response:', response);

      let accessToken, user;

      if (response?.data) {
        accessToken = response.data.accessToken || response.data.access_token;
        user = response.data.user;
      } else {
        accessToken = response.accessToken || response.access_token;
        user = response.user;
      }
      
      if (!accessToken) {
        console.error('❌ No access token (from your backend) found in Google login response');
        throw new Error('No access token received from backend after Google login');
      }
      
      if (!user) {
        console.error('No user data found in Google login response');
        throw new Error('No user data received from backend after Google login');
      }

      localStorage.setItem('accessToken', accessToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user },
      });
      
      console.log('✅ Google login successful, user authenticated');
      return response;

    } catch (error) {
      console.error('❌ Google login error:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };
  // === KẾT THÚC HÀM loginWithGoogle ===


  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.register(userData);
      console.log('✅ Registration successful:', response);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      const authKeys = ['token', 'auth', 'session', 'login'];
      Object.keys(localStorage).forEach(key => {
        if (authKeys.some(authKey => key.toLowerCase().includes(authKey))) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ Complete logout and localStorage cleanup');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    loginWithGoogle, // === ĐẢM BẢO THÊM NÓ VÀO ĐÂY ===
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};