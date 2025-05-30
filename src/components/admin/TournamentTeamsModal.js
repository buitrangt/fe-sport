ư// src/components/admin/TournamentTeamsModal.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  X, Users, Edit, Trash2, Eye,
  AlertTriangle // Thêm AlertTriangle để hiển thị lỗi tải đội
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { tournamentServiceFixed as tournamentService } from '../../services/tournamentServiceFixed';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';
import TeamDetailModal from './TeamDetailModal'; // Đảm bảo đường dẫn đúng
import TeamEditForm from './TeamEditForm';     // <-- Import TeamEditForm mới

const TournamentTeamsModal = ({ tournamentId, tournamentName, onClose }) => {
  const queryClient = useQueryClient();
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [showTeamDetailModal, setShowTeamDetailModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Lấy danh sách các đội của giải đấu
  const { data: teams, isLoading, error } = useQuery(
    [QUERY_KEYS.TOURNAMENTS, tournamentId, 'teams'],
    () => tournamentService.getTeamsByTournamentId(tournamentId),
    {
      staleTime: 1 * 60 * 1000,
      select: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      onError: (err) => {
        toast.error(`Lỗi tải danh sách đội: ${err.message || 'Không xác định'}`);
      }
    }
  );

  // Mutation để xóa đội
  const deleteTeamMutation = useMutation(
    (teamId) => tournamentService.deleteTeam(tournamentId, teamId),
    {
      onSuccess: () => {
        toast.success('Xóa đội thành công!');
        queryClient.invalidateQueries([QUERY_KEYS.TOURNAMENTS, tournamentId, 'teams']);
      },
      onError: (err) => {
        toast.error(`Lỗi xóa đội: ${err.response?.data?.message || err.message || 'Không xác định'}`);
      }
    }
  );

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội này khỏi giải đấu?')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeamId(team.id);
  };

  const handleViewTeamDetail = (team) => {
    setSelectedTeam(team);
    setShowTeamDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
          <LoadingSpinner text="Đang tải danh sách đội..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 text-red-600 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Không thể tải danh sách đội: {error.message}</p>
          <button onClick={onClose} className="btn-secondary mt-4">Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Đội đã đăng ký cho Giải đấu: {tournamentName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có đội nào đăng ký cho giải đấu này.</p>
              {/* Có thể thêm nút để mời đội hoặc thêm thủ công nếu cần */}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đội</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số thành viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái đăng ký</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.members ? team.members.length : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${team.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {team.status === 'APPROVED' ? 'Đã duyệt' : 'Đang chờ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewTeamDetail(team)}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            title="Xem chi tiết đội"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="Chỉnh sửa đội"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Xóa đội"
                            disabled={deleteTeamMutation.isLoading}
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
        </div>
        <div className="p-6 border-t border-gray-200 text-right">
          <button onClick={onClose} className="btn-secondary">Đóng</button>
        </div>
      </div>

      {/* Team Detail Modal */}
      {showTeamDetailModal && selectedTeam && (
        <TeamDetailModal team={selectedTeam} onClose={() => setShowTeamDetailModal(false)} />
      )}

      {/* Team Edit Modal */}
      {editingTeamId && (
        <TeamEditForm teamId={editingTeamId} onClose={() => setEditingTeamId(null)} onSuccess={() => {
          queryClient.invalidateQueries([QUERY_KEYS.TOURNAMENTS, tournamentId, 'teams']);
          setEditingTeamId(null);
        }} />
      )}
    </div>
  );
};

export default TournamentTeamsModal;