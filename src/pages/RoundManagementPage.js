import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Play, 
  Trophy, 
  Users, 
  Target, 
  ChevronRight, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  Award,
  RotateCcw
} from 'lucide-react';
import { tournamentService, tournamentKnockoutService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const RoundManagementPage = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'ongoing-tournaments',
    () => tournamentService.getAllTournaments({ status: 'ONGOING,READY_TO_START' }),
    {
      staleTime: 30000,
      onSuccess: (data) => {
        console.log('📊 [RoundManagement] Tournaments data:', data);
        if (!selectedTournament && data?.data?.length > 0) {
          setSelectedTournament(data.data[0]);
        }
      }
    }
  );

  // Fetch current round info
  const { data: currentRoundData, isLoading: roundLoading, refetch: refetchRound } = useQuery(
    ['current-round', selectedTournament?.id],
    () => tournamentService.getCurrentRound(selectedTournament.id),
    {
      enabled: !!selectedTournament?.id,
      staleTime: 10000,
      onSuccess: (data) => {
        console.log('🎯 [RoundManagement] Current round data:', data);
      }
    }
  );

  // Advance round mutation
  const advanceRoundMutation = useMutation(
    (tournamentId) => tournamentKnockoutService.advanceRound(tournamentId),
    {
      onSuccess: (data) => {
        toast.success('Chuyển vòng thành công!');
        queryClient.invalidateQueries(['current-round', selectedTournament?.id]);
        queryClient.invalidateQueries(['tournament-matches', selectedTournament?.id]);
        console.log('✅ Advance round success:', data);
      },
      onError: (error) => {
        console.error('Failed to advance round:', error);
        toast.error(error.response?.data?.message || 'Không thể chuyển vòng');
      }
    }
  );

  // Complete tournament mutation
  const completeTournamentMutation = useMutation(
    (tournamentId) => tournamentKnockoutService.completeTournament(tournamentId),
    {
      onSuccess: (data) => {
        toast.success('Hoàn thành giải đấu thành công!');
        queryClient.invalidateQueries(['current-round', selectedTournament?.id]);
        queryClient.invalidateQueries('ongoing-tournaments');
        console.log('🏆 Complete tournament success:', data);
      },
      onError: (error) => {
        console.error('Failed to complete tournament:', error);
        toast.error(error.response?.data?.message || 'Không thể hoàn thành giải đấu');
      }
    }
  );

  const handleAdvanceRound = () => {
    if (!selectedTournament) return;
    advanceRoundMutation.mutate(selectedTournament.id);
  };

  const handleCompleteTournament = () => {
    if (!selectedTournament) return;
    if (window.confirm('Bạn có chắc chắn muốn hoàn thành giải đấu này?')) {
      completeTournamentMutation.mutate(selectedTournament.id);
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
  const roundInfo = currentRoundData?.data || {};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Play className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý Vòng đấu</h1>
            <p className="text-blue-100">Vòng 1 hiện tại - Chuyển đến vòng tiếp theo</p>
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
                      <span>{tournament.currentTeams || 0} đội</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(tournament.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tournament.status === 'ONGOING' 
                    ? 'bg-green-100 text-green-800'
                    : tournament.status === 'READY_TO_START'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tournament.status === 'ONGOING' ? 'Đang diễn ra' :
                   tournament.status === 'READY_TO_START' ? 'Sẵn sàng' : tournament.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Round Management */}
      {selectedTournament && (
        <div className="space-y-6">
          {roundLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Đang tải thông tin vòng đấu...</span>
            </div>
          ) : (
            <>
              {/* Current Round Info */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedTournament.name} - Quản lý Vòng đấu
                    </h3>
                    <p className="text-gray-600">Theo dõi tiến độ và chuyển vòng đấu</p>
                  </div>
                  <button
                    onClick={() => refetchRound()}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Làm mới</span>
                  </button>
                </div>

                {/* Round Progress */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-600 font-medium">Vòng hiện tại</div>
                        <div className="text-xl font-bold text-blue-900">
                          {roundInfo.currentRoundName || `Vòng ${roundInfo.currentRound || 1}`}
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
                        <div className="text-sm text-green-600 font-medium">Vòng hoàn thành</div>
                        <div className="text-xl font-bold text-green-900">
                          {roundInfo.completedRounds || 0}/{roundInfo.totalRounds || 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-orange-600 font-medium">Trận đấu</div>
                        <div className="text-xl font-bold text-orange-900">
                          {roundInfo.completedMatches || 0}/{roundInfo.totalMatches || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-purple-600 font-medium">Tiến độ</div>
                        <div className="text-xl font-bold text-purple-900">
                          {roundInfo.totalMatches > 0 
                            ? Math.round((roundInfo.completedMatches / roundInfo.totalMatches) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiến độ giải đấu</span>
                    <span className="text-sm text-gray-600">
                      {roundInfo.completedMatches || 0}/{roundInfo.totalMatches || 0} trận đã hoàn thành
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${roundInfo.totalMatches > 0 
                          ? (roundInfo.completedMatches / roundInfo.totalMatches) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Round Status */}
                <div className="space-y-4">
                  {selectedTournament.status === 'COMPLETED' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Trophy className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="text-lg font-medium text-green-900">Giải đấu đã hoàn thành!</h4>
                          <p className="text-green-700 mt-1">
                            Giải đấu đã kết thúc thành công. Bạn có thể xem kết quả cuối cùng và thống kê.
                          </p>
                          {selectedTournament.winnerTeam && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium text-yellow-900">
                                  Nhà vô địch: {selectedTournament.winnerTeam.name}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : roundInfo.canAdvanceRound ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-blue-900">Sẵn sàng chuyển vòng</h4>
                          <p className="text-blue-700 mt-1">
                            Tất cả trận đấu trong vòng hiện tại đã hoàn thành. Bạn có thể chuyển sang vòng tiếp theo.
                          </p>
                          
                          {roundInfo.currentRound >= roundInfo.totalRounds ? (
                            <div className="mt-4">
                              <button
                                onClick={handleCompleteTournament}
                                disabled={completeTournamentMutation.isLoading}
                                className="btn-primary flex items-center space-x-2"
                              >
                                {completeTournamentMutation.isLoading ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trophy className="h-4 w-4" />
                                )}
                                <span>Hoàn thành giải đấu</span>
                              </button>
                            </div>
                          ) : (
                            <div className="mt-4">
                              <button
                                onClick={handleAdvanceRound}
                                disabled={advanceRoundMutation.isLoading}
                                className="btn-primary flex items-center space-x-2"
                              >
                                {advanceRoundMutation.isLoading ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <ArrowRight className="h-4 w-4" />
                                )}
                                <span>Chuyển sang vòng tiếp theo</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Clock className="h-6 w-6 text-orange-600 mt-1" />
                        <div>
                          <h4 className="text-lg font-medium text-orange-900">Vòng đấu đang tiến hành</h4>
                          <p className="text-orange-700 mt-1">
                            Vẫn còn {(roundInfo.totalMatches || 0) - (roundInfo.completedMatches || 0)} trận đấu 
                            chưa hoàn thành trong vòng hiện tại. Cần hoàn thành tất cả trận đấu trước khi chuyển vòng.
                          </p>
                          <div className="mt-3 text-sm text-orange-600">
                            💡 Hãy vào phần "Cập nhật Kết quả" để nhập điểm số các trận đấu.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Round Timeline */}
              <div className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Lịch trình Vòng đấu</h4>
                <div className="space-y-4">
                  {Array.from({ length: roundInfo.totalRounds || 1 }, (_, index) => {
                    const roundNum = index + 1;
                    const isCompleted = roundNum <= (roundInfo.completedRounds || 0);
                    const isCurrent = roundNum === (roundInfo.currentRound || 1);
                    const isFuture = roundNum > (roundInfo.currentRound || 1);

                    return (
                      <div key={roundNum} className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{roundNum}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`font-medium ${
                            isCompleted ? 'text-green-900' :
                            isCurrent ? 'text-blue-900' : 'text-gray-500'
                          }`}>
                            Vòng {roundNum}
                            {isCurrent && <span className="ml-2 text-sm">(Hiện tại)</span>}
                          </div>
                          <div className={`text-sm ${
                            isCompleted ? 'text-green-600' :
                            isCurrent ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {isCompleted ? 'Đã hoàn thành' :
                             isCurrent ? 'Đang tiến hành' : 'Chưa bắt đầu'}
                          </div>
                        </div>

                        {!isCompleted && roundNum < (roundInfo.totalRounds || 1) && (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RoundManagementPage;