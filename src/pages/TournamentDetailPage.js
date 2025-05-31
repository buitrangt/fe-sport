import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import {
  Calendar,
  Users,
  MapPin,
  Trophy,
  ArrowLeft,
  Clock,
  Target,
  Award,
  Settings,
  Play,
  UserPlus
} from 'lucide-react';
import { tournamentService, teamService, matchService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TournamentBracketGenerator from '../components/tournament/TournamentBracketGenerator';
import RoundManager from '../components/tournament/RoundManager';
import TournamentBracketView from '../components/tournament/TournamentBracketView';
import MatchResultsManager from '../components/tournament/MatchResultsManager';
import TeamRegistrationModal from '../components/tournament/TeamRegistrationModal';
import TournamentManagement from '../components/tournament/TournamentManagement';
import TournamentWorkflowGuide from '../components/tournament/TournamentWorkflowGuide';
import { formatDate, formatDateTime, getStatusColor } from '../utils/helpers';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const { data: tournament, isLoading: tournamentLoading, refetch: refetchTournament } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    { staleTime: 1000 } // 1 giây để cập nhật nhanh
  );

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery(
    ['tournament-teams', id],
    () => teamService.getTeamsByTournament(id),
    {
      staleTime: 1000, // 1 giây để cập nhật nhanh
      enabled: !!id,
      onSuccess: (data) => {
        console.log('👥 [TournamentDetailPage] Dữ liệu đội đã tải:', data);
      },
      onError: (error) => {
        console.error('❌ [TournamentDetailPage] Tải đội thất bại:', error);
      }
    }
  );

  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery(
    ['tournament-matches', id],
    () => matchService.getMatchesByTournament(id),
    {
      staleTime: 1000, // 1 giây để cập nhật nhanh
      enabled: !!id
    }
  );

  const { data: currentRoundData, isLoading: currentRoundLoading, error: currentRoundError } = useQuery(
    ['tournament-current-round', id],
    () => {
      console.log('🚀 [getCurrentRound] API call đã được kích hoạt cho giải đấu:', id);
      return tournamentService.getCurrentRound(id);
    },
    {
      staleTime: 1000, // 1 giây để cập nhật nhanh
      enabled: !!id, // Kích hoạt cho tất cả trạng thái giải đấu
      onSuccess: (data) => {
        console.log('✅ [getCurrentRound] API thành công:', data);
      },
      onError: (error) => {
        console.error('❌ [getCurrentRound] Lỗi API:', error);
      }
    }
  );

  const { data: bracket, isLoading: bracketLoading, refetch: refetchBracket } = useQuery(
    ['tournament-bracket', id],
    () => matchService.getTournamentBracket(id),
    {
      staleTime: 1000, // 1 giây để cập nhật nhanh
      enabled: !!id && (tournament?.data?.status === 'READY' || tournament?.data?.status === 'ONGOING' || tournament?.data?.status === 'COMPLETED')
    }
  );

  const handleBracketGenerated = (bracketData) => {
    refetchTournament();
    refetchBracket();
    refetchMatches();
  };

  const handleRoundAdvanced = (roundData) => {
    refetchMatches();
    refetchBracket();
    refetchTournament();
    // Làm mới dữ liệu vòng hiện tại
    queryClient.invalidateQueries(['tournament-current-round', id]);
  };

  if (tournamentLoading) {
    return <LoadingSpinner />;
  }

  if (!tournament?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giải đấu</h2>
          <Link to="/tournaments" className="text-primary-600 hover:text-primary-700">
            ← Quay lại danh sách giải đấu
          </Link>
        </div>
      </div>
    );
  }

  const tournamentData = tournament.data;

  // Kiểm tra an toàn cho tournamentData
  if (!tournamentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  const canRegister = user && !isAdmin && (tournamentData.status === 'REGISTRATION' || tournamentData.status === 'UPCOMING');

  // Trích xuất dữ liệu trận đấu một cách an toàn
  const matchesData = matches?.data || matches || {};

  // Lấy vòng hiện tại từ dữ liệu giải đấu trước, sau đó tính toán dự phòng
  let currentRound = 1;

  // Debug: Ghi lại tất cả các nguồn dữ liệu có thể có
  console.log('🔍 [DEBUG] Nguồn dữ liệu cho vòng hiện tại:');
  console.log('  currentRoundData:', currentRoundData);
  console.log('  currentRoundData?.data:', currentRoundData?.data);
  console.log('  currentRoundData?.data?.data:', currentRoundData?.data?.data);
  console.log('  tournamentData.currentRound:', tournamentData.currentRound);
  console.log('  bracket?.data?.currentRound:', bracket?.data?.currentRound);

  // Phương pháp 1: Sử dụng API vòng hiện tại chuyên dụng
  if (currentRoundData?.data?.data?.currentRound) {
    // Định dạng phản hồi API chuẩn
    currentRound = currentRoundData.data.data.currentRound;
    console.log('🎯 [TournamentDetailPage] Đang sử dụng currentRound từ API (chuẩn):', currentRound);
  }
  else if (currentRoundData?.data?.currentRound) {
    // Định dạng dự phòng
    currentRound = currentRoundData.data.currentRound;
    console.log('🎯 [TournamentDetailPage] Đang sử dụng currentRound từ API (dự phòng):', currentRound);
  }
  // Phương pháp 2: Kiểm tra xem backend có trả về currentRound trong dữ liệu giải đấu không
  else if (tournamentData.currentRound) {
    currentRound = tournamentData.currentRound;
    console.log('🎯 [TournamentDetailPage] Đang sử dụng currentRound từ dữ liệu giải đấu:', currentRound);
  }
  // Phương pháp 3: Kiểm tra dữ liệu bảng đấu để tìm vòng hiện tại
  else if (bracket?.data?.currentRound) {
    currentRound = bracket.data.currentRound;
    console.log('🎯 [TournamentDetailPage] Đang sử dụng currentRound từ bảng đấu:', currentRound);
  }
  // Phương pháp 4: Tính toán dự phòng dựa trên dữ liệu trận đấu
  else if (matchesData?.matches?.length > 0) {
    // Tìm vòng cao nhất có trận đấu
    const rounds = matchesData.matches.map(m => m.round || 1);
    const maxRound = Math.max(...rounds);

    // Tìm các vòng có trận đấu chưa hoàn thành
    const incompleteRounds = [];
    for (let round = 1; round <= maxRound; round++) {
      const roundMatches = matchesData.matches.filter(m => (m.round || 1) === round);
      const completed = roundMatches.filter(m => m.status === 'COMPLETED').length;
      if (completed < roundMatches.length) {
        incompleteRounds.push(round);
      }
    }

    // Logic vòng hiện tại
    if (incompleteRounds.length > 0) {
      // Có các vòng chưa hoàn thành - vòng hiện tại là vòng chưa hoàn thành thấp nhất
      currentRound = Math.min(...incompleteRounds);
    } else {
      // Tất cả các vòng hiện có đã hoàn thành - vòng hiện tại là vòng tiếp theo (maxRound + 1)
      currentRound = maxRound + 1;
    }

    console.log('🔍 [TournamentDetailPage] currentRound được tính toán:', currentRound);
  }

  console.log('🎯 [CUỐI CÙNG] Kết quả vòng hiện tại:', currentRound);
  const matchesList = matchesData?.matches || [];
  const roundMatches = matchesList.filter(match => match.round === currentRound) || [];

  // Ghi nhật ký gỡ lỗi
  console.log('🔍 [TournamentDetailPage] Tính toán vòng ĐÃ SỬA:', {
    matchesCount: matchesList.length,
    currentRound,
    roundMatches: roundMatches.length,
    allRounds: (() => {
      const roundsInfo = {};
      const allRounds = matchesList.map(m => m.round || 1);
      const maxRound = allRounds.length > 0 ? Math.max(...allRounds) : 1;
      for (let r = 1; r <= maxRound; r++) {
        const rMatches = matchesList.filter(m => (m.round || 1) === r);
        const completed = rMatches.filter(m => m.status === 'COMPLETED').length;
        roundsInfo[`Vòng ${r}`] = `${completed}/${rMatches.length} đã hoàn thành`;
      }
      return roundsInfo;
    })()
  });

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: Trophy },
    { id: 'teams', name: 'Đội', icon: Users },
    { id: 'matches', name: 'Trận đấu', icon: Play },
    { id: 'bracket', name: 'Bảng đấu', icon: Target },
    ...(isAdmin ? [
      { id: 'match-results', name: 'Kết quả trận đấu', icon: Award },
      { id: 'round-management', name: 'Quản lý vòng đấu', icon: ArrowLeft },
      { id: 'management', name: 'Quản lý', icon: Settings }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/tournaments"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Quay lại danh sách giải đấu
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tournamentData.name}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournamentData.status)}`}>
                  {tournamentData.status}
                </div>
              </div>
              <p className="text-lg text-gray-600">{tournamentData.description}</p>

              {/* Banner vô địch giải đấu */}
              {tournamentData.winnerTeam && tournamentData.status === 'COMPLETED' && (
                <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">🏆 Nhà vô địch giải đấu</p>
                      <p className="text-xl font-bold text-gray-900">{tournamentData.winnerTeam.name}</p>
                      {tournamentData.runnerUpTeam && (
                        <p className="text-sm text-gray-600">Á quân: {tournamentData.runnerUpTeam.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              {canRegister && (
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký tham gia</span>
                </button>
              )}

              {isAdmin && (tournamentData.status === 'ONGOING' || tournamentData.status === 'READY') && (
                <button
                  onClick={() => setShowWorkflowGuide(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Hướng dẫn quy trình</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'management' && isAdmin) {
                        // Chuyển hướng đến trang admin mới
                        navigate(`/admin/tournaments/${id}`);
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nội dung Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nội dung chính */}
            <div className="lg:col-span-2">
              {/* Vô địch giải đấu */}
              {tournamentData.status === 'COMPLETED' && tournamentData.winnerTeam && (
                <div className="card mb-8 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300">
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Trophy className="h-16 w-16 text-yellow-600" />
                        <div className="absolute -top-2 -right-2 text-2xl">🎆</div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Nhà vô địch giải đấu! 🎉</h2>
                    <p className="text-xl font-semibold text-yellow-800 mb-4">{tournamentData.winnerTeam.name}</p>
                    <div className="flex justify-center space-x-8 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">🥇</div>
                        <div>Nhà vô địch</div>
                        <div className="font-medium">{tournamentData.winnerTeam.name}</div>
                      </div>
                      {tournamentData.runnerUpTeam && (
                        <div className="text-center">
                          <div className="font-bold text-lg text-gray-900">🥈</div>
                          <div>Á quân</div>
                          <div className="font-medium">{tournamentData.runnerUpTeam.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin giải đấu */}
              <div className="card mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin giải đấu</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                        <p className="font-medium">{formatDate(tournamentData.startDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày kết thúc</p>
                        <p className="font-medium">{formatDate(tournamentData.endDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Sức chứa đội</p>
                        <p className="font-medium">{teams?.data?.length || 0} / {tournamentData.maxTeams} đội</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Địa điểm</p>
                        <p className="font-medium">{tournamentData.location || 'Chưa xác định'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Môn thể thao</p>
                        <p className="font-medium">{tournamentData.sportType || 'Chưa xác định'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phí tham gia</p>
                        <p className="font-medium">{tournamentData.registrationFee ? `${tournamentData.registrationFee.toLocaleString()} VND` : 'Miễn phí'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Matches */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Các trận đấu gần đây</h2>
                {matchesLoading ? (
                  <LoadingSpinner />
                ) : matchesList.length === 0 ? (
                  <p className="text-gray-600">Chưa có trận đấu nào được tạo.</p>
                ) : (
                  <div className="space-y-4">
                    {matchesList.slice(0, 5).map((match) => (
                      <div key={match.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="font-medium text-gray-700">
                            {match.team1?.name || 'Đội 1'} vs {match.team2?.name || 'Đội 2'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(match.status)}`}>
                            {match.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Vòng {match.round}</span>
                          <span>{formatDateTime(match.matchDate)}</span>
                        </div>
                        {match.status === 'COMPLETED' && (
                          <div className="text-sm font-bold text-gray-900 mt-2">
                            {match.score1} - {match.score2}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {matchesList.length > 5 && (
                  <div className="mt-4 text-center">
                    <button onClick={() => setActiveTab('matches')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Xem tất cả trận đấu
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Current Round */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Vòng hiện tại</h3>
                {currentRoundLoading ? (
                  <LoadingSpinner />
                ) : currentRoundError ? (
                  <p className="text-red-600">Lỗi tải vòng hiện tại: {currentRoundError.message}</p>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 text-lg font-semibold text-primary-600 mb-3">
                      <Target className="h-6 w-6" />
                      <span>Vòng {currentRound}</span>
                    </div>
                    {roundMatches.length === 0 ? (
                      <p className="text-gray-600">Chưa có trận đấu nào trong vòng này.</p>
                    ) : (
                      <ul className="space-y-3">
                        {roundMatches.slice(0, 3).map((match) => (
                          <li key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                            <div>
                              <p className="font-medium text-gray-900">{match.team1?.name || 'Đội 1'} vs {match.team2?.name || 'Đội 2'}</p>
                              <p className="text-xs text-gray-500">{formatDateTime(match.matchDate)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                              {match.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {roundMatches.length > 3 && (
                      <div className="mt-4 text-center">
                        <button onClick={() => setActiveTab('matches')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Xem tất cả trận đấu trong vòng này
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Tournament Progress */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tiến độ giải đấu</h3>
                {matchesLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Trận đấu đã hoàn thành</span>
                      <span className="text-sm text-gray-600">
                        {matchesList.filter(m => m.status === 'COMPLETED').length} / {matchesList.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(matchesList.filter(m => m.status === 'COMPLETED').length / (matchesList.length || 1)) * 100}%` }}
                      ></div>
                    </div>

                    {matchesList.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span>Tổng số trận đã tạo: <span className="font-semibold">{matchesList.length}</span></span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Teams */}
        {activeTab === 'teams' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Các đội tham gia</h2>
            {teamsLoading ? (
              <LoadingSpinner />
            ) : teams?.data?.length === 0 ? (
              <p className="text-gray-600">Hiện chưa có đội nào đăng ký cho giải đấu này.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.data.map((team) => (
                  <div key={team.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center space-x-4">
                    <Users className="h-8 w-8 text-primary-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">Thành viên: {team.members?.length || 0}</p>
                      <p className="text-xs text-gray-500">Đăng ký vào: {formatDate(team.registrationDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Matches */}
        {activeTab === 'matches' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tất cả trận đấu</h2>
            {matchesLoading ? (
              <LoadingSpinner />
            ) : matchesList.length === 0 ? (
              <p className="text-gray-600">Hiện chưa có trận đấu nào được tạo cho giải đấu này.</p>
            ) : (
              <div className="space-y-4">
                {matchesList.sort((a, b) => a.round - b.round || new Date(a.matchDate) - new Date(b.matchDate)).map((match) => (
                  <div key={match.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {match.team1?.name || 'Đội 1'} vs {match.team2?.name || 'Đội 2'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
                        {match.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p><span className="font-medium">Vòng:</span> {match.round}</p>
                        <p><span className="font-medium">Thời gian:</span> {formatDateTime(match.matchDate)}</p>
                      </div>
                      <div>
                        {match.status === 'COMPLETED' && (
                          <p><span className="font-medium">Tỷ số:</span> {match.score1} - {match.score2}</p>
                        )}
                        <p><span className="font-medium">Địa điểm:</span> {match.location || 'Chưa xác định'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Bracket */}
        {activeTab === 'bracket' && (
          <div className="space-y-6">
            {tournamentData.status === 'REGISTRATION' || tournamentData.status === 'UPCOMING' ? (
              <div className="card text-center py-8">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Bảng đấu chưa có sẵn</h3>
                <p className="text-gray-600">Bảng đấu sẽ được tạo sau khi giai đoạn đăng ký kết thúc và giải đấu bắt đầu.</p>
                {isAdmin && (
                  <div className="mt-6">
                    <TournamentBracketGenerator tournamentId={id} onBracketGenerated={handleBracketGenerated} />
                  </div>
                )}
              </div>
            ) : (
              <TournamentBracketView tournament={tournamentData} />
            )}
          </div>
        )}

        {/* Tab Match Results (Admin only) */}
        {isAdmin && activeTab === 'match-results' && (
          <MatchResultsManager
            tournamentId={id}
            matches={matchesList}
            onUpdateSuccess={() => {
              refetchMatches();
              refetchBracket();
              refetchTournament(); // To update winnerTeam if available
            }}
            isLoading={matchesLoading}
          />
        )}

        {/* Tab Round Management (Admin only) */}
        {isAdmin && activeTab === 'round-management' && (
          <RoundManager
            tournament={tournamentData}
            currentRound={currentRound}
            onRoundAdvanced={handleRoundAdvanced}
            onBracketGenerated={handleBracketGenerated}
            matches={matchesList}
          />
        )}

        {/* Tab Management (Admin only) - Redirects to /admin/tournaments/{id} */}
        {/* This tab's content is handled by the navigation to a dedicated admin page */}

      </div>

      {/* Team Registration Modal */}
      {showRegistrationModal && (
        <TeamRegistrationModal
          tournamentId={id}
          maxTeams={tournamentData.maxTeams}
          currentRegisteredTeams={teams?.data?.length || 0}
          onClose={() => setShowRegistrationModal(false)}
          onRegistrationSuccess={() => {
            setShowRegistrationModal(false);
            refetchTeams(); // Refresh team list after successful registration
            refetchTournament(); // To update currentTeams count on overview if backend provides it
          }}
        />
      )}

      {/* Tournament Workflow Guide Modal */}
      {showWorkflowGuide && (
        <TournamentWorkflowGuide
          onClose={() => setShowWorkflowGuide(false)}
          tournamentStatus={tournamentData.status}
          tournamentId={id}
        />
      )}
    </div>
  );
};

export default TournamentDetailPage;