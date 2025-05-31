import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  MapPin,
  Users,
  Trophy,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { matchService, tournamentService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MatchManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Lấy các giải đấu để điền vào dropdown bộ lọc
  const { data: tournaments } = useQuery(
    'tournaments-for-filter',
    () => tournamentService.getAllTournaments({ page: 1, limit: 100 }),
    {
      select: (response) => response?.data || [],
      staleTime: 10 * 60 * 1000
    }
  );

  // Dữ liệu trận đấu giả định vì cần tổng hợp từ nhiều giải đấu
  const { data: matches, isLoading, error } = useQuery(
    ['admin-matches', { page, searchTerm, status: statusFilter, tournament: tournamentFilter }],
    async () => {
      // Phần này sẽ được thay thế bằng cuộc gọi API thực tế
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMatches = [
        {
          id: 1,
          tournament: { id: 1, name: 'Giải Vô Địch Mùa Xuân' },
          team1: { id: 1, name: 'Đội Alpha', teamColor: '#FF0000' },
          team2: { id: 2, name: 'Đội Beta', teamColor: '#0000FF' },
          roundNumber: 1,
          roundName: 'Tứ kết',
          matchDate: new Date('2025-06-01T15:00:00'),
          location: 'Sân vận động chính',
          status: 'SCHEDULED',
          team1Score: 0,
          team2Score: 0,
          referee: 'Trọng tài John'
        },
        {
          id: 2,
          tournament: { id: 1, name: 'Giải Vô Địch Mùa Xuân' },
          team1: { id: 3, name: 'Đội Gamma', teamColor: '#00FF00' },
          team2: { id: 4, name: 'Đội Delta', teamColor: '#FFFF00' },
          roundNumber: 1,
          roundName: 'Tứ kết',
          matchDate: new Date('2025-06-01T17:00:00'),
          location: 'Sân phụ',
          status: 'IN_PROGRESS',
          team1Score: 2,
          team2Score: 1,
          referee: 'Trọng tài Jane'
        },
        {
          id: 3,
          tournament: { id: 2, name: 'Giải Đấu Mùa Hè' },
          team1: { id: 5, name: 'Đội Echo', teamColor: '#FF00FF' },
          team2: { id: 6, name: 'Đội Foxtrot', teamColor: '#00FFFF' },
          roundNumber: 2,
          roundName: 'Bán kết',
          matchDate: new Date('2025-05-30T14:00:00'),
          location: 'Sân tập',
          status: 'COMPLETED',
          team1Score: 3,
          team2Score: 2,
          referee: 'Trọng tài Bob'
        }
      ];

      // Áp dụng các bộ lọc
      let filteredMatches = mockMatches;
      
      if (tournamentFilter) {
        filteredMatches = filteredMatches.filter(match => 
          match.tournament.id.toString() === tournamentFilter
        );
      }
      
      if (statusFilter) {
        filteredMatches = filteredMatches.filter(match => 
          match.status === statusFilter
        );
      }
      
      if (searchTerm) {
        filteredMatches = filteredMatches.filter(match => 
          match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.team2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return {
        data: filteredMatches,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredMatches.length / 10),
          totalItems: filteredMatches.length,
          hasNext: page < Math.ceil(filteredMatches.length / 10),
          hasPrev: page > 1
        }
      };
    },
    { 
      staleTime: 2 * 60 * 1000,
      keepPreviousData: true
    }
  );

  // Các mutation giả định
  const updateMatchMutation = useMutation(
    async ({ matchId, updateData }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Trận đấu đã cập nhật thành công');
        queryClient.invalidateQueries('admin-matches');
      },
      onError: () => {
        toast.error('Cập nhật trận đấu thất bại');
      }
    }
  );

  const deleteMatchMutation = useMutation(
    async (matchId) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Trận đấu đã xóa thành công');
        queryClient.invalidateQueries('admin-matches');
      },
      onError: () => {
        toast.error('Xóa trận đấu thất bại');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleUpdateStatus = (matchId, newStatus) => {
    updateMatchMutation.mutate({
      matchId,
      updateData: { status: newStatus }
    });
  };

  const handleDeleteMatch = (matchId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trận đấu này?')) {
      deleteMatchMutation.mutate(matchId);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'SCHEDULED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusActions = (match) => {
    switch (match.status) {
      case 'SCHEDULED':
        return (
          <button
            onClick={() => handleUpdateStatus(match.id, 'IN_PROGRESS')}
            className="text-gray-600 hover:text-green-600 transition-colors"
            title="Bắt đầu Trận đấu"
          >
            <Play className="h-4 w-4" />
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleUpdateStatus(match.id, 'COMPLETED')}
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title="Hoàn thành Trận đấu"
          >
            <CheckCircle className="h-4 w-4" />
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
        <p className="text-red-600">Lỗi khi tải các trận đấu. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Trận Đấu</h2>
          <p className="text-gray-600">Lên lịch các trận đấu, cập nhật tỉ số và quản lý kết quả trận đấu</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {matches?.pagination?.totalItems || 0} Trận Đấu
          </div>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Lên Lịch Trận Đấu
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
                placeholder="Tìm kiếm trận đấu theo đội hoặc giải đấu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">Tất cả Giải Đấu</option>
              {tournaments?.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">Tất cả Trạng Thái</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="IN_PROGRESS">Đang diễn ra</option>
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

      {/* Matches Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : matches?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy trận đấu nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trận Đấu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đội
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỉ Số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lịch Trình
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches?.data?.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {match.tournament.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {match.roundName} - Vòng {match.roundNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: match.team1.teamColor }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {match.team1.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">vs</div>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: match.team2.teamColor }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {match.team2.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {match.team1Score} - {match.team2Score}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(match.status)}
                        <span className={getStatusBadge(match.status)}>
                          {match.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(match.matchDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{match.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/matches/${match.id}`, '_blank')}
                          className="text-gray-600 hover:text-primary-600 transition-colors"
                          title="Xem Trận Đấu"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/admin/matches/${match.id}/edit`, '_blank')}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="Chỉnh Sửa Trận Đấu"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {getStatusActions(match)}
                        <button
                          onClick={() => handleDeleteMatch(match.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Xóa Trận Đấu"
                          disabled={deleteMatchMutation.isLoading}
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

        {/* Pagination */}
        {matches?.pagination?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị trang {matches.pagination.currentPage} trên {matches.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= matches.pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchManagement;