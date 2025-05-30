import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
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
  UserPlus,
  Info, // Thêm icon cho thông tin
  ListChecks // Thêm icon cho workflow
} from 'lucide-react';
import { tournamentService, teamService, matchService } from '../../services'; // Đảm bảo đường dẫn đúng
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import TournamentBracketGenerator from '../tournament/TournamentBracketGenerator';
import RoundManager from '../tournament/RoundManager';
import TournamentBracketView from '../tournament/TournamentBracketView';
import MatchResultsManager from '../tournament/MatchResultsManager';
import TeamRegistrationModal from '../tournament/TeamRegistrationModal';
// import TournamentManagement from '../tournament/TournamentManagement'; // Không cần import TournamentManagement vào đây
import TournamentWorkflowGuide from '../tournament/TournamentWorkflowGuide';
import { formatDate, formatDateTime, getStatusColor, getTournamentStatusLabel } from '../../utils/helpers'; // Import getTournamentStatusLabel
import toast from 'react-hot-toast'; // Import toast

const AdminTournamentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false); // Có thể ẩn modal này nếu admin không đăng ký
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  // Chỉ cho phép admin và organizer truy cập trang này
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  // Điều hướng nếu không phải admin/organizer
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang quản lý giải đấu này.');
      navigate('/dashboard'); // Chuyển hướng về trang dashboard hoặc trang khác
    }
  }, [isAdmin, navigate]);

  const { data: tournament, isLoading: tournamentLoading, refetch: refetchTournament } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    { staleTime: 1000 }
  );

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery(
    ['tournament-teams', id],
    () => teamService.getTeamsByTournament(id),
    {
      staleTime: 1000,
      enabled: !!id,
      onSuccess: (data) => {
        // console.log('👥 [AdminTournamentDetailPage] Dữ liệu đội tải thành công:', data);
      },
      onError: (error) => {
        console.error('❌ [AdminTournamentDetailPage] Tải dữ liệu đội thất bại:', error);
        toast.error('Lỗi khi tải danh sách đội.');
      }
    }
  );

  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery(
    ['tournament-matches', id],
    () => matchService.getMatchesByTournament(id),
    {
      staleTime: 1000,
      enabled: !!id
    }
  );

  const { data: currentRoundData, isLoading: currentRoundLoading, error: currentRoundError } = useQuery(
    ['tournament-current-round', id],
    () => {
      // console.log('🚀 [getCurrentRound] API call triggered for tournament:', id);
      return tournamentService.getCurrentRound(id);
    },
    {
      staleTime: 1000,
      enabled: !!id,
      onSuccess: (data) => {
        // console.log('✅ [getCurrentRound] API success:', data);
      },
      onError: (error) => {
        console.error('❌ [getCurrentRound] API error:', error);
        toast.error('Lỗi khi lấy thông tin vòng hiện tại.');
      }
    }
  );

  const { data: bracket, isLoading: bracketLoading, refetch: refetchBracket } = useQuery(
    ['tournament-bracket', id],
    () => matchService.getTournamentBracket(id),
    {
      staleTime: 1000,
      enabled: !!id && (tournament?.data?.status === 'READY' || tournament?.data?.status === 'ONGOING' || tournament?.data?.status === 'COMPLETED')
    }
  );

  const handleBracketGenerated = (bracketData) => {
    refetchTournament();
    refetchBracket();
    refetchMatches();
    toast.success('Đã tạo cây thi đấu thành công!');
  };

  const handleRoundAdvanced = (roundData) => {
    refetchMatches();
    refetchBracket();
    refetchTournament();
    queryClient.invalidateQueries(['tournament-current-round', id]);
    toast.success('Đã chuyển sang vòng tiếp theo!');
  };

  const handleMatchResultUpdated = () => {
    refetchMatches();
    refetchBracket();
    refetchTournament();
    queryClient.invalidateQueries(['tournament-current-round', id]);
    toast.success('Kết quả trận đấu đã được cập nhật!');
  };


  if (tournamentLoading || !isAdmin) { // Kiểm tra isAdmin ở đây nữa để hiển thị loading trước khi điều hướng
    return <LoadingSpinner text="Đang tải chi tiết giải đấu..." />;
  }

  if (!tournament?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giải đấu</h2>
          <Link to="/admin/tournaments" className="text-primary-600 hover:text-primary-700">
            ← Quay lại danh sách giải đấu
          </Link>
        </div>
      </div>
    );
  }

  const tournamentData = tournament.data;

  // Safe extraction of matches data
  const matchesData = matches?.data || matches || {};

  let currentRound = 1;

  if (currentRoundData?.data?.data?.currentRound) {
    currentRound = currentRoundData.data.data.currentRound;
  }
  else if (currentRoundData?.data?.currentRound) {
    currentRound = currentRoundData.data.currentRound;
  }
  else if (tournamentData.currentRound) {
    currentRound = tournamentData.currentRound;
  }
  else if (bracket?.data?.currentRound) {
    currentRound = bracket.data.currentRound;
  }
  else if (matchesData?.matches?.length > 0) {
    const rounds = matchesData.matches.map(m => m.round || 1);
    const maxRound = Math.max(...rounds);

    const incompleteRounds = [];
    for (let round = 1; round <= maxRound; round++) {
      const roundMatches = matchesData.matches.filter(m => (m.round || 1) === round);
      const completed = roundMatches.filter(m => m.status === 'COMPLETED').length;
      if (completed < roundMatches.length) {
        incompleteRounds.push(round);
      }
    }

    if (incompleteRounds.length > 0) {
      currentRound = Math.min(...incompleteRounds);
    } else {
      currentRound = maxRound + 1;
    }
  }

  const matchesList = matchesData?.matches || [];
  const roundMatches = matchesList.filter(match => match.round === currentRound) || [];


  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: Info },
    { id: 'teams', name: 'Đội thi đấu', icon: Users },
    { id: 'matches', name: 'Trận đấu', icon: Play },
    { id: 'bracket', name: 'Cây thi đấu', icon: Target },
    // Các tab dành riêng cho quản trị
    { id: 'match-results', name: 'Kết quả trận đấu', icon: Award },
    { id: 'round-management', name: 'Quản lý vòng đấu', icon: Clock },
    { id: 'management', name: 'Thiết lập & Điều khiển', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/admin/tournaments" // Chuyển hướng về trang quản lý giải đấu của admin
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Quay lại Quản lý Giải đấu
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tournamentData.name}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournamentData.status)}`}>
                  {getTournamentStatusLabel(tournamentData.status)} {/* Sử dụng helper để hiển thị tên trạng thái tiếng Việt */}
                </div>
              </div>
              <p className="text-lg text-gray-600">{tournamentData.description}</p>

              {/* Tournament Champion Banner - Giữ nguyên nếu admin vẫn muốn thấy thông tin này */}
              {tournamentData.winnerTeam && tournamentData.status === 'COMPLETED' && (
                <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">🏆 Nhà vô địch Giải đấu</p>
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
              {/* Nút đăng ký tham gia có thể được loại bỏ hoặc ẩn nếu admin không cần chức năng này */}
              {/* <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký tham gia</span>
                </button>
              */}

              {(tournamentData.status === 'ONGOING' || tournamentData.status === 'READY' || tournamentData.status === 'REGISTRATION') && (
                <button
                  onClick={() => setShowWorkflowGuide(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ListChecks className="h-4 w-4" /> {/* Đổi icon cho workflow guide */}
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
                    onClick={() => setActiveTab(tab.id)}
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
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tournament Champion Celebration */}
              {tournamentData.status === 'COMPLETED' && tournamentData.winnerTeam && (
                <div className="card mb-8 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300">
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Trophy className="h-16 w-16 text-yellow-600" />
                        <div className="absolute -top-2 -right-2 text-2xl">🎆</div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Giải đấu đã hoàn thành! 🎉</h2>
                    <p className="text-xl font-semibold text-yellow-800 mb-4">{tournamentData.winnerTeam.name} là Nhà vô địch!</p>
                    <div className="flex justify-center space-x-8 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">🥇</div>
                        <div>Vô địch</div>
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

              {/* Tournament Info */}
              <div className="card mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin Giải đấu</h2>

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
                    {tournamentData.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Địa điểm</p>
                          <p className="font-medium">{tournamentData.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Loại hình giải đấu</p>
                        <p className="font-medium">{tournamentData.type || 'Tiêu chuẩn'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Thể thức</p>
                        <p className="font-medium">{tournamentData.format || 'Knockout'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {tournamentData.rules && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Luật & Quy định</h3>
                    <div className="prose text-gray-600">
                      <p>{tournamentData.rules}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tournament Champion & Runner-up */}
              {(tournamentData.winnerTeam || tournamentData.runnerUpTeam) && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span>Kết quả Giải đấu</span>
                  </h3>

                  {/* Champion */}
                  {tournamentData.winnerTeam && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-yellow-800">🥇 Vô địch</p>
                          </div>
                          <p className="font-bold text-lg text-yellow-900">{tournamentData.winnerTeam.name}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Runner-up */}
                  {tournamentData.runnerUpTeam && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-700">🥈 Á quân</p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">{tournamentData.runnerUpTeam.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đội đã đăng ký</span>
                    <span className="font-medium">{teams?.data?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng số trận đấu</span>
                    <span className="font-medium">{matchesData?.totalMatches || matchesList.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trận đấu đã hoàn thành</span>
                    <span className="font-medium">{matchesData?.completedMatches || matchesList.filter(m => m?.status === 'COMPLETED').length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vòng hiện tại</span>
                    <span className="font-medium">{currentRound || 1}</span>
                  </div>
                </div>
              </div>

              {/* Tournament Organizer */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ban tổ chức</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-sports-purple rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tournamentData.organizer || 'EduSports'}</p>
                    <p className="text-sm text-gray-500">Người tổ chức giải đấu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Các đội đã đăng ký</h2>
              <span className="text-sm text-gray-500">
                {teams?.data?.length || 0} đội đã đăng ký
              </span>
            </div>

            {teamsLoading ? (
              <LoadingSpinner size="small" />
            ) : teams?.data?.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Chưa có đội nào đăng ký</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams?.data?.map((team, index) => (
                  <div key={team.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-500">{team.memberCount || 0} thành viên</p>
                      </div>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Đăng ký: {formatDate(team.registrationDate || team.createdAt)}</span>
                      <div className={`px-2 py-1 rounded-full ${getStatusColor(team.status || 'APPROVED')}`}>
                        {team.status || 'Đã duyệt'} {/* Có thể dịch trạng thái đội nếu cần */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            {matchesLoading ? (
              <LoadingSpinner />
            ) : matchesList.length === 0 ? (
              <div className="card text-center py-12">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trận đấu nào</h3>
                <p className="text-gray-600">
                  Các trận đấu sẽ có sẵn sau khi cây thi đấu giải đấu được tạo.
                </p>
                {/* Luôn hiển thị generator cho admin */}
                {isAdmin && tournamentData.status === 'REGISTRATION' && (
                  <div className="mt-6">
                    <TournamentBracketGenerator
                      tournament={tournamentData}
                      onBracketGenerated={handleBracketGenerated}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Các trận đấu của giải đấu</h2>
                <div className="space-y-4">
                  {matchesList.map((match) => (
                    <div key={match.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`text-center min-w-24 p-2 rounded-lg ${
                            match.winnerTeam?.id === match.team1?.id
                              ? 'bg-green-100 border-2 border-green-300'
                              : match.status === 'COMPLETED' && match.winnerTeam?.id !== match.team1?.id
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="font-medium text-gray-900 flex items-center justify-center">
                              {match.team1?.name || 'Chưa xác định'}
                              {match.winnerTeam?.id === match.team1?.id && (
                                <Trophy className="h-4 w-4 text-green-600 ml-1" />
                              )}
                            </p>
                            <p className="text-3xl font-bold text-primary-600">{match.team1Score || 0}</p>
                          </div>

                          <div className="text-gray-400 font-medium">VS</div>

                          <div className={`text-center min-w-24 p-2 rounded-lg ${
                            match.winnerTeam?.id === match.team2?.id
                              ? 'bg-green-100 border-2 border-green-300'
                              : match.status === 'COMPLETED' && match.winnerTeam?.id !== match.team2?.id
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="font-medium text-gray-900 flex items-center justify-center">
                              {match.team2?.name || 'Chưa xác định'}
                              {match.winnerTeam?.id === match.team2?.id && (
                                <Trophy className="h-4 w-4 text-green-600 ml-1" />
                              )}
                            </p>
                            <p className="text-3xl font-bold text-primary-600">{match.team2Score || 0}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            Vòng {match.round || 1} • Trận {match.matchNumber || 1}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            {formatDateTime(match.scheduledTime)}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {getTournamentStatusLabel(match.status)} {/* Sử dụng helper nếu match.status có nhãn tiếng Việt */}
                          </div>

                          {/* Winner Display */}
                          {match.winnerTeam && match.status === 'COMPLETED' && (
                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center justify-end">
                              <Trophy className="h-3 w-3 mr-1" />
                              Người thắng: {match.winnerTeam.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {match.location && (
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="space-y-6">
            {/* Bracket Generator for Admin - Luôn hiển thị nếu điều kiện đủ */}
            {isAdmin && (tournamentData.status === 'REGISTRATION' || tournamentData.status === 'UPCOMING' || tournamentData.status === 'READY_TO_START') && (
              <TournamentBracketGenerator
                tournament={tournamentData}
                onBracketGenerated={handleBracketGenerated}
              />
            )}

            {/* Bracket View */}
            {bracketLoading ? (
              <LoadingSpinner />
            ) : (
              <TournamentBracketView tournament={tournamentData} />
            )}
          </div>
        )}

        {activeTab === 'match-results' && ( // Không cần isAdmin ở đây vì tab này chỉ hiện thị nếu isAdmin đã đúng
          <MatchResultsManager
            tournament={tournamentData}
            currentRound={currentRound || 1}
            onMatchResultUpdated={handleMatchResultUpdated} // Sử dụng hàm mới
          />
        )}

        {activeTab === 'round-management' && ( // Không cần isAdmin ở đây vì tab này chỉ hiện thị nếu isAdmin đã đúng
          <RoundManager
            tournament={tournamentData}
            currentRound={currentRound || 1}
            onRoundAdvanced={handleRoundAdvanced}
          />
        )}

        {activeTab === 'management' && ( // Không cần isAdmin ở đây vì tab này chỉ hiện thị nếu isAdmin đã đúng
          <div className="space-y-6">
            {/* Tournament Status & Controls */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Giải đấu</h2>

              {/* Tournament Actions Based on Status */}
              {tournamentData.status === 'REGISTRATION' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Giai đoạn Đăng ký</h3>
                    <p className="text-blue-700 mb-4">
                      Giải đấu hiện đang trong giai đoạn đăng ký.
                      Bạn có thể tạo cây thi đấu khi đủ số đội đăng ký.
                    </p>
                    <TournamentBracketGenerator
                      tournament={tournamentData}
                      onBracketGenerated={handleBracketGenerated}
                    />
                  </div>
                </div>
              )}

              {(tournamentData.status === 'READY' || tournamentData.status === 'ONGOING') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý trận đấu</h3>
                    <MatchResultsManager
                      tournament={tournamentData}
                      currentRound={currentRound || 1}
                      onMatchResultUpdated={handleMatchResultUpdated}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý vòng đấu</h3>
                    <RoundManager
                      tournament={tournamentData}
                      currentRound={currentRound || 1}
                      onRoundAdvanced={handleRoundAdvanced}
                    />
                  </div>
                </div>
              )}

              {tournamentData.status === 'COMPLETED' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Giải đấu đã hoàn thành!</h3>
                  <p className="text-green-700">
                    Giải đấu này đã được hoàn thành thành công.
                    Tất cả kết quả và cây thi đấu là cuối cùng.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Team Registration Modal - Vẫn giữ lại nhưng mặc định ẩn hoặc không cần thiết cho admin */}
      <TeamRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        tournament={tournamentData}
        onSuccess={() => {
          setShowRegistrationModal(false);
          refetchTournament();
          refetchTeams();
          toast.success('Đăng ký đội thành công!');
        }}
      />

      {/* Tournament Workflow Guide */}
      {showWorkflowGuide && tournamentData && (
        <TournamentWorkflowGuide
          tournament={tournamentData}
          currentRound={currentRound}
          matches={matchesList}
          onClose={() => setShowWorkflowGuide(false)}
        />
      )}
    </div>
  );
};

export default AdminTournamentDetailPage;