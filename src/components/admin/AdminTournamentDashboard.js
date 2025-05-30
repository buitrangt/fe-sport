import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Play,
  CheckCircle,
  Clock, // Giữ lại cho Clock icon
  TrendingUp,
  AlertTriangle,
  Plus,
  RefreshCw,
  Eye,
  ArrowRight, // Icon cho nút "View All"
  Timer, // Thay thế ClockCountdown
  List // Thay thế ListDashed (nếu có sử dụng)
} from 'lucide-react'; // Đảm bảo tất cả icon được import đều có trong thư viện

import { tournamentService } from '../../services';
import { formatDate, getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../LoadingSpinner';

const AdminTournamentDashboard = () => {
  // Không cần useQueryClient và useMutation nếu không có chức năng xóa trực tiếp ở đây
  // const queryClient = useQueryClient();
  // const deleteTournamentMutation = useMutation(...);

  // Không cần state cho search/filter nếu không có bảng All Tournaments
  // const [searchQuery, setSearchQuery] = useState('');
  // const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tournaments data
  const { data: tournaments, isLoading: tournamentsLoading, refetch: refetchTournaments } = useQuery(
    ['admin-tournaments-dashboard'],
    () => tournamentService.getAllTournaments(),
    { staleTime: 5 * 60 * 1000 }
  );

  // Safe extraction of tournaments data
  let tournamentsList = [];
  try {
    if (Array.isArray(tournaments?.data)) {
      tournamentsList = tournaments.data;
    } else if (Array.isArray(tournaments?.data?.tournaments)) {
      tournamentsList = tournaments.data.tournaments;
    } else if (Array.isArray(tournaments)) {
      tournamentsList = tournaments;
    } else {
      console.log('⚠️ [AdminTournamentDashboard] Unexpected tournaments data structure:', tournaments);
      tournamentsList = [];
    }
  } catch (err) {
    console.error('🚨 [AdminTournamentDashboard] Error processing tournaments data:', err);
    tournamentsList = [];
  }

  // Calculate dashboard statistics with safe operations
  const stats = {
    total: Array.isArray(tournamentsList) ? tournamentsList.length : 0,
    ongoing: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'ONGOING').length : 0,
    registration: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'REGISTRATION').length : 0,
    ready: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'READY').length : 0,
    completed: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'COMPLETED').length : 0,
    totalTeams: Array.isArray(tournamentsList) ? tournamentsList.reduce((acc, t) => acc + (t?.currentTeams || 0), 0) : 0,
    avgTeamsPerTournament: Array.isArray(tournamentsList) && tournamentsList.length > 0 ?
      Math.round(tournamentsList.reduce((acc, t) => acc + (t?.currentTeams || 0), 0) / tournamentsList.length) : 0,
  };

  // Filter for specific sections
  const ongoingTournaments = tournamentsList
    .filter(t => t?.status === 'ONGOING')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sắp xếp để hiển thị giải đấu đang diễn ra sớm nhất
    .slice(0, 3); // Hiển thị 3 giải đấu đang diễn ra gần nhất

  const upcomingTournaments = tournamentsList
    .filter(t => t?.status === 'REGISTRATION' || t?.status === 'READY')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sắp xếp để hiển thị giải đấu sắp tới sớm nhất
    .slice(0, 3); // Hiển thị 3 giải đấu sắp tới gần nhất

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONGOING':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REGISTRATION':
        return <Users className="h-4 w-4 text-orange-600" />;
      case 'READY':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (tournamentsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner min-h-[calc(100vh-160px)]">
      <div className="max-w-full mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
            <p className="text-gray-600 mt-1">Thông tin tổng quan và hoạt động chính</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => refetchTournaments()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Làm mới</span>
            </button> */}

            {/* Nút tạo giải đấu mới */}
            {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Giải đấu mới</span>
            </button> */}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng giải đấu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ongoing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sắp tới</p>
                <p className="text-2xl font-bold text-gray-900">{stats.registration + stats.ready}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số đội</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tournament Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
              Tình trạng giải đấu
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Đang diễn ra</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.ongoing}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Đăng ký</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.registration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Đã hoàn thành</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Sẵn sàng</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.ready}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Hoạt động gần đây
            </h3>
            <div className="space-y-3">
              {Array.isArray(tournamentsList) && tournamentsList.length > 0 ? (
                // Sắp xếp theo ngày tạo hoặc ngày bắt đầu gần nhất
                [...tournamentsList].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate)).slice(0, 5).map((tournament) => (
                  <div key={tournament.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(tournament.status).split(' ')[0].replace('text-', 'bg-')}`}></div> {/* Lấy màu nền từ trạng thái */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tournament.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(tournament.createdAt || tournament.startDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Không có hoạt động gần đây.
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Hiệu suất
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Trung bình đội/giải đấu</span>
                  <span className="text-sm font-medium text-gray-900">{stats.avgTeamsPerTournament}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ đang hoạt động</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.total > 0 ? Math.round((stats.ongoing / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Các phần mới thay thế bảng "All Tournaments" */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ongoing Tournaments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Play className="h-5 w-5 mr-2 text-blue-600" />
                Giải đấu đang diễn ra
              </h3>
              {/* <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center group">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </button> */}
            </div>
            <div className="p-6 space-y-4">
              {ongoingTournaments.length > 0 ? (
                ongoingTournaments.map((tournament) => (
                  <div key={tournament.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor(tournament.status).split(' ')[0].replace('text-', 'bg-')}`}>
                       {getStatusIcon(tournament.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900">{tournament.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(tournament.startDate)} - {tournament.currentTeams || 0} đội</p>
                    </div>
                    {/* Bạn có thể thêm nút hành động cụ thể ở đây nếu cần */}
                    {/* <button title="View Details" className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                      <Eye className="h-5 w-5" />
                    </button> */}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Không có giải đấu nào đang diễn ra.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tournaments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Timer className="h-5 w-5 mr-2 text-orange-600" /> {/* Sử dụng icon Timer */}
                Giải đấu sắp tới
              </h3>
              {/* <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center group">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </button> */}
            </div>
            <div className="p-6 space-y-4">
              {upcomingTournaments.length > 0 ? (
                upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor(tournament.status).split(' ')[0].replace('text-', 'bg-')}`}>
                       {getStatusIcon(tournament.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900">{tournament.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(tournament.startDate)} - Đăng ký: {tournament.currentTeams || 0}/{tournament.maxTeams || 'N/A'}</p>
                    </div>
                    {/* Bạn có thể thêm nút hành động cụ thể ở đây nếu cần */}
                    {/* <button title="View Details" className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                      <Eye className="h-5 w-5" />
                    </button> */}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Không có giải đấu sắp tới.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTournamentDashboard;