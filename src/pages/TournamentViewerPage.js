import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Play, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Filter,
  Search,
  Maximize2,
  Star,
  Award
} from 'lucide-react';
import { tournamentService, matchService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';

const TournamentViewerPage = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'bracket'
  const [roundFilter, setRoundFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'public-tournaments',
    () => tournamentService.getAllTournaments(),
    {
      staleTime: 30000,
      onSuccess: (data) => {
        if (!selectedTournament && data?.data?.length > 0) {
          // Auto-select first ongoing or completed tournament
          const ongoingTournament = data.data.find(t => t.status === 'ONGOING' || t.status === 'COMPLETED');
          setSelectedTournament(ongoingTournament || data.data[0]);
        }
      }
    }
  );

  // Fetch matches for selected tournament
  const { data: matchesData, isLoading: matchesLoading, refetch: refetchMatches } = useQuery(
    ['public-matches', selectedTournament?.id],
    () => matchService.getMatchesByTournament(selectedTournament.id),
    {
      enabled: !!selectedTournament?.id,
      staleTime: 10000,
      onSuccess: (data) => {
        console.log('🎯 [TournamentViewer] Matches data:', data);
      }
    }
  );

  // Fetch tournament bracket
  const { data: bracketData, isLoading: bracketLoading } = useQuery(
    ['public-bracket', selectedTournament?.id],
    () => matchService.getTournamentBracket(selectedTournament.id),
    {
      enabled: !!selectedTournament?.id && viewMode === 'bracket',
      staleTime: 15000
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
    console.error('Error extracting matches data:', err);
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

  // Filter matches
  const filteredMatches = allMatches.filter(match => {
    const matchesRound = roundFilter === 'ALL' || match.roundNumber === parseInt(roundFilter);
    const matchesStatus = statusFilter === 'ALL' || match.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
                         match.team1?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.team2?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.roundName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRound && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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
  const completedMatches = allMatches.filter(m => m.status === 'COMPLETED').length;
  const totalMatches = allMatches.length;
  const liveMatches = allMatches.filter(m => m.status === 'IN_PROGRESS').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Eye className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Xem Trận đấu</h1>
            <p className="text-purple-100">0/0 hoàn thành - Theo dõi trực tiếp các trận đấu</p>
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
                  {tournament.winnerTeam && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-yellow-600">
                      <Award className="h-3 w-3" />
                      <span>Vô địch: {tournament.winnerTeam.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    tournament.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                    tournament.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                    tournament.status === 'REGISTRATION' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status === 'ONGOING' ? 'Đang diễn ra' :
                     tournament.status === 'COMPLETED' ? 'Đã kết thúc' :
                     tournament.status === 'REGISTRATION' ? 'Đang đăng ký' : tournament.status}
                  </span>
                  {tournament.status === 'ONGOING' && (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament Details and Matches */}
      {selectedTournament && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-medium">Tổng trận</div>
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
                  <div className="text-sm text-green-600 font-medium">Hoàn thành</div>
                  <div className="text-xl font-bold text-green-900">{completedMatches}</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Play className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-red-600 font-medium">Đang diễn ra</div>
                  <div className="text-xl font-bold text-red-900">{liveMatches}</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-purple-600 font-medium">Vòng đấu</div>
                  <div className="text-xl font-bold text-purple-900">{rounds.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode and Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTournament.name} - Trận đấu
                </h3>
                <p className="text-gray-600">Theo dõi lịch thi đấu và kết quả</p>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                      viewMode === 'list'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Danh sách
                  </button>
                  <button
                    onClick={() => setViewMode('bracket')}
                    className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                      viewMode === 'bracket'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bracket
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đội, vòng đấu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Round Filter */}
                <select
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ALL">Tất cả vòng</option>
                  {rounds.map(round => (
                    <option key={round.roundNumber} value={round.roundNumber}>
                      {round.roundName}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="SCHEDULED">Đã lên lịch</option>
                  <option value="IN_PROGRESS">Đang diễn ra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'list' ? (
            /* List View */
            <div className="space-y-6">
              {matchesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-3 text-gray-600">Đang tải trận đấu...</span>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="card text-center py-8">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Không có trận đấu</h4>
                  <p className="text-gray-600">
                    {searchTerm || roundFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'Không tìm thấy trận đấu phù hợp với bộ lọc.'
                      : 'Chưa có trận đấu nào được tạo cho giải đấu này.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredMatches.map((match, index) => (
                    <div key={match.id} className="card border hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary-100 p-2 rounded-full">
                            <Trophy className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {match.roundName} - Trận {match.matchNumber || index + 1}
                            </h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {match.matchDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(match.matchDate).toLocaleString('vi-VN')}</span>
                                </div>
                              )}
                              {match.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{match.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(match.status)}`}>
                          {getStatusIcon(match.status)}
                          <span>
                            {match.status === 'COMPLETED' ? 'Hoàn thành' :
                             match.status === 'IN_PROGRESS' ? 'Đang diễn ra' :
                             match.status === 'SCHEDULED' ? 'Đã lên lịch' : 'Chờ'}
                          </span>
                          {match.status === 'IN_PROGRESS' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></div>
                          )}
                        </span>
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
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>Thắng</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              {match.team1Score !== undefined ? match.team1Score : '-'}
                            </span>
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-600">
                            {match.status === 'IN_PROGRESS' ? 'LIVE' : 'VS'}
                          </div>
                          {match.status === 'IN_PROGRESS' && (
                            <div className="text-xs text-red-600 font-medium animate-pulse">
                              Đang diễn ra
                            </div>
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
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>Thắng</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              {match.team2Score !== undefined ? match.team2Score : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Bracket View */
            <div className="card">
              {bracketLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-3 text-gray-600">Đang tải bracket...</span>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Maximize2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Bracket View</h4>
                  <p className="text-gray-600">Chế độ xem bracket đang được phát triển.</p>
                  <button
                    onClick={() => setViewMode('list')}
                    className="mt-4 btn-primary"
                  >
                    Chuyển về danh sách
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentViewerPage;