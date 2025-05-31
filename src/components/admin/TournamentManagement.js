import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  MapPin,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { tournamentServiceFixed as tournamentService } from '../../services/tournamentServiceFixed';
import LoadingSpinner from '../LoadingSpinner';
import TournamentCreateForm from '../tournament/TournamentCreateForm';
import { 
  formatDate, 
  getStatusColor, 
  getSportTypeLabel,
  getTournamentStatusLabel 
} from '../../utils/helpers';
import { QUERY_KEYS } from '../../utils/constants';

const TournamentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();

  // Hệ thống thông báo an toàn
  const showNotification = (type, message) => {
    console.log(`${type.toUpperCase()}: ${message}`);
    const notification = { id: Date.now(), type, message };
    setNotifications(prev => [...prev, notification]);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
    
    // Đồng thời hiển thị cảnh báo gốc cho các tin nhắn quan trọng
    if (type === 'error') {
      alert(`❌ ${message}`);
    }
  };

  const { data: tournaments, isLoading, error } = useQuery(
    [QUERY_KEYS.TOURNAMENTS, { page, searchTerm, status: statusFilter }],
    () => tournamentService.getAllTournaments({
      page,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
    }),
    {
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      select: (response) => {
        // XỬ LÝ CÁC TRƯỜNG HỢP RESPONSE KHÁC NHAU
        
        // Trường hợp 1: Response theo format chuẩn từ backend
        if (response && response.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: response.pagination || {
              currentPage: response.page || page,
              totalPages: response.totalPages || 1,
              totalItems: response.total || response.data.length,
              hasNext: (response.page || page) < (response.totalPages || 1),
              hasPrev: (response.page || page) > 1
            }
          };
        }
        
        // Trường hợp 2: Response là array trực tiếp
        if (Array.isArray(response)) {
          return {
            data: response,
            pagination: {
              currentPage: page,
              totalPages: 1,
              totalItems: response.length,
              hasNext: false,
              hasPrev: false
            }
          };
        }
        
        // Trường hợp 3: Response có format khác (success wrapper)
        if (response && response.success && response.data) {
          if (Array.isArray(response.data)) {
            return {
              data: response.data,
              pagination: {
                currentPage: page,
                totalPages: 1,
                totalItems: response.data.length,
                hasNext: false,
                hasPrev: false
              }
            };
          }
        }
        
        // Trường hợp 4: Fallback - empty state
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
    }
  );

  const deleteTournamentMutation = useMutation(
    (tournamentId) => tournamentService.deleteTournament(tournamentId),
    {
      onSuccess: () => {
        showNotification('success', 'Xóa giải đấu thành công');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
      },
      onError: (error) => {
        showNotification('error', error.response?.data?.message || 'Không thể xóa giải đấu');
      }
    }
  );

  const startTournamentMutation = useMutation(
    (tournamentId) => tournamentService.startTournament(tournamentId),
    {
      onSuccess: () => {
        showNotification('success', 'Bắt đầu giải đấu thành công');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
      },
      onError: (error) => {
        showNotification('error', error.response?.data?.message || 'Không thể bắt đầu giải đấu');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDeleteTournament = (tournamentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giải đấu này? Hành động này không thể hoàn tác.')) {
      deleteTournamentMutation.mutate(tournamentId);
    }
  };

  const handleStartTournament = (tournamentId) => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu giải đấu này?')) {
      startTournamentMutation.mutate(tournamentId);
    }
  };

  const handleCreateSuccess = (newTournament) => {
    queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
  };

  const getStatusAction = (tournament) => {
    switch (tournament.status) {
      case 'REGISTRATION':
      case 'REGISTRATION_OPEN':
        return (
          <button
            onClick={() => handleStartTournament(tournament.id)}
            className="text-gray-600 hover:text-green-600 transition-colors"
            title="Bắt đầu giải đấu"
            disabled={startTournamentMutation.isLoading}
          >
            <Play className="h-4 w-4" />
          </button>
        );
      case 'ONGOING':
      case 'IN_PROGRESS':
        return (
          <button
            className="text-gray-600 hover:text-yellow-600 transition-colors"
            title="Tạm dừng giải đấu"
          >
            <Pause className="h-4 w-4" />
          </button>
        );
      default:
        return null;
    }
  };

  // Render trạng thái lỗi
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">Lỗi khi tải giải đấu: {error.message}</p>
        <button 
          onClick={() => queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS)}
          className="btn-primary"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // KIỂM TRA DỮ LIỆU TRƯỚC KHI RENDER
  const tournamentData = tournaments?.data || [];
  const pagination = tournaments?.pagination || {
    currentPage: page,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  };

  return (
    <div className="space-y-6">
      {/* Thông báo */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-md shadow-lg ${
                notification.type === 'success'
                  ? 'bg-green-100 border border-green-200 text-green-800'
                  : 'bg-red-100 border border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {notification.type === 'success' ? '✓' : '❌'} {notification.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý giải đấu</h2>
          <p className="text-gray-600">Tạo và quản lý các giải đấu, lịch trình và kết quả</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {pagination.totalItems} Giải đấu
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo giải đấu
          </button>
        </div>
      </div>

      {/* Tìm kiếm và Bộ lọc */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm giải đấu theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="REGISTRATION_OPEN">Mở đăng ký</option>
              <option value="REGISTRATION_CLOSED">Đóng đăng ký</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>

            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Áp dụng
            </button>
          </div>
        </form>
      </div>

      {/* Bảng các giải đấu */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : !Array.isArray(tournamentData) ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Lỗi định dạng dữ liệu: dữ liệu giải đấu không phải là một mảng</p>
            <p className="text-sm text-gray-500">Dự kiến: Mảng, Đã nhận: {typeof tournamentData}</p>
          </div>
        ) : tournamentData.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy giải đấu nào</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo giải đấu đầu tiên của bạn
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giải đấu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đội
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lịch trình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa điểm
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournamentData.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div 
                            onClick={() => window.location.href = `/admin/tournaments/${tournament.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors"
                          >
                            {tournament.name}
                          </div>
                          <div className="text-sm text-gray-500">{getSportTypeLabel(tournament.sportType) || 'Tổng hợp'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {getTournamentStatusLabel(tournament.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{tournament.currentTeams || 0}/{tournament.maxTeams}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(tournament.startDate)}</span>
                        </div>
                        {tournament.endDate && (
                          <div className="text-xs text-gray-500">
                            Đến {formatDate(tournament.endDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-24" title={tournament.location}>
                          {tournament.location || 'Chưa xác định'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/tournaments/${tournament.id}`, '_blank')}
                          className="text-gray-600 hover:text-primary-600 transition-colors"
                          title="Xem giải đấu"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {getStatusAction(tournament)}
                        <button
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Xóa giải đấu"
                          disabled={deleteTournamentMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị trang {pagination.currentPage} trên {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Biểu mẫu tạo giải đấu */}
      <TournamentCreateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TournamentManagement;