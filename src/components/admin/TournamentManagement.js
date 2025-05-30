import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  ChevronLeft, // Thêm icon cho phân trang
  ChevronRight // Thêm icon cho phân trang
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
import toast from 'react-hot-toast'; // Thay thế notification tự tạo bằng react-hot-toast

// Giả sử có một ảnh đại diện mặc định cho giải đấu
const DEFAULT_TOURNAMENT_IMAGE = 'https://via.placeholder.com/400x200?text=Giải+Đấu'; // Thay bằng ảnh thật của bạn

const TournamentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: tournaments, isLoading, error } = useQuery(
    [QUERY_KEYS.TOURNAMENTS, { page, searchTerm, status: statusFilter }],
    () => tournamentService.getAllTournaments({
      page,
      limit: 9, // Giảm limit để hiển thị 3x3 hoặc 4x3 trên một trang
      search: searchTerm,
      status: statusFilter,
    }),
    {
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      select: (response) => {
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
        toast.success('Xóa giải đấu thành công!');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa giải đấu thất bại!');
      }
    }
  );

  const startTournamentMutation = useMutation(
    (tournamentId) => tournamentService.startTournament(tournamentId),
    {
      onSuccess: () => {
        toast.success('Bắt đầu giải đấu thành công!');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Bắt đầu giải đấu thất bại!');
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
    toast.success('Tạo giải đấu thành công!');
  };

  const handleViewTournamentDetail = (tournamentId) => {
    // Chuyển hướng đến trang chi tiết giải đấu trong Admin Panel
    // Giả sử route là /admin/tournaments/:tournamentId
    window.location.href = `/admin/tournaments/${tournamentId}`;
    // Hoặc nếu bạn dùng react-router-dom:
    // history.push(`/admin/tournaments/${tournamentId}`);
  };

  const getStatusAction = (tournament) => {
    switch (tournament.status) {
      case 'REGISTRATION':
      case 'REGISTRATION_OPEN':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleStartTournament(tournament.id); }} // Ngăn chặn sự kiện click lan truyền lên card
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
            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan truyền lên card
            className="text-gray-600 hover:text-yellow-600 transition-colors"
            title="Tạm dừng giải đấu"
            disabled={true} // Chức năng tạm dừng thường không có hoặc phức tạp hơn
          >
            <Pause className="h-4 w-4" />
          </button>
        );
      default:
        return null;
    }
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Giải đấu</h2>
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
            Tạo giải đấu mới
          </button>
        </div>
      </div>

      {/* Search and Filters */}
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
              <option value="DRAFT">Bản nháp</option>
              <option value="REGISTRATION">Đăng ký</option>
              <option value="REGISTRATION_OPEN">Mở đăng ký</option>
              <option value="REGISTRATION_CLOSED">Đóng đăng ký</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="IN_PROGRESS">Đang tiến hành</option>
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

      {/* Tournaments Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Đang tải giải đấu..." />
          </div>
        ) : !Array.isArray(tournamentData) ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Lỗi định dạng dữ liệu: Dữ liệu giải đấu không phải là một mảng.</p>
            <p className="text-sm text-gray-500">Dự kiến: Mảng, Thực tế: {typeof tournamentData}</p>
          </div>
        ) : tournamentData.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy giải đấu nào.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo giải đấu đầu tiên của bạn
            </button>
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> {/* Đảm bảo Tailwind CSS được cấu hình cho các cột này */}            {tournamentData.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transform transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => handleViewTournamentDetail(tournament.id)} // Click vào cả card để xem chi tiết
              >
                {/* Ảnh đại diện giải đấu */}
                <img
                  src={tournament.image || DEFAULT_TOURNAMENT_IMAGE}
                  alt={tournament.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      {tournament.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {getTournamentStatusLabel(tournament.status)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-3">{getSportTypeLabel(tournament.sportType) || 'Tổng hợp'}</p>

                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Đội: {tournament.currentTeams || 0}/{tournament.maxTeams}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(tournament.startDate)}</span>
                    </div>
                    {tournament.endDate && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400 opacity-0" /> {/* Giữ khoảng cách */}
                        <span>Đến {formatDate(tournament.endDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate" title={tournament.location}>
                        {tournament.location || 'Chưa xác định'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 border-t pt-3 -mx-4 px-4 bg-gray-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`/tournaments/${tournament.id}`, '_blank'); }}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      title="Xem công khai"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`/admin/tournaments/${tournament.id}/edit`, '_blank'); }}
                      className="text-gray-600 hover:text-yellow-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {getStatusAction(tournament)}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTournament(tournament.id); }}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      title="Xóa giải đấu"
                      disabled={deleteTournamentMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {pagination.currentPage} của {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp theo
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        )}
      </div>

      {/* Tournament Create Form */}
      <TournamentCreateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TournamentManagement;