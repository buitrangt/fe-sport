import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Award,
  BookOpen // New icon for News
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tournamentService, teamService } from '../services'; // teamService might not be needed if 'create team' is removed.
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';
import TeamCreateModal from '../components/team/TeamCreateModal'; // This component might not be needed if 'create team' is removed.

const DashboardPage = () => {
  const { user } = useAuth();
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false); // This state might not be needed if 'create team' is removed.

  // Fetch user's tournaments (if organizer/admin) or registered teams
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'user-tournaments',
    () => tournamentService.getAllTournaments({ page: 1, limit: 5 }),
    { 
      staleTime: 5 * 60 * 1000,
      select: (response) => {
        console.log('Dashboard Tournaments Response:', response);
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response?.data?.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        if (response?.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        return [];
      }
    }
  );

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery(
    'user-stats',
    async () => {
      // Get tournaments count
      const tournamentsResponse = await tournamentService.getAllTournaments({ page: 1, limit: 1 });
      const totalTournaments = tournamentsResponse?.pagination?.totalItems || 0;
      
      // Mock data for other stats (would be replaced with real API calls)
      return {
        totalTournaments,
        registeredTeams: 12, // Would come from user teams API
        matchesPlayed: 45,    // Would come from user matches API
        winRate: '78%'        // Would be calculated from match results
      };
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const isOrganizerOrAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const stats = [
    {
      name: 'Giải đấu đang diễn ra',
      value: userStats?.totalTournaments || 0,
      icon: Trophy,
      color: 'text-sports-orange',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Đội đã đăng ký',
      value: userStats?.registeredTeams || 0,
      icon: Users,
      color: 'text-sports-green',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Trận đấu đã chơi',
      value: userStats?.matchesPlayed || 0,
      icon: Calendar,
      color: 'text-sports-purple',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Tỷ lệ thắng',
      value: userStats?.winRate || '0%',
      icon: TrendingUp,
      color: 'text-sports-pink',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {user?.name || user?.email}!
          </h1>
          <p className="text-lg text-gray-600">
            Đây là những diễn biến mới nhất về các giải đấu và đội của bạn.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tournaments */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isOrganizerOrAdmin ? 'Giải đấu của bạn' : 'Giải đấu gần đây'}
              </h2>
              <div className="flex space-x-2">
                {isOrganizerOrAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tạo mới
                  </Link>
                )}
                <Link
                  to="/tournaments"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem tất cả
                </Link>
              </div>
            </div>

            {tournamentsLoading ? (
              <LoadingSpinner size="small" />
            ) : (tournaments || []).length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Không tìm thấy giải đấu nào</p>
                {isOrganizerOrAdmin && (
                  <Link
                    to="/admin"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo giải đấu đầu tiên của bạn
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(tournaments || []).slice(0, 5).map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-600 p-2 rounded-lg">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{tournament.name}</h3>
                        <p className="text-sm text-gray-500">
                          Bắt đầu: {formatDate(tournament.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                      </div>
                      <Link
                        to={`/tournaments/${tournament.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {isOrganizerOrAdmin && (
                        <Link
                          to={`/admin/tournaments/${tournament.id}/edit`}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full">
                  <Trophy className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Đã đăng ký Giải vô địch mùa xuân
                  </p>
                  <p className="text-xs text-gray-500">2 giờ trước</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Đội "Eagles" đã cập nhật danh sách
                  </p>
                  <p className="text-xs text-gray-500">1 ngày trước</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Đã thắng trận đấu với "Tigers"
                  </p>
                  <p className="text-xs text-gray-500">3 ngày trước</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Trận đấu tiếp theo đã được lên lịch
                  </p>
                  <p className="text-xs text-gray-500">1 tuần trước</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/dashboard/activity"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Xem tất cả hoạt động
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hành động nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/tournaments"
              className="card hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Duyệt giải đấu</h3>
              <p className="text-gray-600">Tìm và tham gia các giải đấu hấp dẫn</p>
            </Link>

            {isOrganizerOrAdmin ? (
              <Link
                to="/admin"
                className="card hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <Plus className="h-12 w-12 text-sports-green mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tạo giải đấu</h3>
                <p className="text-gray-600">Bắt đầu tổ chức giải đấu của riêng bạn</p>
              </Link>
            ) : (
              // Replaced "Create Team" with "View News"
              <Link
                to="/news" // Assuming a route for news exists
                className="card hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <BookOpen className="h-12 w-12 text-sports-green mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Xem tin tức</h3>
                <p className="text-gray-600">Luôn cập nhật những tin tức mới nhất</p>
              </Link>
            )}

            <Link
              to="/dashboard/profile"
              className="card hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <Edit className="h-12 w-12 text-sports-purple mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cập nhật hồ sơ</h3>
              <p className="text-gray-600">Quản lý cài đặt tài khoản của bạn</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Team Create Modal - This modal is no longer triggered directly from Quick Actions */}
      {/* You might want to remove this component and its state if 'create team' functionality is not needed elsewhere */}
      <TeamCreateModal
        isOpen={isTeamCreateModalOpen}
        onClose={() => setIsTeamCreateModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;