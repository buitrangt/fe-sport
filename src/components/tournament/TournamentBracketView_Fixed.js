import React, { useState } from 'react';
import { Trophy, Users, Calendar, Target, RefreshCw, Maximize2, Eye } from 'lucide-react';
import { useQuery } from 'react-query';
import { matchService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';

const TournamentBracketView = ({ tournament, refreshInterval = 30000 }) => {
  const [expandedView, setExpandedView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Lấy dữ liệu bảng đấu với tính năng tự động làm mới
  const { data: bracket, isLoading, error, refetch } = useQuery(
    ['tournament-bracket', tournament.id],
    () => matchService.getTournamentBracket(tournament.id),
    {
      enabled: !!tournament.id,
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 10000, // 10 giây
      onError: (error) => {
        console.error('Không thể tải bảng đấu:', error);
      },
      onSuccess: (data) => {
        console.log('🔍 [BracketView] Phản hồi API gốc:', data);
        console.log('🔍 [BracketView] Cấu trúc dữ liệu:', {
          type: typeof data,
          keys: Object.keys(data || {}),
          hasData: !!data?.data,
          dataKeys: data?.data ? Object.keys(data.data) : null,
          hasBracket: !!data?.data?.bracket,
          bracketKeys: data?.data?.bracket ? Object.keys(data.data.bracket) : null,
          hasRounds: !!data?.data?.bracket?.rounds,
          roundsCount: data?.data?.bracket?.rounds?.length || 0
        });
      }
    }
  );

  // ĐÃ SỬA: Xử lý các cấu trúc phản hồi khác nhau
  let bracketData = null;
  let rounds = [];

  if (bracket) {
    console.log('🔍 [BracketView] Đang xử lý dữ liệu bảng đấu...');

    // Thử các cấu trúc phản hồi có thể có
    if (bracket?.data?.bracket?.rounds) {
      // Cấu trúc: { data: { bracket: { rounds: [...] } } }
      bracketData = bracket.data.bracket;
      rounds = bracket.data.bracket.rounds;
      console.log('✅ [BracketView] Đang sử dụng cấu trúc: data.bracket.rounds');
    } else if (bracket?.data?.rounds) {
      // Cấu trúc: { data: { rounds: [...] } }
      bracketData = bracket.data;
      rounds = bracket.data.rounds;
      console.log('✅ [BracketView] Đang sử dụng cấu trúc: data.rounds');
    } else if (bracket?.bracket?.rounds) {
      // Cấu trúc: { bracket: { rounds: [...] } }
      bracketData = bracket.bracket;
      rounds = bracket.bracket.rounds;
      console.log('✅ [BracketView] Đang sử dụng cấu trúc: bracket.rounds');
    } else if (bracket?.rounds) {
      // Cấu trúc: { rounds: [...] }
      bracketData = bracket;
      rounds = bracket.rounds;
      console.log('✅ [BracketView] Đang sử dụng cấu trúc: rounds');
    } else if (Array.isArray(bracket)) {
      // Cấu trúc: [rounds]
      rounds = bracket;
      bracketData = { rounds: bracket };
      console.log('✅ [BracketView] Đang sử dụng cấu trúc: mảng các vòng đấu');
    } else {
      console.warn('⚠️ [BracketView] Cấu trúc bảng đấu không xác định:', bracket);
    }

    console.log('🔍 [BracketView] Dữ liệu vòng đấu cuối cùng:', {
      roundsCount: rounds.length,
      firstRound: rounds[0],
      allRounds: rounds
    });
  }

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Đang tải bảng đấu giải đấu...</p>
      </div>
    );
  }

  if (error) {
    console.error('🔍 [BracketView] Chi tiết lỗi:', error);
    return (
      <div className="card text-center py-8">
        <Trophy className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải bảng đấu</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Thử lại
        </button>
      </div>
    );
  }

  // ĐÃ SỬA: Kiểm tra vòng đấu đúng cách
  if (!rounds || rounds.length === 0) {
    console.log('🔍 [BracketView] Không tìm thấy vòng đấu - hiển thị trạng thái trống');
    return (
      <div className="card text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa tạo bảng đấu</h3>
        <p className="text-gray-600 mb-4">
          Vui lòng tạo bảng đấu để xem cấu trúc giải đấu.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Thông tin gỡ lỗi:</strong>
          </p>
          <pre className="text-xs text-left mt-2 bg-white p-2 rounded border overflow-auto">
            {JSON.stringify({
              hasData: !!bracket,
              structure: bracket ? Object.keys(bracket) : null,
              tournamentId: tournament.id,
              tournamentStatus: tournament.status
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Tính toán số liệu thống kê
  const totalTeams = tournament.currentTeams || bracketData?.totalTeams || 0;
  const completedMatches = rounds.reduce((total, round) => {
    const matches = round.matches || [];
    return total + matches.filter(match => match.status === 'COMPLETED').length;
  }, 0);

  const totalMatches = rounds.reduce((total, round) => {
    const matches = round.matches || [];
    return total + matches.length;
  }, 0);

  const tournamentProgress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  console.log('🔍 [BracketView] Thống kê:', {
    totalTeams,
    completedMatches,
    totalMatches,
    tournamentProgress,
    roundsCount: rounds.length
  });

  return (
    <div className="space-y-6">
      {/* Thông tin giải đấu & Điều khiển */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Bảng đấu giải đấu</h3>
            <p className="text-gray-600">Bảng đấu trực tiếp với cập nhật theo thời gian thực</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Thống kê giải đấu */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalTeams} Đội</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{rounds.length} Vòng</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span>Hoàn thành {Math.round(tournamentProgress)}%</span>
              </div>
            </div>

            {/* Nút điều khiển */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg border transition-colors ${
                  autoRefresh
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
                title={autoRefresh ? 'Tự động làm mới BẬT' : 'Tự động làm mới TẮT'}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              </button>

              <button
                onClick={() => refetch()}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title="Làm mới bảng đấu"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setExpandedView(!expandedView)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title={expandedView ? 'Chế độ xem thu gọn' : 'Chế độ xem mở rộng'}
              >
                {expandedView ? <Eye className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Tiến độ giải đấu</span>
            <span className="text-sm text-gray-600">Đã hoàn thành {completedMatches}/{totalMatches} trận</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${tournamentProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Hiển thị bảng đấu */}
      <div className={`card overflow-x-auto ${expandedView ? 'max-h-none' : 'max-h-96 overflow-y-auto'}`}>
        <div className="min-w-max">
          <div className={`flex ${expandedView ? 'space-x-12' : 'space-x-8'}`}>
            {rounds.map((round, roundIndex) => {
              // ĐÃ SỬA: Xử lý các cấu trúc trận đấu khác nhau
              const roundMatches = round.matches || [];
              const roundCompleted = roundMatches.filter(match => match.status === 'COMPLETED').length;
              const roundTotal = roundMatches.length;
              const isCurrentRound = tournament.currentRound === roundIndex + 1;

              console.log(`🔍 [BracketView] Vòng ${roundIndex + 1}:`, {
                roundName: round.roundName || round.name,
                matchesCount: roundMatches.length,
                completed: roundCompleted,
                total: roundTotal,
                isCurrent: isCurrentRound,
                matches: roundMatches
              });

              return (
                <div key={roundIndex} className={`${expandedView ? 'min-w-80' : 'min-w-64'}`}>
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      isCurrentRound
                        ? 'bg-primary-100 text-primary-800'
                        : roundCompleted === roundTotal && roundTotal > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span>{round.roundName || round.name || `Vòng ${roundIndex + 1}`}</span>
                      {isCurrentRound && <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Hoàn thành {roundCompleted}/{roundTotal}
                    </p>
                  </div>

                  <div className={`space-y-${expandedView ? '6' : '4'}`}>
                    {roundMatches.map((match, matchIndex) => {
                      // ĐÃ SỬA: Xử lý các tên trường trận đấu khác nhau
                      const team1 = match.team1 || null;
                      const team2 = match.team2 || null;
                      const team1Score = match.team1Score ?? match.score1 ?? 0;
                      const team2Score = match.team2Score ?? match.score2 ?? 0;
                      const winnerId = match.winnerTeamId || match.winnerId || match.winner?.id;
                      const matchStatus = match.status || 'SCHEDULED';

                      console.log(`🔍 [BracketView] Trận ${matchIndex + 1}:`, {
                        team1: team1?.name,
                        team2: team2?.name,
                        team1Score,
                        team2Score,
                        winnerId,
                        status: matchStatus
                      });

                      return (
                        <div key={match.id || matchIndex} className={`bg-white border-2 rounded-lg shadow-sm transition-all duration-200 ${
                          matchStatus === 'COMPLETED'
                            ? 'border-green-200 bg-green-50'
                            : matchStatus === 'IN_PROGRESS'
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${expandedView ? 'p-6' : 'p-4'}`}>
                          <div className="text-center mb-3">
                            <div className="flex items-center justify-center space-x-2">
                              <span className={`text-xs font-medium ${
                                matchStatus === 'COMPLETED' ? 'text-green-600' :
                                matchStatus === 'IN_PROGRESS' ? 'text-blue-600' :
                                'text-gray-500'
                              }`}>
                                Trận {match.matchNumber || matchIndex + 1}
                              </span>
                              {matchStatus === 'IN_PROGRESS' && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                            {expandedView && match.matchDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(match.matchDate).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className={`space-y-${expandedView ? '3' : '2'}`}>
                            {/* Đội 1 */}
                            <div className={`${expandedView ? 'p-3' : 'p-2'} rounded-lg border-2 transition-all ${
                              winnerId === team1?.id
                                ? 'bg-green-100 border-green-300 shadow-sm'
                                : 'bg-white border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {winnerId === team1?.id && (
                                    <Trophy className="h-4 w-4 text-green-600" />
                                  )}
                                  <span className={`font-medium ${expandedView ? 'text-base' : 'text-sm'} ${
                                    team1?.name ? 'text-gray-900' : 'text-gray-400 italic'
                                  }`}>
                                    {team1?.name || 'Chưa xác định'}
                                  </span>
                                </div>
                                {team1Score !== undefined && (
                                  <span className={`font-bold ${
                                    expandedView ? 'text-xl' : 'text-sm'
                                  } ${
                                    winnerId === team1?.id ? 'text-green-700' : 'text-gray-700'
                                  }`}>
                                    {team1Score}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* VS */}
                            <div className={`text-center font-medium ${
                              expandedView ? 'text-sm text-gray-500' : 'text-xs text-gray-400'
                            }`}>
                              {matchStatus === 'IN_PROGRESS' ? 'TRỰC TIẾP' : 'VS'}
                            </div>

                            {/* Đội 2 */}
                            <div className={`${expandedView ? 'p-3' : 'p-2'} rounded-lg border-2 transition-all ${
                              winnerId === team2?.id
                                ? 'bg-green-100 border-green-300 shadow-sm'
                                : 'bg-white border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {winnerId === team2?.id && (
                                    <Trophy className="h-4 w-4 text-green-600" />
                                  )}
                                  <span className={`font-medium ${expandedView ? 'text-base' : 'text-sm'} ${
                                    team2?.name ? 'text-gray-900' : 'text-gray-400 italic'
                                  }`}>
                                    {team2?.name || 'Chưa xác định'}
                                  </span>
                                </div>
                                {team2Score !== undefined && (
                                  <span className={`font-bold ${
                                    expandedView ? 'text-xl' : 'text-sm'
                                  } ${
                                    winnerId === team2?.id ? 'text-green-700' : 'text-gray-700'
                                  }`}>
                                    {team2Score}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Trạng thái trận đấu */}
                          <div className="mt-3 text-center">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${
                              matchStatus === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : matchStatus === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {matchStatus === 'COMPLETED' && <Trophy className="h-3 w-3" />}
                              {matchStatus === 'IN_PROGRESS' && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
                              <span>{matchStatus || 'ĐANG CHỜ'}</span>
                            </span>
                          </div>

                          {/* Thời gian trận đấu - Chỉ hiển thị ở chế độ xem thu gọn */}
                          {!expandedView && match.matchDate && (
                            <div className="mt-2 text-center">
                              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Người chiến thắng giải đấu */}
      {bracketData?.winner && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Người chiến thắng giải đấu</h3>
            <p className="text-lg font-semibold text-yellow-700">
              {bracketData.winner.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Chúc mừng nhà vô địch!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracketView;