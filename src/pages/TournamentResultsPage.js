import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  Loader,
  Calendar,
  MapPin,
  Award
} from 'lucide-react';
import { tournamentService, matchService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TournamentResultsPage = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchScores, setMatchScores] = useState({});
  const queryClient = useQueryClient();

  // Fetch all tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'all-tournaments',
    () => tournamentService.getAllTournaments({ status: 'ONGOING,READY_TO_START' }),
    {
      staleTime: 30000,
      onSuccess: (data) => {
        console.log('📊 [TournamentResults] Tournaments data:', data);
        // Auto-select first tournament if none selected
        if (!selectedTournament && data?.data?.length > 0) {
          setSelectedTournament(data.data[0]);
        }
      }
    }
  );

  // Fetch matches for selected tournament
  const { data: matchesData, isLoading: matchesLoading, refetch: refetchMatches } = useQuery(
    ['tournament-matches', selectedTournament?.id],
    () => matchService.getMatchesByTournament(selectedTournament.id),
    {
      enabled: !!selectedTournament?.id,
      staleTime: 10000,
      onSuccess: (data) => {
        console.log('🎯 [TournamentResults] Matches data:', data);
      }
    }
  );

  // Update match score mutation
  const updateScoreMutation = useMutation(
    ({ matchId, scoreData }) => matchService.updateMatchScore(matchId, scoreData),
    {
      onSuccess: (data, variables) => {
        toast.success('Cập nhật điểm số thành công!');
        queryClient.invalidateQueries(['tournament-matches', selectedTournament?.id]);
        setEditingMatch(null);
        setMatchScores(prev => ({ ...prev, [variables.matchId]: {} }));
      },
      onError: (error) => {
        console.error('Failed to update match score:', error);
        toast.error(error.response?.data?.message || 'Không thể cập nhật điểm số');
      }
    }
  );

  // Update match status mutation
  const updateStatusMutation = useMutation(
    ({ matchId, status }) => matchService.updateMatchStatus(matchId, { status }),
    {
      onSuccess: () => {
        toast.success('Cập nhật trạng thái trận đấu thành công!');
        queryClient.invalidateQueries(['tournament-matches', selectedTournament?.id]);
      },
      onError: (error) => {
        console.error('Failed to update match status:', error);
        toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
      }
    }
  );

  // Extract matches data
  let allMatches = [];
  try {
    if (Array.isArray(matchesData?.data?.matches)) {
      allMatches = matchesData.data.matches;
    } else if (Array.isArray(matchesData?.data)) {
      allMatches = matchesData.data;
    } else if (Array.isArray(matchesData?.matches)) {
      allMatches = matchesData.matches;
    } else if (Array.isArray(matchesData)) {
      allMatches = matchesData;
    }
  } catch (err) {
    console.error('Error extracting match data:', err);
  }

  // Group matches by round
  const matchesByRound = allMatches.reduce((acc, match) => {
    const roundNum = match.roundNumber || 1;
    if (!acc[roundNum]) {
      acc[roundNum] = [];
    }
    acc[roundNum].push(match);
    return acc;
  }, {});

  const rounds = Object.keys(matchesByRound)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(roundNum => ({
      roundNumber: parseInt(roundNum),
      roundName: matchesByRound[roundNum][0]?.roundName || `Vòng ${roundNum}`,
      matches: matchesByRound[roundNum]
    }));

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
    
    if (team1Score === team2Score) {
      toast.error('Điểm số không thể bằng nhau. Vui lòng nhập điểm khác nhau.');
      return;
    }

    if (team1Score < 0 || team2Score < 0) {
      toast.error('Điểm số không thể âm.');
      return;
    }

    try {
      await updateScoreMutation.mutateAsync({
        matchId: match.id,
        scoreData: {
          team1Score,
          team2Score,
          status: 'COMPLETED',
          notes: `Cập nhật điểm: ${match.team1?.name} ${team1Score} - ${team2Score} ${match.team2?.name}`
        }
      });
    } catch (error) {
      console.error('Error saving score:', error);
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
      default:
        return <Clock className="h-4 w-4" />;
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cập nhật Kết quả</h1>
            <p className="text-orange-100">Nhập tỉ số trận đấu và quản lý kết quả giải đấu</p>
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

      {/* Match Results */}
      {selectedTournament && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTournament.name} - Kết quả trận đấu
                </h3>
                <p className="text-gray-600">Cập nhật điểm số và trạng thái các trận đấu</p>
              </div>
              <button
                onClick={() => refetchMatches()}
                className="btn-secondary flex items-center space-x-2"
              >
                <Target className="h-4 w-4" />
                <span>Làm mới</span>
              </button>
            </div>

            {matchesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Đang tải trận đấu...</span>
              </div>
            ) : rounds.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Không có trận đấu</h4>
                <p className="text-gray-600">Chưa có trận đấu nào được tạo cho giải đấu này.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {rounds.map((round) => (
                  <div key={round.roundNumber} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <Target className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{round.roundName}</h4>
                        <p className="text-sm text-gray-600">
                          {round.matches.filter(m => m.status === 'COMPLETED').length}/{round.matches.length} trận đã hoàn thành
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {round.matches.map((match, index) => (
                        <div key={match.id} className="card border">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-100 p-2 rounded-full">
                                <Trophy className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">
                                  Trận {match.matchNumber || index + 1}
                                </h5>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getMatchStatusColor(match.status)}`}>
                                    {getMatchStatusIcon(match.status)}
                                    <span>{
                                      match.status === 'COMPLETED' ? 'Hoàn thành' :
                                      match.status === 'IN_PROGRESS' ? 'Đang diễn ra' :
                                      match.status === 'SCHEDULED' ? 'Đã lên lịch' : 'Chờ'
                                    }</span>
                                  </span>
                                  {match.matchDate && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(match.matchDate).toLocaleString('vi-VN')}</span>
                                    </div>
                                  )}
                                  {match.location && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                      <MapPin className="h-3 w-3" />
                                      <span>{match.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
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
                              
                              <button
                                onClick={() => handleEditMatch(match)}
                                disabled={editingMatch === match.id}
                                className="btn-primary flex items-center space-x-1 text-sm"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span>Nhập điểm</span>
                              </button>
                            </div>
                          </div>

                          {/* Match Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Team 1 */}
                            <div className={`p-4 rounded-lg border-2 ${
                              match.winnerTeam?.id === match.team1?.id 
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
                                    {match.winnerTeam?.id === match.team1?.id && (
                                      <div className="flex items-center space-x-1 text-sm text-green-600 font-medium">
                                        <Award className="h-4 w-4" />
                                        <span>Thắng</span>
                                      </div>
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

                            {/* VS / Actions */}
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

                            {/* Team 2 */}
                            <div className={`p-4 rounded-lg border-2 ${
                              match.winnerTeam?.id === match.team2?.id 
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
                                    {match.winnerTeam?.id === match.team2?.id && (
                                      <div className="flex items-center space-x-1 text-sm text-green-600 font-medium">
                                        <Award className="h-4 w-4" />
                                        <span>Thắng</span>
                                      </div>
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentResultsPage;