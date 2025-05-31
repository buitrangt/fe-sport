import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { 
  Trophy, 
  Save, 
  Clock, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Users,
  Target,
  Edit3,
  Loader
} from 'lucide-react';
import { matchService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';

const MatchResultsManager = ({ tournament, currentRound = 1, onMatchResultUpdated }) => {
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchScores, setMatchScores] = useState({});
  const [notification, setNotification] = useState(null);
  const queryClient = useQueryClient();

  // Lấy dữ liệu các trận đấu cho giải đấu và vòng hiện tại
  const { data: matches, isLoading, error, refetch } = useQuery(
    ['tournament-matches', tournament.id, currentRound],
    () => matchService.getMatchesByTournament(tournament.id, { round: currentRound }),
    {
      enabled: !!tournament.id,
      staleTime: 30000, // 30 giây
      onSuccess: (data) => {
        console.log('📋 [MatchResultsManager] Dữ liệu trận đấu đã nhận:', data);
        console.log('📋 [MatchResultsManager] Loại dữ liệu:', typeof data);
        console.log('📋 [MatchResultsManager] Có phải mảng không:', Array.isArray(data));
        if (data?.data) {
          console.log('📋 [MatchResultsManager] Dữ liệu lồng:', data.data);
          console.log('📋 [MatchResultsManager] Loại dữ liệu lồng:', typeof data.data);
          console.log('📋 [MatchResultsManager] Lồng có phải mảng không:', Array.isArray(data.data));
        }
      },
      onError: (error) => {
        console.error('Không thể lấy dữ liệu trận đấu:', error);
        showNotification('error', 'Không thể tải các trận đấu');
      }
    }
  );

  // Mutation cập nhật điểm trận đấu
  const updateScoreMutation = useMutation(
    ({ matchId, scoreData }) => matchService.updateMatchScore(matchId, scoreData),
    {
      onSuccess: (data, variables) => {
        showNotification('success', 'Điểm trận đấu đã được cập nhật thành công!');
        queryClient.invalidateQueries(['tournament-matches', tournament.id]);
        queryClient.invalidateQueries(['tournament-bracket', tournament.id]);
        setEditingMatch(null);
        setMatchScores(prev => ({ ...prev, [variables.matchId]: {} }));
        // Kích hoạt callback cho component cha
        onMatchResultUpdated?.();
      },
      onError: (error) => {
        console.error('Không thể cập nhật điểm trận đấu:', error);
        showNotification('error', error.response?.data?.message || 'Không thể cập nhật điểm trận đấu');
      }
    }
  );

  // Mutation cập nhật trạng thái trận đấu
  const updateStatusMutation = useMutation(
    ({ matchId, status }) => matchService.updateMatchStatus(matchId, { status }),
    {
      onSuccess: () => {
        showNotification('success', 'Trạng thái trận đấu đã được cập nhật thành công!');
        queryClient.invalidateQueries(['tournament-matches', tournament.id]);
        queryClient.invalidateQueries(['tournament-bracket', tournament.id]);
        // Kích hoạt callback cho component cha
        onMatchResultUpdated?.();
      },
      onError: (error) => {
        console.error('Không thể cập nhật trạng thái trận đấu:', error);
        showNotification('error', error.response?.data?.message || 'Không thể cập nhật trạng thái trận đấu');
      }
    }
  );

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match.id);
    setMatchScores(prev => ({
      ...prev,
      [match.id]: {
        team1Score: match.team1Score || 0,
        team2Score: match.team2Score || 0
      }
    }));
  };

  const handleScoreChange = (matchId, team, score) => {
    const numericScore = parseInt(score) || 0;
    setMatchScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${team}Score`]: numericScore
      }
    }));
  };

  const handleSaveScore = async (match) => {
    const scores = matchScores[match.id];
    if (!scores) return;

    const { team1Score, team2Score } = scores;
    
    // Xác thực điểm số
    if (team1Score === team2Score) {
      showNotification('error', 'Điểm số không được hòa. Vui lòng nhập điểm số khác nhau.');
      return;
    }

    if (team1Score < 0 || team2Score < 0) {
      showNotification('error', 'Điểm số không được âm.');
      return;
    }

    // Xác định người thắng
    const winnerId = team1Score > team2Score ? match.team1.id : match.team2.id;

    try {
      await updateScoreMutation.mutateAsync({
        matchId: match.id,
        scoreData: {
          team1Score,
          team2Score,
          winnerId,
          status: 'COMPLETED'
        }
      });
    } catch (error) {
      console.error('Lỗi khi lưu điểm:', error);
    }
  };

  const handleStartMatch = (matchId) => {
    updateStatusMutation.mutate({
      matchId,
      status: 'IN_PROGRESS'
    });
  };

  const handleCancelEdit = (matchId) => {
    setEditingMatch(null);
    setMatchScores(prev => ({ ...prev, [matchId]: {} }));
  };

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi khi tải các trận đấu</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Thử lại
        </button>
      </div>
    );
  }

  // Trích xuất dữ liệu an toàn với các phương án dự phòng toàn diện
  let matchList = [];
  
  try {
    // Thử các cấu trúc dữ liệu có thể có
    if (Array.isArray(matches?.data?.matches)) {
      matchList = matches.data.matches;
    } else if (Array.isArray(matches?.data)) {
      matchList = matches.data;
    } else if (Array.isArray(matches?.matches)) {
      matchList = matches.matches;
    } else if (Array.isArray(matches)) {
      matchList = matches;
    } else {
      console.log('🚷 [MatchResultsManager] Không tìm thấy mảng trận đấu hợp lệ trong:', matches);
      matchList = [];
    }
  } catch (err) {
    console.error('🚨 [MatchResultsManager] Lỗi khi trích xuất dữ liệu trận đấu:', err);
    matchList = [];
  }
  
  console.log('🏆 [MatchResultsManager] Danh sách trận đấu cuối cùng:', matchList);
  console.log('🏆 [MatchResultsManager] Độ dài danh sách trận đấu:', matchList.length);
  
  const completedMatches = matchList.filter(match => match?.status === 'COMPLETED').length;
  const totalMatches = matchList.length;
  const roundProgress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Thông báo */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800'
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Tiêu đề vòng đấu */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Vòng {currentRound} - Kết quả trận đấu
            </h3>
            <p className="text-gray-600">
              Nhập kết quả trận đấu và quản lý tiến trình giải đấu
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Tiến độ</div>
              <div className="text-lg font-semibold text-gray-900">
                {completedMatches}/{totalMatches}
              </div>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${roundProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Thống kê vòng đấu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Tổng số trận đấu</div>
                <div className="text-xl font-bold text-blue-900">{totalMatches}</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Đã hoàn thành</div>
                <div className="text-xl font-bold text-green-900">{completedMatches}</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-orange-600 font-medium">Còn lại</div>
                <div className="text-xl font-bold text-orange-900">{totalMatches - completedMatches}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách trận đấu */}
      <div className="space-y-4">
        {totalMatches === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy trận đấu nào</h3>
            <p className="text-gray-600 mb-4">
              Không tìm thấy trận đấu nào cho Vòng {currentRound}. Điều này có thể có nghĩa là:
            </p>
            <div className="text-sm text-gray-500 space-y-1 mb-6">
              <p>• Sơ đồ giải đấu chưa được tạo</p>
              <p>• Không có trận đấu nào tồn tại cho vòng này</p> 
              <p>• Dữ liệu backend không đúng định dạng</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📊 Dữ liệu API hiện tại</h4>
              <pre className="text-xs text-blue-700 text-left overflow-auto">
                {JSON.stringify(matches, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          matchList.map((match, index) => (
            <div key={match.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Trận {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getMatchStatusColor(match.status)}`}>
                        {getMatchStatusIcon(match.status)}
                        <span>{match.status || 'ĐANG CHỜ'}</span>
                      </span>
                      {match.scheduledTime && (
                        <span className="text-xs text-gray-500">
                          {new Date(match.scheduledTime).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex items-center space-x-2">
                  {(match.status === 'PENDING' || match.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handleStartMatch(match.id)}
                      disabled={updateStatusMutation.isLoading}
                      className="btn-secondary flex items-center space-x-1 text-sm"
                    >
                      <Play className="h-4 w-4" />
                      <span>Bắt đầu</span>
                    </button>
                  )}
                  
                  {(match.status === 'IN_PROGRESS' || match.status === 'PENDING' || match.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handleEditMatch(match)}
                      disabled={editingMatch === match.id}
                      className="btn-primary flex items-center space-x-1 text-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Nhập điểm</span>
                    </button>
                  )}
                  
                  {match.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleEditMatch(match)}
                      className="btn-secondary flex items-center space-x-1 text-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Sửa điểm</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chi tiết trận đấu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Đội 1 */}
                <div className={`p-4 rounded-lg border-2 ${
                  match.winnerId === match.team1?.id 
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {match.team1?.name || 'Đội 1'}
                        </div>
                        {match.winnerId === match.team1?.id && (
                          <div className="text-sm text-green-600 font-medium">Người thắng</div>
                        )}
                      </div>
                    </div>
                    
                    {editingMatch === match.id ? (
                      <input
                        type="number"
                        min="0"
                        value={matchScores[match.id]?.team1Score || 0}
                        onChange={(e) => handleScoreChange(match.id, 'team1', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded p-1 font-bold text-lg"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {match.team1Score !== undefined ? match.team1Score : '-'}
                      </span>
                    )}
                  </div>
                </div>

                {/* VS / Hành động */}
                <div className="text-center">
                  {editingMatch === match.id ? (
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-600">VS</div>
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => handleSaveScore(match)}
                          disabled={updateScoreMutation.isLoading}
                          className="btn-primary flex items-center space-x-1 text-sm"
                        >
                          {updateScoreMutation.isLoading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Lưu</span>
                        </button>
                        <button
                          onClick={() => handleCancelEdit(match.id)}
                          className="btn-secondary text-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-600">VS</div>
                  )}
                </div>

                {/* Đội 2 */}
                <div className={`p-4 rounded-lg border-2 ${
                  match.winnerId === match.team2?.id 
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {match.team2?.name || 'Đội 2'}
                        </div>
                        {match.winnerId === match.team2?.id && (
                          <div className="text-sm text-green-600 font-medium">Người thắng</div>
                        )}
                      </div>
                    </div>
                    
                    {editingMatch === match.id ? (
                      <input
                        type="number"
                        min="0"
                        value={matchScores[match.id]?.team2Score || 0}
                        onChange={(e) => handleScoreChange(match.id, 'team2', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded p-1 font-bold text-lg"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {match.team2Score !== undefined ? match.team2Score : '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Trạng thái hoàn thành vòng đấu */}
      {totalMatches > 0 && (
        <div className="card">
          <div className="text-center">
            {completedMatches === totalMatches ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-900">
                  Vòng {currentRound} Đã Hoàn Thành!
                </h3>
                <p className="text-green-700">
                  Tất cả các trận đấu trong vòng này đã hoàn thành. Sẵn sàng chuyển sang vòng tiếp theo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Clock className="h-12 w-12 text-orange-400 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Vòng {currentRound} Đang Diễn Ra
                </h3>
                <p className="text-gray-600">
                  Còn lại {totalMatches - completedMatches} trận đấu để hoàn thành vòng này.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchResultsManager;