import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Trophy, User, LogOut, Settings, BarChart3 } from 'lucide-react';
// import toast from 'react-hot-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      console.log('✅ Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  return (
    <header className="bg-gradient-to-r from-red-700 to-blue-700 shadow-lg border-b border-red-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduSports</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white/90 hover:text-white transition-colors font-medium hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Trang chủ
            </Link>
            <Link 
              to="/tournaments" 
              className="text-white/90 hover:text-white transition-colors font-medium hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Giải đấu
            </Link>
            <Link 
              to="/news" 
              className="text-white/90 hover:text-white transition-colors font-medium hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              Tin tức
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-300 border border-white/30"
                >
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white">
                    {user?.name || user?.email}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Trophy className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white/90 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-white/90 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link 
                to="/tournaments" 
                className="text-white/90 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Giải đấu
              </Link>
              <Link 
                to="/news" 
                className="text-white/90 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tin tức
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;