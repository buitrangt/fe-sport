// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google'; // THÊM DÒNG NÀY

// Layout Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';

import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';

import TournamentManagement from './components/admin/TournamentManagement';
import AdminTournamentDetailPage from './components/admin/AdminTournamentDetailPage';

import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Debug log để kiểm tra vai trò
  console.log('🔒 [AdminRoute] User role:', user?.role);
  if (user?.role !== 'ADMIN' && user?.role !== 'ORGANIZER') {
    console.log('❌ [AdminRoute] User not authorized. Redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Simple debug logs
  console.log('🎨 [App] Render state:', {
    isLoading,
    isAuthenticated,
    userRole: user?.role,
    currentPath: window.location.pathname,
    timestamp: new Date().toLocaleTimeString()
  });

  if (isLoading) {
    console.log('⏳ [App] Showing loading spinner');
    return <LoadingSpinner />;
  }

  console.log('✅ [App] Rendering routes');

  return (
    <>
      {/* THÊM GOOGLEOAUTHPROVIDER Ở ĐÂY, BỌC QUANH ROUTES */}
      <GoogleOAuthProvider clientId="734958052700-6ogs88f5n1hgppod4ub0qndattk9un44.apps.googleusercontent.com">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="tournaments/:id" element={<TournamentDetailPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetailPage />} />

            {/* Các route cho trang tĩnh */}
            <Route path="help-center" element={<HelpCenter />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="about" element={<AboutUs />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout /> {/* Layout của admin */}
              </AdminRoute>
            }
          >
            <Route index element={<AdminPanel />} /> {/* Route gốc /admin */}
            <Route path="tournaments" element={<TournamentManagement />} /> {/* /admin/tournaments */}
            <Route path="tournaments/:id" element={<AdminTournamentDetailPage />} /> {/* /admin/tournaments/:id */}

          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GoogleOAuthProvider> {/* ĐÓNG GOOGLEOAUTHPROVIDER */}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 6000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;