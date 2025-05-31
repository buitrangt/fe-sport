import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Trophy, 
  Calendar, 
  MapPin,
  Settings,
  BarChart3,
  Bell,
  Play,
  Pause,
  CheckCircle2,
  FileText,
  Image,
  Award,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Download,
  Upload,
  Zap,
  Shield,
  Globe,
  Filter,
  Search,
  Plus,
  Eye,
  Share2,
  Star,
  AlertCircle,
  CheckSquare,
  XSquare,
  Save,
  RefreshCw,
  Shuffle,
  SkipForward,
  Flag,
  Timer,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Medal,
  Crown,
  ChevronRight,
  Hash,
  Activity,
  UserPlus
} from 'lucide-react';
import { tournamentService, tournamentKnockoutService, teamService, matchService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TournamentEditForm from '../components/tournament/TournamentEditForm';
import TournamentBracketGenerator from '../components/tournament/TournamentBracketGenerator';
import TournamentBracketView from '../components/tournament/TournamentBracketView';
import RoundManager from '../components/tournament/RoundManager';
import MatchResultsManager from '../components/tournament/MatchResultsManager';
import TeamRegistrationModal from '../components/tournament/TeamRegistrationModal';
import TournamentWorkflowGuide from '../components/tournament/TournamentWorkflowGuide';
import { formatDate, formatDateTime, getStatusColor, getTournamentStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const TournamentAdminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  // Main tournament data with same query structure as user page
  const { data: tournament, isLoading: tournamentLoading, refetch: refetchTournament } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    { 
      staleTime: 1000,
      enabled: !!id 
    }
  );

  // Teams data
  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery(
    ['tournament-teams', id],
    () => teamService.getTeamsByTournament(id),
    { 
      staleTime: 1000,
      enabled: !!id,
      onSuccess: (data) => {
        console.log('👥 [TournamentAdminDetailPage] Teams data loaded:', data);
      },
      onError: (error) => {
        console.error('❌ [TournamentAdminDetailPage] Teams loading failed:', error);
      }
    }
  );

  // Matches data
  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery(
    ['tournament-matches', id],
    () => matchService.getMatchesByTournament(id),
    { 
      staleTime: 1000,
      enabled: !!id 
    }
  );

  // Current round data
  const { data: currentRoundData, isLoading: currentRoundLoading, error: currentRoundError } = useQuery(
    ['tournament-current-round', id],
    () => {
      console.log('🚀 [getCurrentRound] API call triggered for tournament:', id);
      return tournamentService.getCurrentRound(id);
    },
    { 
      staleTime: 1000,
      enabled: !!id,
      onSuccess: (data) => {
        console.log('✅ [getCurrentRound] API success:', data);
      },
      onError: (error) => {
        console.error('❌ [getCurrentRound] API error:', error);
      }
    }
  );

  // Bracket data
  const { data: bracket, isLoading: bracketLoading, refetch: refetchBracket } = useQuery(
    ['tournament-bracket', id],
    () => matchService.getTournamentBracket(id),
    { 
      staleTime: 1000,
      enabled: !!id && tournament?.data && (tournament.data.status === 'READY' || tournament.data.status === 'ONGOING' || tournament.data.status === 'COMPLETED')
    }
  );

  // Mutations
  const deleteTournamentMutation = useMutation(
    () => tournamentService.deleteTournament(id),
    {
      onSuccess: () => {
        toast.success('Đã xóa giải đấu thành công');
        navigate('/admin');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa giải đấu');
      }
    }
  );

  // Start Tournament Mutation
  const startTournamentMutation = useMutation(
    () => tournamentKnockoutService.startKnockout(id),
    {
      onSuccess: () => {
        toast.success('Đã bắt đầu giải đấu thành công!');
        refetchTournament();
        refetchMatches();
        refetchBracket();
        queryClient.invalidateQueries(['tournament', id]);
        queryClient.invalidateQueries(['tournament-matches', id]);
      },
      onError: (error) => {
        console.error('❌ Start tournament error:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi bắt đầu giải đấu');
      }
    }
  );

  // Handle event callbacks
  const handleBracketGenerated = (bracketData) => {
    refetchTournament();
    refetchBracket();
    refetchMatches();
    toast.success('Đã tạo bracket thành công!');
  };

  const handleRoundAdvanced = (roundData) => {
    refetchMatches();
    refetchBracket();
    refetchTournament();
    queryClient.invalidateQueries(['tournament-current-round', id]);
    toast.success('Đã chuyển sang vòng tiếp theo!');
  };

  const handleFinishTournament = () => {
    if (window.confirm('Bạn có chắc chắn muốn kết thúc giải đấu?')) {
      toast.success('Đã kết thúc giải đấu!');
    }
  };

  // Data processing - same logic as user page
  if (tournamentLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang tải thông tin giải đấu...</p>
        </div>
      </div>
    );
  }

  if (!tournament?.data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giải đấu</h2>
          <p className="text-gray-600 mb-4">Giải đấu được yêu cầu không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => navigate('/admin')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2 inline" />
            Quay lại Admin Panel
          </button>
        </div>
      </div>
    );
  }

  const tournamentData = tournament.data;

  // Calculate current round - same logic as user page
  let currentRound = 1;
  
  if (currentRoundData?.data?.data?.currentRound) {
    currentRound = currentRoundData.data.data.currentRound;
  } else if (currentRoundData?.data?.currentRound) {
    currentRound = currentRoundData.data.currentRound;
  } else if (tournamentData.currentRound) {
    currentRound = tournamentData.currentRound;
  } else if (bracket?.data?.currentRound) {
    currentRound = bracket.data.currentRound;
  }

  // Safe extraction of matches data
  const matchesData = matches?.data || matches || {};
  const matchesList = matchesData?.matches || [];
  const teamsData = teams?.data || [];

  // Stats calculation
  const totalMatches = matchesList.length;
  const approvedTeams = teamsData.filter(t => t.registrationStatus === 'APPROVED');
  const pendingTeams = teamsData.filter(t => t.registrationStatus === 'PENDING');
  const rejectedTeams = teamsData.filter(t => t.registrationStatus === 'REJECTED');
  const completedMatches = matchesList.filter(m => m.status === 'COMPLETED');
  const ongoingMatches = matchesList.filter(m => m.status === 'ONGOING');
  const pendingMatches = matchesList.filter(m => m.status === 'PENDING');

  // Team approval handlers
  const handleApproveTeam = async (teamId) => {
    try {
      await teamService.approveTeam(teamId);
      toast.success('Đã duyệt đội thành công!');
      refetchTeams();
      refetchTournament();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt đội');
    }
  };

  const handleRejectTeam = async (teamId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối đội này?')) {
      try {
        await teamService.rejectTeam(teamId);
        toast.success('Đã từ chối đội thành công!');
        refetchTeams();
        refetchTournament();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi từ chối đội');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{tournamentData.name}</h1>
                  <div className="flex items-center space-x-4 text-sm opacity-90">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(tournamentData.status)} bg-white/20`}>
                      {getTournamentStatusLabel(tournamentData.status)}
                    </span>
                    <span>Vòng {currentRound}</span>
                    <span>{approvedTeams.length}/{tournamentData.maxTeams} đội</span>
                    <span>{formatDate(tournamentData.startDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to={`/tournaments/${id}`}
                target="_blank"
                className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem công khai
              </Link>
              
              {(tournamentData.status === 'ONGOING' || tournamentData.status === 'READY') && (
                <button
                  onClick={() => setShowWorkflowGuide(true)}
                  className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center text-sm"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Hướng dẫn
                </button>
              )}
              
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', name: 'TỔNG QUAN', icon: Activity, color: 'text-blue-600' },
              { id: 'teams', name: 'QUẢN LÝ ĐỘI', icon: Users, color: 'text-green-600' },
              { id: 'matches', name: 'TRẬN ĐẤU', icon: PlayCircle, color: 'text-orange-600' },
              { id: 'settings', name: 'CÀI ĐẶT', icon: Settings, color: 'text-gray-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-center flex flex-col items-center min-w-[120px] transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-3 border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-b-3 border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className={`h-6 w-6 mb-1 ${
                  activeTab === tab.id ? 'text-blue-600' : tab.color
                }`} />
                <span className="text-xs font-semibold">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Tournament Champion Banner */}
            {tournamentData.winnerTeam && tournamentData.status === 'COMPLETED' && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Trophy className="h-16 w-16 text-yellow-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Tournament Champion! 🎉</h2>
                  <p className="text-xl font-semibold text-yellow-800 mb-4">{tournamentData.winnerTeam.name}</p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đội tham gia</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedTeams.length}/{tournamentData.maxTeams}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trận đã hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">{completedMatches.length}/{matchesList.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <Hash className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vòng hiện tại</p>
                    <p className="text-2xl font-bold text-gray-900">Vòng {currentRound}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <Crown className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                    <p className="text-lg font-bold text-purple-900">{getTournamentStatusLabel(tournamentData.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tournament Control Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-blue-600" />
                Bảng điều khiển giải đấu
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Tournament Setup */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Thiết lập giải đấu</h4>
                  
                  {/* Generate Bracket */}
                  {tournamentData.status === 'REGISTRATION' && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <TournamentBracketGenerator
                        tournament={tournamentData}
                        onBracketGenerated={handleBracketGenerated}
                      />
                    </div>
                  )}
                  
                  {/* Start Tournament */}
                  {(tournamentData.status === 'READY_TO_START' || tournamentData.status === 'READY') && (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Bắt đầu Giải đấu</p>
                          <p className="text-xs text-green-700">Bracket đã sẵn sàng</p>
                        </div>
                      </div>
                      <button
                        onClick={() => startTournamentMutation.mutate()}
                        disabled={startTournamentMutation.isLoading}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                      >
                        {startTournamentMutation.isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span>{startTournamentMutation.isLoading ? 'Bắt đầu...' : 'Bắt đầu Giải đấu'}</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Bracket View */}
                  {(tournamentData.status === 'READY' || tournamentData.status === 'ONGOING' || tournamentData.status === 'COMPLETED') && (
                    <button 
                      onClick={() => setActiveTab('matches')}
                      className="w-full border border-purple-200 rounded-lg p-4 bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-600 p-2 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900">Xem Sơ đồ thi đấu</p>
                          <p className="text-xs text-purple-700">Bracket và kết quả</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Middle Column - Match Management */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Quản lý trận đấu</h4>
                  
                  {/* Match Results */}
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="mb-3">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-yellow-600 p-2 rounded-lg">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-yellow-900">Quản lý Trận đấu</p>
                          <p className="text-xs text-yellow-700">Chuyển tới tab chuyên dụng</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-2"
                    >
                      <Award className="h-4 w-4" />
                      <span>Mở tab Trận đấu</span>
                    </button>
                  </div>
                </div>

                {/* Right Column - Navigation & Actions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Navigation & Actions</h4>
                  
                  {/* Tournament Actions */}
                  <button 
                    onClick={() => setActiveTab('teams')}
                    className="w-full border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Quản lý Đội</p>
                        <p className="text-xs text-green-700">{approvedTeams.length}/{tournamentData.maxTeams} đội</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-600 p-2 rounded-lg">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Cài đặt Giải đấu</p>
                        <p className="text-xs text-gray-700">Chỉnh sửa thông tin</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('matches')}
                    className="w-full border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <PlayCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Xem Trận đấu</p>
                        <p className="text-xs text-blue-700">{completedMatches.length}/{matchesList.length} hoàn thành</p>
                      </div>
                    </div>
                  </button>
                  
                  {tournamentData.status === 'ONGOING' && (
                    <button 
                      onClick={handleFinishTournament}
                      className="w-full border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-600 p-2 rounded-lg">
                          <Flag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900">Kết thúc Giải đấu</p>
                          <p className="text-xs text-red-700">Hoàn thành tournament</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity & Tournament Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tournament Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                  Thông tin giải đấu  
                </h3>
                
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
                    <Target className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Thể thức</p>
                      <p className="font-medium">{tournamentData.format || 'Knockout'}</p>
                    </div>
                  </div>
                </div>

                {tournamentData.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h4>
                    <p className="text-sm text-gray-600">{tournamentData.description}</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Hoạt động gần đây
                </h3>
                <div className="space-y-3">
                  {completedMatches.slice(0, 3).map((match, index) => (
                    <div key={match.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm flex-1">
                        {match.team1?.name || 'Team A'} vs {match.team2?.name || 'Team B'} - Kết thúc
                      </span>
                      <span className="text-xs text-gray-500">{formatDateTime(match.updatedAt || match.scheduledTime)}</span>
                    </div>
                  ))}
                  
                  {ongoingMatches.slice(0, 2).map((match, index) => (
                    <div key={match.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm flex-1">
                        {match.team1?.name || 'Team A'} vs {match.team2?.name || 'Team B'} - Đang diễn ra
                      </span>
                      <span className="text-xs text-gray-500">{formatDateTime(match.scheduledTime)}</span>
                    </div>
                  ))}

                  {teamsData.slice(0, 2).map((team, index) => (
                    <div key={team.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm flex-1">{team.name} đã đăng ký tham gia</span>
                      <span className="text-xs text-gray-500">{formatDate(team.registrationDate || team.createdAt)}</span>
                    </div>
                  ))}

                  {(completedMatches.length === 0 && ongoingMatches.length === 0 && teamsData.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Chưa có hoạt động nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams Management Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-green-600" />
                  Quản lý đội tham gia ({approvedTeams.length}/{tournamentData.maxTeams})
                </h2>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowRegistrationModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Đăng ký đội
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Xuất Excel
                  </button>
                </div>
              </div>
              
              {teamsLoading ? (
                <LoadingSpinner size="small" />
              ) : teamsData.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Chưa có đội nào đăng ký</p>
                  <button 
                    onClick={() => setShowRegistrationModal(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Đăng ký đội đầu tiên
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên đội
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đăng ký
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamsData.map((team) => (
                        <tr key={team.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{team.name}</div>
                                {team.description && (
                                  <div className="text-sm text-gray-500">{team.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              team.registrationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              team.registrationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              team.registrationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {team.registrationStatus === 'APPROVED' ? 'Đã duyệt' : 
                               team.registrationStatus === 'PENDING' ? 'Chờ duyệt' : 
                               team.registrationStatus === 'REJECTED' ? 'Từ chối' : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {team.memberCount || team.players || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(team.registrationDate || team.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {team.registrationStatus === 'PENDING' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveTeam(team.id)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                    title="Duyệt đội"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectTeam(team.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                    title="Từ chối đội"
                                  >
                                    <XSquare className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {team.registrationStatus === 'REJECTED' && (
                                <button 
                                  onClick={() => handleApproveTeam(team.id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                  title="Duyệt đội"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              <button className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors" title="Xem chi tiết">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors" title="Chỉnh sửa">
                                <Edit className="h-4 w-4" />
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
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Match Management Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <PlayCircle className="h-6 w-6 mr-2 text-orange-600" />
                    Quản lý Trận đấu - Vòng {currentRound}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {totalMatches} trận đấu • {completedMatches.length} hoàn thành • {ongoingMatches.length} đang diễn ra • {pendingMatches.length} chờ thi đấu
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Xuất báo cáo
                  </button>
                  <button 
                    onClick={() => {
                      refetchMatches();
                      refetchBracket();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <PlayCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Tổng trận đấu</p>
                      <p className="text-xl font-bold text-blue-600">{totalMatches}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Đã hoàn thành</p>
                      <p className="text-xl font-bold text-green-600">{completedMatches.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Play className="h-5 w-5 text-orange-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Đang diễn ra</p>
                      <p className="text-xl font-bold text-orange-600">{ongoingMatches.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Chờ thi đấu</p>
                      <p className="text-xl font-bold text-yellow-600">{pendingMatches.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Match Results Manager */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Cập nhật Kết quả Trận đấu
                </h3>
                {(tournamentData.status === 'ONGOING' || tournamentData.status === 'READY') && (
                  <MatchResultsManager
                    tournament={tournamentData}
                    currentRound={currentRound || 1}
                    onMatchResultUpdated={handleRoundAdvanced}
                    compact={false}
                  />
                )}
              </div>
              
              {/* Round Manager */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SkipForward className="h-5 w-5 mr-2 text-blue-600" />
                  Quản lý Vòng đấu
                </h3>
                {(tournamentData.status === 'ONGOING' || tournamentData.status === 'READY') && (
                  <RoundManager
                    tournament={tournamentData}
                    currentRound={currentRound || 1}
                    onRoundAdvanced={handleRoundAdvanced}
                    compact={false}
                  />
                )}
              </div>
            </div>
            {matchesLoading ? (
              <LoadingSpinner />
            ) : matchesList.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center py-12">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trận đấu nào</h3>
                <p className="text-gray-600">
                  Các trận đấu sẽ xuất hiện sau khi tạo bracket.
                </p>
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
              <div className="space-y-6">
                {/* Bracket View */}
                {(tournamentData.status === 'READY' || tournamentData.status === 'ONGOING' || tournamentData.status === 'COMPLETED') && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Target className="h-6 w-6 mr-2 text-purple-600" />
                        Sơ đồ thi đấu
                      </h2>
                      <div className="flex space-x-3">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm">
                          <Download className="h-4 w-4 mr-2" />
                          Xuất PDF
                        </button>
                      </div>
                    </div>
                    
                    {bracketLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <TournamentBracketView tournament={tournamentData} />
                    )}
                  </div>
                )}

                {/* Matches List */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <PlayCircle className="h-6 w-6 mr-2 text-orange-600" />
                      Danh sách trận đấu - Vòng {currentRound}
                    </h2>
                    <div className="flex space-x-3">
                      <span className="text-sm text-gray-500 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                        {completedMatches.length}/{matchesList.length} hoàn thành
                      </span>
                    </div>
                  </div>
                
                  {/* Matches Display */}
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
                                {match.team1?.name || 'TBD'}
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
                                {match.team2?.name || 'TBD'}
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
                              {match.status === 'PENDING' ? 'Chưa bắt đầu' :
                               match.status === 'ONGOING' ? 'Đang diễn ra' :
                               match.status === 'COMPLETED' ? 'Đã kết thúc' : match.status}
                            </div>
                            
                            {/* Winner Display */}
                            {match.winnerTeam && match.status === 'COMPLETED' && (
                              <div className="mt-2 text-xs text-green-600 font-medium flex items-center justify-end">
                                <Trophy className="h-3 w-3 mr-1" />
                                Thắng: {match.winnerTeam.name}
                              </div>
                            )}

                            {/* Match Actions */}
                            <div className="flex space-x-2 mt-2 justify-end">
                              {match.status === 'PENDING' && (
                                <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                                  <Play className="h-3 w-3 inline mr-1" />
                                  Bắt đầu
                                </button>
                              )}
                              
                              {(match.status === 'ONGOING' || match.status === 'COMPLETED') && (
                                <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                                  <Edit className="h-3 w-3 inline mr-1" />
                                  Sửa tỉ số
                                </button>
                              )}
                              
                              <button className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700">
                                <Eye className="h-3 w-3 inline mr-1" />
                                Chi tiết
                              </button>
                            </div>
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
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <Settings className="h-6 w-6 mr-2 text-gray-600" />
              Cài đặt giải đấu
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên giải đấu</label>
                  <input
                    type="text"
                    value={tournamentData.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số đội tham dự</label>
                  <input
                    type="number"
                    value={tournamentData.maxTeams || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <input
                    type="text"
                    value={getTournamentStatusLabel(tournamentData.status)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thể thức</label>
                  <input
                    type="text"
                    value={tournamentData.format || 'Knockout'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={tournamentData.description || ''}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nâng cao</h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => deleteTournamentMutation.mutate()}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa giải đấu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TournamentEditForm
          tournament={tournamentData}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['tournament', id]);
            setShowEditModal(false);
            toast.success('Đã cập nhật giải đấu thành công!');
          }}
        />
      )}

      {/* Team Registration Modal */}
      <TeamRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        tournament={tournamentData}
        onSuccess={() => {
          setShowRegistrationModal(false);
          refetchTournament();
          refetchTeams();
          toast.success('Đã đăng ký đội thành công!');
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

export default TournamentAdminDetailPage;