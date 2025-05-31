import React, { useState } from 'react';
import { Trophy, Users, Calendar, Target, RefreshCw, Maximize2, Eye } from 'lucide-react';
import { useQuery } from 'react-query';
import { matchService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';

const TournamentBracketView = ({ tournament, refreshInterval = 30000 }) => {
  const [expandedView, setExpandedView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch bracket data with auto-refresh
  const { data: bracket, isLoading, error, refetch } = useQuery(
    ['tournament-bracket', tournament.id],
    () => matchService.getTournamentBracket(tournament.id),
    {
      enabled: !!tournament.id,
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 10000, // 10 giây
      onError: (error) => {
        console.error('Không thể tải bảng đấu:', error);
      }
    }
  );

  const bracketData = bracket?.data || bracket;

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Đang tải bảng đấu giải đấu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <Trophy className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi khi tải bảng đấu</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Thử lại
        </button>
      </div>
    );
  }

  if (!bracketData || !bracketData.rounds) {
    return (
      <div className="card text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bảng đấu nào được tạo</h3>
        <p className="text-gray-600">
          Tạo bảng đấu giải đấu để xem cấu trúc giải đấu.
        </p>
      </div>
    );
  }

  const { rounds } = bracketData;
  const totalTeams = tournament.currentTeams || bracketData.totalTeams || 0;
  const completedMatches = rounds.reduce((total, round) => 
    total + (round.matches?.filter(match => match.status === 'COMPLETED').length || 0), 0
  );
  const totalMatches = rounds.reduce((total, round) => 
    total + (round.matches?.length || 0), 0
  );
  const tournamentProgress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Tournament Info & Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Bảng đấu Giải đấu</h3>
            <p className="text-gray-600">Bảng đấu giải đấu trực tiếp với cập nhật theo thời gian thực</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Tournament Stats */}
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
                <span>{Math.round(tournamentProgress)}% Hoàn thành</span>
              </div>
            </div>
            
            {/* Control Buttons */}
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
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Tiến độ giải đấu</span>
            <span className="text-sm text-gray-600">{completedMatches}/{totalMatches} trận đấu đã hoàn thành</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${tournamentProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bracket Visualization */}
      <div className={`card overflow-x-auto ${expandedView ? 'max-h-none' : 'max-h-96 overflow-y-auto'}`}>
        <div className="min-w-max">
          <div className={`flex ${expandedView ? 'space-x-12' : 'space-x-8'}`}>
            {rounds.map((round, roundIndex) => {
              const roundMatches = round.matches || [];
              const roundCompleted = roundMatches.filter(match => match.status === 'COMPLETED').length;
              const roundTotal = roundMatches.length;
              const isCurrentRound = tournament.currentRound === roundIndex + 1;
              
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
                      <span>{round.name || `Vòng ${roundIndex + 1}`}</span>
                      {isCurrentRound && <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {roundCompleted}/{roundTotal} đã hoàn thành
                    </p>
                  </div>

                  <div className={`space-y-${expandedView ? '6' : '4'}`}>
                    {roundMatches.map((match, matchIndex) => (
                      <div key={matchIndex} className={`bg-white border-2 rounded-lg shadow-sm transition-all duration-200 ${
                        match.status === 'COMPLETED' 
                          ? 'border-green-200 bg-green-50' 
                          : match.status === 'IN_PROGRESS'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${expandedView ? 'p-6' : 'p-4'}`}>
                        <div className="text-center mb-3">
                          <div className="flex items-center justify-center space-x-2">
                            <span className={`text-xs font-medium ${
                              match.status === 'COMPLETED' ? 'text-green-600' :
                              match.status === 'IN_PROGRESS' ? 'text-blue-600' :
                              'text-gray-500'
                            }`}>
                              Trận {matchIndex + 1}
                            </span>
                            {match.status === 'IN_PROGRESS' && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          {expandedView && match.scheduledTime && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(match.scheduledTime).toLocaleString('vi-VN')}
                            </div>
                          )}
                        </div>

                        <div className={`space-y-${expandedView ? '3' : '2'}`}>
                          {/* Team 1 */}
                          <div className={`${expandedView ? 'p-3' : 'p-2'} rounded-lg border-2 transition-all ${
                            match.winnerId === match.team1?.id 
                              ? 'bg-green-100 border-green-300 shadow-sm' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {match.winnerId === match.team1?.id && (
                                  <Trophy className="h-4 w-4 text-green-600" />
                                )}
                                <span className={`font-medium ${expandedView ? 'text-base' : 'text-sm'} ${
                                  match.team1?.name ? 'text-gray-900' : 'text-gray-400 italic'
                                }`}>
                                  {match.team1?.name || 'Chưa xác định'}
                                </span>
                              </div>
                              {match.team1Score !== undefined && (
                                <span className={`font-bold ${
                                  expandedView ? 'text-xl' : 'text-sm'
                                } ${
                                  match.winnerId === match.team1?.id ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {match.team1Score}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* VS */}
                          <div className={`text-center font-medium ${
                            expandedView ? 'text-sm text-gray-500' : 'text-xs text-gray-400'
                          }`}>
                            {match.status === 'IN_PROGRESS' ? 'TRỰC TIẾP' : 'VS'}
                          </div>

                          {/* Team 2 */}
                          <div className={`${expandedView ? 'p-3' : 'p-2'} rounded-lg border-2 transition-all ${
                            match.winnerId === match.team2?.id 
                              ? 'bg-green-100 border-green-300 shadow-sm' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {match.winnerId === match.team2?.id && (
                                  <Trophy className="h-4 w-4 text-green-600" />
                                )}
                                <span className={`font-medium ${expandedView ? 'text-base' : 'text-sm'} ${
                                  match.team2?.name ? 'text-gray-900' : 'text-gray-400 italic'
                                }`}>
                                  {match.team2?.name || 'Chưa xác định'}
                                </span>
                              </div>
                              {match.team2Score !== undefined && (
                                <span className={`font-bold ${
                                  expandedView ? 'text-xl' : 'text-sm'
                                } ${
                                  match.winnerId === match.team2?.id ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {match.team2Score}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match Status */}
                        <div className="mt-3 text-center">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${
                            match.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : match.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {match.status === 'COMPLETED' && <Trophy className="h-3 w-3" />}
                            {match.status === 'IN_PROGRESS' && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
                            <span>
                              {match.status === 'COMPLETED' && 'ĐÃ HOÀN THÀNH'}
                              {match.status === 'IN_PROGRESS' && 'ĐANG DIỄN RA'}
                              {match.status === 'PENDING' && 'ĐANG CHỜ'}
                              {!match.status && 'ĐANG CHỜ'}
                            </span>
                          </span>
                        </div>

                        {/* Match Time - Only show in compact view */}
                        {!expandedView && match.scheduledTime && (
                          <div className="mt-2 text-center">
                            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(match.scheduledTime).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tournament Winner */}
      {bracketData.winner && (
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