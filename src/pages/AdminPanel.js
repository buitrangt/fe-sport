import React, { useState, Suspense, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Users,
  Trophy,
  Calendar,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield, 
  Crown,
  AlertTriangle,
  BarChart3,
  Bug,
  Home,
  Bell, 
  User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tournamentService, newsService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const UserManagement = React.lazy(() => import('../components/admin/UserManagement'));
const TournamentManagement = React.lazy(() => import('../components/admin/TournamentManagement'));
const AdminTournamentDashboard = React.lazy(() => import('../components/admin/AdminTournamentDashboard'));
const MatchManagement = React.lazy(() => import('../components/admin/MatchManagement'));
const NewsManagement = React.lazy(() => import('../components/admin/NewsManagement'));
// const NewsDebugPanel = React.lazy(() => import('../components/debug/NewsDebugPanel'));

const AdminPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';

  const allTabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      component: AdminTournamentDashboard,
      roles: ['ADMIN']
    },
    {
      id: 'tournaments',
      name: 'Quản lý giải đấu',
      icon: Trophy,
      component: TournamentManagement,
      roles: ['ADMIN', 'ORGANIZER']
    },
    {
      id: 'users',
      name: 'Quản lý tài khoản', 
      icon: Users,
      component: UserManagement,
      roles: ['ADMIN']
    },
    // {
    //     id: 'teams',
    //     name: 'Quản lý đội',
    //     icon: Users, 
    //     component: () => <div>Chức năng Quản lý đội sẽ ở đây.</div>, 
    //     roles: ['ADMIN', 'ORGANIZER']
    // },
 
    {
        id: 'news',
        name: 'Quản Lý Tin Tức', 
        icon: FileText,
        component: NewsManagement,
        roles: ['ADMIN', 'ORGANIZER']
    },
  ];

  const accessibleTabs = allTabs.filter(tab => tab.roles.includes(user?.role));

  const defaultTab = isAdmin ? 'dashboard' : 'tournaments';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!accessibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [user?.role, accessibleTabs, defaultTab, activeTab]);

  // const { data: adminStats, isLoading: statsLoading } = useQuery(
  //   'admin-stats',
  //   async () => {
  //     return {
  //       totalUsers: 15,
  //       totalTournaments: 10,
  //       activeMatches: 9,
  //       publishedNews: 12,
  //       pendingApprovals: 8,
  //       systemHealth: 99.2
  //     };
  //   },
  //   { staleTime: 5 * 60 * 1000 }
  // );

  if (!isAdmin && !isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const CurrentTabComponent = accessibleTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Top Header (Màu đỏ/xanh) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 bg-gradient-to-r from-red-700 to-blue-700 text-white shadow-lg">
        <div className="flex items-center ml-4">
          {/* Logo hoặc Tên hệ thống */}
          <a href="/" className="flex items-center text-white no-underline"> {/* Thêm thẻ <a> ở đây */}
            <Shield className="h-8 w-8 mr-3 text-white" />
            <span className="text-xl font-bold">Hệ thống quản lý giải đấu</span>
          </a>
        </div>
        <div className="flex items-center space-x-6 mr-6">
          <nav className="flex space-x-6">
          </nav>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="font-medium">{user?.name || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-800 text-white p-4 shadow-xl z-40">
        <div className="mb-6 mt-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Admin Menu</h2>
          <nav>
            <ul>
              {accessibleTabs.map((tab) => (
                <li key={tab.id} className="mb-2">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-400">
            <div className="flex space-x-2 mt-2">
                <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                    <img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" alt="Google Play" className="h-7" />
                </a>
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-7" />
                </a>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 mt-16 p-8 bg-gray-50 overflow-auto"> {/* Adjust ml-64 and mt-16 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{accessibleTabs.find(tab => tab.id === activeTab)?.name}</h1>
          {/* {activeTab === 'tournaments' && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Thêm mới
            </button>
          )} */}
        </div>

        {/* {isAdmin && activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats && [
              {
                name: 'Tổng số người dùng',
                value: adminStats?.totalUsers || 0,
                icon: Users,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
              },
              {
                name: 'Tổng số giải đấu',
                value: adminStats?.totalTournaments || 0,
                icon: Trophy,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100',
              },
              {
                name: 'Tổng số đội',
                value: adminStats?.activeMatches || 0,
                icon: Calendar,
                color: 'text-green-600',
                bgColor: 'bg-green-100',
              },
              {
                name: 'Tin tức đã xuất bản',
                value: adminStats?.publishedNews || 0,
                icon: FileText,
                color: 'text-purple-600',
                bgColor: 'bg-purple-100',
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Suspense fallback={<LoadingSpinner text="Đang tải module quản trị..." />}>
            {CurrentTabComponent && <CurrentTabComponent />}
          </Suspense>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tình trạng hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Trạng thái API</p>
                <p className="text-sm text-gray-600">Tất cả hệ thống đang hoạt động</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Cơ sở dữ liệu</p>
                <p className="text-sm text-gray-600">Thời gian phản hồi: 23ms</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Tác vụ nền</p>
                <p className="text-sm text-gray-600">2 tác vụ đang chờ xử lý</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;