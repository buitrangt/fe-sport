import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { 
  ArrowRight, 
  Trophy, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Play,
  Target,
  Users,
  Award,
  Loader
} from 'lucide-react';
import { tournamentKnockoutService, matchService } from '../../services';

const RoundManager = ({ tournament, currentRound = 1, onRoundAdvanced }) => {
  const [notification, setNotification] = useState(null);
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current round matches to check completion status
  const { data: currentMatches, isLoading: matchesLoading } = useQuery(
    ['round-matches', tournament.id, currentRound],
    () => matchService.getMatchesByTournament(tournament.id, { round: currentRound }),
    {
      enabled: !!tournament.id,
      staleTime: 30000,
    }
  );

  // Fetch tournament bracket to get round information
  const { data: bracket, isLoading: bracketLoading } = useQuery(
    ['tournament-bracket', tournament.id],
    () => matchService.getTournamentBracket(tournament.id),
    {
      enabled: !!tournament.id,
      staleTime: 30000,
    }
  );

  // Advance round mutation
  const advanceRoundMutation = useMutation(
    () => tournamentKnockoutService.advanceRound(tournament.id),
    {
      onSuccess: () => {
        showNotification('success', `Đã chuyển sang Vòng ${currentRound + 1} thành công!`);
        queryClient.invalidateQueries(['tournament-matches']);
        queryClient.invalidateQueries(['tournament-bracket']);
        queryClient.invalidateQueries(['tournaments']);
        queryClient.invalidateQueries(['round-matches']);
        queryClient.invalidateQueries(['tournament', tournament.id]);
        setShowAdvanceConfirm(false);
        
        // Trigger callback to parent component
        onRoundAdvanced?.();
        
        // Force refresh page to ensure UI updates
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      onError: (error) => {
        console.error('Failed to advance round:', error);
        showNotification('error', error.response?.data?.message || 'Không thể chuyển vòng');
        setShowAdvanceConfirm(false);
      }
    }
  );

  // Complete tournament mutation
  const completeTournamentMutation = useMutation(
    () => tournamentKnockoutService.completeTournament(tournament.id),
    {
      onSuccess: () => {
        showNotification('success', 'Giải đấu đã hoàn tất thành công! 🎉');
        queryClient.invalidateQueries(['tournaments']);
        queryClient.invalidateQueries(['tournament-bracket']);
      },
      onError: (error) => {
        console.error('Failed to complete tournament:', error);
        showNotification('error', error.response?.data?.message || 'Không thể hoàn tất giải đấu');
      }
    }
  );

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAdvanceRound = () => {
    setShowAdvanceConfirm(true);
  };

  const confirmAdvanceRound = () => {
    advanceRoundMutation.mutate();
  };

  const handleCompleteTournament = () => {
    if (window.confirm('Bạn có chắc chắn muốn hoàn tất giải đấu này không? Hành động này không thể hoàn tác.')) {
      completeTournamentMutation.mutate();
    }
  };

  // Safe extraction of matches data
  let matchesList = [];
  
  try {
    // Try different possible data structures
    if (Array.isArray(currentMatches?.data?.matches)) {
      matchesList = currentMatches.data.matches;
    } else if (Array.isArray(currentMatches?.data)) {
      matchesList = currentMatches.data;
    } else if (Array.isArray(currentMatches?.matches)) {
      matchesList = currentMatches.matches;
    } else if (Array.isArray(currentMatches)) {
      matchesList = currentMatches;
    } else {
      console.log('🚷 [RoundManager] No valid match array found in:', currentMatches);
      matchesList = [];
    }
  } catch (err) {
    console.error('🚨 [RoundManager] Error extracting match data:', err);
    matchesList = [];
  }
  
  const completedMatches = matchesList.filter(match => match?.status === 'COMPLETED').length;
  const totalMatches = matchesList.length;
  const isRoundComplete = totalMatches > 0 && completedMatches === totalMatches;
  
  // Get bracket info
  const bracketData = bracket?.data || bracket;
  
  // Calculate expected total rounds based on tournament structure
  // For elimination tournament: teams -> rounds needed
  const tournamentTeams = tournament.currentTeams || tournament.maxTeams || 4;
  const expectedRounds = Math.ceil(Math.log2(tournamentTeams)); // 4 teams = 2 rounds, 8 teams = 3 rounds
  
  // Use bracket rounds if available, otherwise use calculated rounds
  const totalRounds = bracketData?.rounds?.length || expectedRounds;
  
  // Override isLastRound logic: for 4 teams, round 2 is final, not round 1
  const isLastRound = currentRound >= totalRounds;
  const tournamentWinner = bracketData?.winner;
  
  // Debug logging
  console.log('🔍 [RoundManager] Debug info:', {
    currentRound,
    tournamentTeams,
    expectedRounds,
    bracketRounds: bracketData?.rounds?.length,
    totalRounds,
    isLastRound,
    isRoundComplete
  });

  if (matchesLoading || bracketLoading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải thông tin vòng đấu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
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

      {/* Round Status Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Quản Lý Vòng Đấu</h3>
            <p className="text-gray-600">Quản lý tiến độ giải đấu và chuyển vòng</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Vòng Hiện Tại</div>
            <div className="text-2xl font-bold text-primary-600">{currentRound}</div>
          </div>
        </div>

        {/* Round Progress Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Tổng Số Vòng</div>
                <div className="text-xl font-bold text-blue-900">{totalRounds}</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Play className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-orange-600 font-medium">Vòng Hiện Tại</div>
                <div className="text-xl font-bold text-orange-900">{currentRound}</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-purple-600 font-medium">Trận Đấu</div>
                <div className="text-xl font-bold text-purple-900">
                  {completedMatches}/{totalMatches}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Tiến Độ</div>
                <div className="text-xl font-bold text-green-900">
                  {totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Tiến Độ Vòng {currentRound}</span>
            <span className="text-sm text-gray-600">Đã hoàn thành {completedMatches}/{totalMatches} trận</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                isRoundComplete ? 'bg-green-600' : 'bg-primary-600'
              }`}
              style={{ 
                width: `${totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Round Status */}
        <div className="space-y-4">
          {!isRoundComplete ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-lg font-medium text-orange-900">Vòng {currentRound} Đang Diễn Ra</h4>
                  <p className="text-orange-700 mt-1">
                    Còn {totalMatches - completedMatches} trận đấu để hoàn thành vòng này.
                    Hoàn thành tất cả các trận đấu để chuyển sang vòng tiếp theo.
                  </p>
                </div>
              </div>
            </div>
          ) : !isLastRound ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-green-900">Vòng {currentRound} Đã Hoàn Thành!</h4>
                  <p className="text-green-700 mt-1">
                    Tất cả các trận đấu trong vòng này đã hoàn thành. Bây giờ bạn có thể chuyển sang Vòng {currentRound + 1}.
                  </p>
                </div>
                <button
                  onClick={handleAdvanceRound}
                  disabled={advanceRoundMutation.isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {advanceRoundMutation.isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span>Chuyển sang Vòng {currentRound + 1}</span>
                </button>
              </div>
            </div>
          ) : tournamentWinner ? (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="text-center space-y-4">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto" />
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Giải Đấu Đã Hoàn Thành! 🎉</h4>
                  <p className="text-lg text-yellow-700 mt-2">
                    Chúc mừng <span className="font-semibold">{tournamentWinner.name}</span> đã chiến thắng giải đấu!
                  </p>
                </div>
                {tournament.status !== 'COMPLETED' && (
                  <button
                    onClick={handleCompleteTournament}
                    disabled={completeTournamentMutation.isLoading}
                    className="btn-primary bg-yellow-600 hover:bg-yellow-700 flex items-center space-x-2 mx-auto"
                  >
                    {completeTournamentMutation.isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Award className="h-4 w-4" />
                    )}
                    <span>Hoàn Tất Giải Đấu</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Trophy className="h-6 w-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-blue-900">Vòng Chung Kết Đã Sẵn Sàng!</h4>
                  <p className="text-blue-700 mt-1">
                    Đây là vòng cuối cùng. Hoàn thành các trận đấu còn lại để xác định người chiến thắng giải đấu.
                  </p>
                </div>
                {isRoundComplete && (
                  <button
                    onClick={handleAdvanceRound}
                    disabled={advanceRoundMutation.isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {advanceRoundMutation.isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    <span>Chuyển sang Vòng {currentRound + 1}</span>
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Emergency Advance Button - Always show for debugging */}
          {isRoundComplete && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Ghi Đè Thủ Công</h4>
                  <p className="text-xs text-gray-600">Buộc chuyển vòng (sử dụng nếu tự động chuyển thất bại)</p>
                </div>
                <button
                  onClick={handleAdvanceRound}
                  disabled={advanceRoundMutation.isLoading}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  {advanceRoundMutation.isLoading ? (
                    <Loader className="h-3 w-3 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )}
                  <span>Buộc Chuyển</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Round History */}
      {bracketData?.rounds && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Các Vòng Đấu Của Giải</h4>
          <div className="space-y-3">
            {bracketData.rounds.map((round, index) => {
              const roundNumber = index + 1;
              const isCurrentRound = roundNumber === currentRound;
              const isPastRound = roundNumber < currentRound;
              const isFutureRound = roundNumber > currentRound;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCurrentRound 
                      ? 'bg-primary-50 border-primary-300' 
                      : isPastRound 
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        isCurrentRound 
                          ? 'bg-primary-100' 
                          : isPastRound 
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}>
                        {isPastRound ? (
                          <CheckCircle className={`h-5 w-5 ${
                            isPastRound ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        ) : isCurrentRound ? (
                          <Play className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className={`font-semibold ${
                          isCurrentRound 
                            ? 'text-primary-900' 
                            : isPastRound 
                            ? 'text-green-900'
                            : 'text-gray-600'
                        }`}>
                          {round.name || `Vòng ${roundNumber}`}
                        </div>
                        <div className={`text-sm ${
                          isCurrentRound 
                            ? 'text-primary-700' 
                            : isPastRound 
                            ? 'text-green-700'
                            : 'text-gray-500'
                        }`}>
                          {round.matches?.length || 0} trận đấu
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        isCurrentRound 
                          ? 'text-primary-700' 
                          : isPastRound 
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {isPastRound ? 'Đã Hoàn Thành' : isCurrentRound ? 'Đang Diễn Ra' : 'Sắp Tới'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Advance Round Confirmation Modal */}
      {showAdvanceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">
                Chuyển sang Vòng {currentRound + 1}?
              </h3>
              <p className="text-gray-600">
                Thao tác này sẽ tạo các trận đấu cho vòng tiếp theo dựa trên những người thắng cuộc từ Vòng {currentRound}. 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowAdvanceConfirm(false)}
                  className="btn-secondary"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmAdvanceRound}
                  disabled={advanceRoundMutation.isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {advanceRoundMutation.isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span>Chuyển Vòng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundManager;