import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Crown,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { teamService } from '../../services';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TeamRegistrationManager = ({ tournament, teams = [], onTeamsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const queryClient = useQueryClient();

  const approveTeamMutation = useMutation(
    (teamId) => teamService.approveTeamRegistration(teamId),
    {
      onSuccess: () => {
        toast.success('Đội đã được duyệt thành công');
        onTeamsUpdated?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Không thể duyệt đội');
      }
    }
  );

  const rejectTeamMutation = useMutation(
    (teamId) => teamService.rejectTeamRegistration(teamId),
    {
      onSuccess: () => {
        toast.success('Đội đã bị từ chối thành công');
        onTeamsUpdated?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Không thể từ chối đội');
      }
    }
  );

  const deleteTeamMutation = useMutation(
    (teamId) => teamService.deleteTeam(teamId),
    {
      onSuccess: () => {
        toast.success('Đội đã được xóa thành công');
        onTeamsUpdated?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Không thể xóa đội');
      }
    }
  );

  const handleApproveTeam = (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt đội này không?')) {
      approveTeamMutation.mutate(teamId);
    }
  };

  const handleRejectTeam = (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối đội này không? Hành động này không thể hoàn tác.')) {
      rejectTeamMutation.mutate(teamId);
    }
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội này khỏi giải đấu không?')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const handleViewTeamDetails = (team) => {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captain?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: teams.length,
    approved: teams.filter(t => t.status === 'APPROVED').length,
    pending: teams.filter(t => t.status === 'PENDING').length,
    rejected: teams.filter(t => t.status === 'REJECTED').length
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng số đội</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Đang chờ</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-600">Đã từ chối</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm đội theo tên hoặc đội trưởng..."
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
              <option value="PENDING">Đang chờ</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đội nào</h3>
            <p className="text-gray-600">
              {teams.length === 0 
                ? 'Chưa có đội nào đăng ký giải đấu này.'
                : 'Không có đội nào khớp với tiêu chí tìm kiếm của bạn.'
              }
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
                    Đăng ký
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
                        <div 
                          className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: team.teamColor || '#6B7280' }}
                        >
                          {team.name?.charAt(0)?.toUpperCase() || 'Đ'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">{team.description || 'Không có mô tả'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.captain?.name || 'Không có đội trưởng'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {team.captain?.email || 'Không có email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{team.memberCount || team.members?.length || 0} thành viên</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(team.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                          {team.status === 'APPROVED' && 'Đã duyệt'}
                          {team.status === 'REJECTED' && 'Đã từ chối'}
                          {team.status === 'PENDING' && 'Đang chờ'}
                          {!team.status && 'Không xác định'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(team.createdAt || team.registeredAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewTeamDetails(team)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {team.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveTeam(team.id)}
                              className="text-gray-600 hover:text-green-600 transition-colors"
                              title="Duyệt đội"
                              disabled={approveTeamMutation.isLoading}
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectTeam(team.id)}
                              className="text-gray-600 hover:text-red-600 transition-colors"
                              title="Từ chối đội"
                              disabled={rejectTeamMutation.isLoading}
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {team.status === 'APPROVED' && tournament.status === 'REGISTRATION' && (
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Xóa đội"
                            disabled={deleteTeamMutation.isLoading}
                          >
                            <UserX className="h-4 w-4" />
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

      {/* Team Details Modal */}
      {showTeamDetails && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: selectedTeam.teamColor || '#6B7280' }}
                >
                  {selectedTeam.name?.charAt(0)?.toUpperCase() || 'Đ'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedTeam.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTeam.status)}`}>
                      {selectedTeam.status === 'APPROVED' && 'Đã duyệt'}
                      {selectedTeam.status === 'REJECTED' && 'Đã từ chối'}
                      {selectedTeam.status === 'PENDING' && 'Đang chờ'}
                      {!selectedTeam.status && 'Không xác định'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTeamDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Team Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin đội</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tên đội</label>
                      <p className="text-gray-900">{selectedTeam.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số lượng thành viên</label>
                      <p className="text-gray-900">{selectedTeam.memberCount || selectedTeam.members?.length || 0}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Mô tả</label>
                      <p className="text-gray-900">{selectedTeam.description || 'Chưa có mô tả'}</p>
                    </div>
                  </div>
                </div>

                {/* Captain Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin đội trưởng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tên</label>
                      <p className="text-gray-900">{selectedTeam.captain?.name || 'Chưa có đội trưởng'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedTeam.captain?.email || 'Chưa có email'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Điện thoại</label>
                      <p className="text-gray-900">{selectedTeam.captain?.phone || 'Chưa có số điện thoại'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày đăng ký</label>
                      <p className="text-gray-900">{formatDate(selectedTeam.createdAt || selectedTeam.registeredAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                {selectedTeam.members && selectedTeam.members.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thành viên đội</h3>
                    <div className="space-y-2">
                      {selectedTeam.members.map((member, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Shield className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedTeam.status === 'PENDING' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleApproveTeam(selectedTeam.id);
                        setShowTeamDetails(false);
                      }}
                      className="btn-primary flex items-center space-x-2"
                      disabled={approveTeamMutation.isLoading}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Duyệt đội</span>
                    </button>
                    <button
                      onClick={() => {
                        handleRejectTeam(selectedTeam.id);
                        setShowTeamDetails(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      disabled={rejectTeamMutation.isLoading}
                    >
                      <UserX className="h-4 w-4" />
                      <span>Từ chối đội</span>
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

export default TeamRegistrationManager;