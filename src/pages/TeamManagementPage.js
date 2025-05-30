import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { tournamentService, teamService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TeamManagementPage = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'all-tournaments-teams',
    () => tournamentService.getAllTournaments(),
    {
      staleTime: 30000,
      onSuccess: (data) => {
        if (!selectedTournament && data?.data?.length > 0) {
          setSelectedTournament(data.data[0]);
        }
      }
    }
  );

  // Fetch teams for selected tournament
  const { data: teamsData, isLoading: teamsLoading, refetch: refetchTeams } = useQuery(
    ['tournament-teams', selectedTournament?.id],
    () => teamService.getTeamsByTournament(selectedTournament.id),
    {
      enabled: !!selectedTournament?.id,
      staleTime: 10000,
      onSuccess: (data) => {
        console.log('👥 [TeamManagement] Teams data:', data);
      }
    }
  );

  // Approve team mutation
  const approveTeamMutation = useMutation(
    (teamId) => teamService.approveTeam(teamId),
    {
      onSuccess: () => {
        toast.success('Phê duyệt đội thành công!');
        queryClient.invalidateQueries(['tournament-teams', selectedTournament?.id]);
      },
      onError: (error) => {
        console.error('Failed to approve team:', error);
        toast.error(error.response?.data?.message || 'Không thể phê duyệt đội');
      }
    }
  );

  // Reject team mutation
  const rejectTeamMutation = useMutation(
    (teamId) => teamService.rejectTeam(teamId),
    {
      onSuccess: () => {
        toast.success('Từ chối đội thành công!');
        queryClient.invalidateQueries(['tournament-teams', selectedTournament?.id]);
      },
      onError: (error) => {
        console.error('Failed to reject team:', error);
        toast.error(error.response?.data?.message || 'Không thể từ chối đội');
      }
    }
  );

  // Update team status mutation
  const updateStatusMutation = useMutation(
    ({ teamId, status }) => teamService.updateTeamStatus(teamId, status),
    {
      onSuccess: () => {
        toast.success('Cập nhật trạng thái đội thành công!');
        queryClient.invalidateQueries(['tournament-teams', selectedTournament?.id]);
      },
      onError: (error) => {
        console.error('Failed to update team status:', error);
        toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
      }
    }
  );

  // Extract teams data
  let teams = [];
  try {
    if (Array.isArray(teamsData?.data)) {
      teams = teamsData.data;
    } else if (Array.isArray(teamsData)) {
      teams = teamsData;
    }
  } catch (err) {
    console.error('Error extracting teams data:', err);
  }

  // Filter teams
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captain?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captain?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
                         team.registrationStatus === statusFilter ||
                         team.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApproveTeam = (teamId) => {
    approveTeamMutation.mutate(teamId);
  };

  const handleRejectTeam = (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối đội này?')) {
      rejectTeamMutation.mutate(teamId);
    }
  };

  const handleUpdateStatus = (teamId, status) => {
    updateStatusMutation.mutate({ teamId, status });
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (tournamentsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Đang tải giải đấu...</span>
      </div>
    );
  }

  const tournamentList = tournaments?.data || [];
  const pendingTeams = teams.filter(t => t.registrationStatus === 'PENDING').length;
  const approvedTeams = teams.filter(t => t.registrationStatus === 'APPROVED').length;
  const rejectedTeams = teams.filter(t => t.registrationStatus === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý Đội</h1>
            <p className="text-green-100">4/4 đội - Phê duyệt và quản lý các đội tham gia</p>
          </div>
        </div>
      </div>

      {/* Tournament Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn Giải đấu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournamentList.map((tournament) => (
            <div
              key={tournament.id}
              onClick={() => setSelectedTournament(tournament)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedTournament?.id === tournament.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{tournament.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{tournament.sportType}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{tournament.currentTeams || 0}/{tournament.maxTeams} đội</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(tournament.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tournament.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                  tournament.status === 'REGISTRATION' ? 'bg-blue-100 text-blue-800' :
                  tournament.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tournament.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Management */}
      {selectedTournament && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-medium">Tổng đội</div>
                  <div className="text-xl font-bold text-blue-900">{teams.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-yellow-600 font-medium">Chờ duyệt</div>
                  <div className="text-xl font-bold text-yellow-900">{pendingTeams}</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-green-600 font-medium">Đã duyệt</div>
                  <div className="text-xl font-bold text-green-900">{approvedTeams}</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-red-600 font-medium">Từ chối</div>
                  <div className="text-xl font-bold text-red-900">{rejectedTeams}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTournament.name} - Danh sách đội
                </h3>
                <p className="text-gray-600">Quản lý và phê duyệt các đội tham gia</p>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đội, đội trưởng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="ACTIVE">Hoạt động</option>
                  </select>
                </div>

                <button
                  onClick={() => refetchTeams()}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>

          {/* Teams List */}
          <div className="card">
            {teamsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Đang tải danh sách đội...</span>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Không có đội nào</h4>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'Không tìm thấy đội phù hợp với bộ lọc.'
                    : 'Chưa có đội nào đăng ký tham gia giải đấu này.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đội
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đội trưởng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đăng ký
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {team.logoUrl ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={team.logoUrl} 
                                  alt={team.name} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{team.name}</div>
                              <div className="text-sm text-gray-500">{team.teamColor}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{team.captain?.name}</div>
                          <div className="text-sm text-gray-500">{team.captain?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{team.memberCount} người</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(team.registrationStatus || team.status)}`}>
                            {getStatusIcon(team.registrationStatus || team.status)}
                            <span>
                              {team.registrationStatus === 'APPROVED' ? 'Đã duyệt' :
                               team.registrationStatus === 'PENDING' ? 'Chờ duyệt' :
                               team.registrationStatus === 'REJECTED' ? 'Từ chối' :
                               team.status === 'ACTIVE' ? 'Hoạt động' : 
                               team.registrationStatus || team.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.registrationDate 
                            ? new Date(team.registrationDate).toLocaleDateString('vi-VN')
                            : new Date(team.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewTeam(team)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {team.registrationStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApproveTeam(team.id)}
                                  disabled={approveTeamMutation.isLoading}
                                  className="text-green-600 hover:text-green-900"
                                  title="Phê duyệt"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectTeam(team.id)}
                                  disabled={rejectTeamMutation.isLoading}
                                  className="text-red-600 hover:text-red-900"
                                  title="Từ chối"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            
                            {team.registrationStatus === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(team.id, 'ACTIVE')}
                                disabled={updateStatusMutation.isLoading}
                                className="text-blue-600 hover:text-blue-900"
                                title="Kích hoạt"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {showTeamModal && selectedTeam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết đội</h3>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Team Info */}
                <div className="flex items-start space-x-4">
                  {selectedTeam.logoUrl ? (
                    <img 
                      className="h-16 w-16 rounded-full object-cover" 
                      src={selectedTeam.logoUrl} 
                      alt={selectedTeam.name} 
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h4>
                    <p className="text-gray-600">{selectedTeam.teamColor}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTeam.registrationStatus || selectedTeam.status)}`}>
                        {getStatusIcon(selectedTeam.registrationStatus || selectedTeam.status)}
                        <span>
                          {selectedTeam.registrationStatus === 'APPROVED' ? 'Đã duyệt' :
                           selectedTeam.registrationStatus === 'PENDING' ? 'Chờ duyệt' :
                           selectedTeam.registrationStatus === 'REJECTED' ? 'Từ chối' :
                           selectedTeam.status === 'ACTIVE' ? 'Hoạt động' : 
                           selectedTeam.registrationStatus || selectedTeam.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Thông tin đội</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Số thành viên:</span>
                        <span className="font-medium">{selectedTeam.memberCount} người</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Ngày đăng ký:</span>
                        <span className="font-medium">
                          {selectedTeam.registrationDate 
                            ? new Date(selectedTeam.registrationDate).toLocaleDateString('vi-VN')
                            : new Date(selectedTeam.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Giải đấu:</span>
                        <span className="font-medium">{selectedTournament.name}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Thông tin đội trưởng</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Tên:</span>
                        <span className="font-medium">{selectedTeam.captain?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedTeam.captain?.email}</span>
                      </div>
                      {selectedTeam.contactInfo && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Liên hệ:</span>
                          <span className="font-medium">{selectedTeam.contactInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedTeam.registrationStatus === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        handleApproveTeam(selectedTeam.id);
                        setShowTeamModal(false);
                      }}
                      disabled={approveTeamMutation.isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Phê duyệt</span>
                    </button>
                    <button
                      onClick={() => {
                        handleRejectTeam(selectedTeam.id);
                        setShowTeamModal(false);
                      }}
                      disabled={rejectTeamMutation.isLoading}
                      className="btn-secondary flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;