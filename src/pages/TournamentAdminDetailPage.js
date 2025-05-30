import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import { tournamentService, tournamentKnockoutService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TournamentEditForm from '../components/tournament/TournamentEditForm';
import TournamentBracketGenerator from '../components/tournament/TournamentBracketGenerator';
import TournamentBracketView from '../components/tournament/TournamentBracketView';
import TournamentRoundManager from '../components/tournament/TournamentRoundManager';
import TeamRegistrationManager from '../components/tournament/TeamRegistrationManager';
import TournamentAnalytics from '../components/tournament/TournamentAnalytics';
import { formatDate, getStatusColor, getTournamentStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const TournamentAdminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: tournament, isLoading, error } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    {
      select: (response) => response.data || response,
      enabled: !!id
    }
  );

  const { data: teams } = useQuery(
    ['tournament-teams', id],
    () => tournamentService.getTeamsByTournament(id),
    {
      select: (response) => response.data || response,
      enabled: !!id
    }
  );

  const { data: matches } = useQuery(
    ['tournament-matches', id],
    () => tournamentService.getMatchesByTournament(id),
    {
      select: (response) => response.data || response,
      enabled: !!id
    }
  );

  const { data: bracket } = useQuery(
    ['tournament-bracket', id],
    () => tournamentService.getTournamentBracket(id),
    {
      select: (response) => response.data || response,
      enabled: !!id && tournament?.status !== 'REGISTRATION'
    }
  );

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

  const startTournamentMutation = useMutation(
    () => tournamentService.startTournament(id),
    {
      onSuccess: () => {
        toast.success('Đã bắt đầu giải đấu thành công');
        queryClient.invalidateQueries(['tournament', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Lỗi khi bắt đầu giải đấu');
      }
    }
  );

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giải đấu này? Hành động này không thể hoàn tác.')) {
      deleteTournamentMutation.mutate();
    }
  };

  const handleStart = () => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu giải đấu này?')) {
      startTournamentMutation.mutate();
    }
  };

  const canEdit = user?.role === 'ADMIN' || 
    (user?.role === 'ORGANIZER' && tournament?.createdBy?.id === user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang tải thông tin giải đấu...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header giống như mẫu */}
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
                  <h1 className="text-xl font-bold">{tournament.name}</h1>
                  <div className="flex items-center space-x-4 text-sm opacity-90">
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                      {getTournamentStatusLabel(tournament.status)}
                    </span>
                    <span>{tournament.currentTeams}/{tournament.maxTeams} đội</span>
                    <span>{formatDate(tournament.startDate)}</span>
                    <span>{tournament.location}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(`/tournaments/${id}`, '_blank')}
                className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem công khai
              </button>
              
              {tournament.status === 'REGISTRATION' && (
                <button
                  onClick={handleStart}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                  disabled={startTournamentMutation.isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {startTournamentMutation.isLoading ? 'Đang bắt đầu...' : 'Bắt đầu giải đấu'}
                </button>
              )}
              
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu ngang giống như mẫu */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'TỔNG QUAN', icon: Trophy, color: 'text-blue-600' },
              { id: 'teams', name: 'ĐỘI THAM GIA', icon: Users, color: 'text-green-600' },
              { id: 'schedule', name: 'LỊCH THI ĐẤU', icon: Calendar, color: 'text-orange-600' },
              { id: 'results', name: 'KẾT QUẢ', icon: Award, color: 'text-purple-600' },
              { id: 'bracket', name: 'SƠ ĐỒ THI ĐẤU', icon: Target, color: 'text-red-600' },
              { id: 'analytics', name: 'THỐNG KÊ', icon: BarChart3, color: 'text-indigo-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-center flex flex-col items-center min-w-[120px] transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-3 border-red-500 bg-red-50 text-red-600'
                    : 'border-b-3 border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className={`h-6 w-6 mb-1 ${
                  activeTab === tab.id ? 'text-red-600' : tab.color
                }`} />
                <span className="text-xs font-semibold">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tổng quan giải đấu */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header section với các nút action */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-blue-600" />
                  Tổng quan giải đấu
                </h2>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Nhập lại
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Danh sách mùa giải
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Di chuyển mùa giải
                  </button>
                </div>
              </div>
              
              {/* Form thông tin giải đấu */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên mùa giải</label>
                      <input
                        type="text"
                        value={tournament.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thể thức thi đấu</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Loại trực tiếp</option>
                        <option>Vòng tròn</option>
                        <option>Kết hợp</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu</label>
                      <input
                        type="date"
                        value={tournament.startDate?.split('T')[0] || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc</label>
                      <input
                        type="date"
                        value={tournament.endDate?.split('T')[0] || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số đội tham dự</label>
                      <input
                        type="number"
                        value={tournament.maxTeams || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Màu Website</label>
                      <input
                        type="color"
                        value="#B81E1F"
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Môn đấu</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Bóng đá</option>
                        <option>Bóng rổ</option>
                        <option>Cầu lông</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại giải đấu</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Đồng đội</option>
                        <option>Cá nhân</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Điểm thắng</label>
                      <input
                        type="number"
                        value="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Điểm hòa</label>
                      <input
                        type="number"
                        value="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Điểm thua</label>
                      <input
                        type="number"
                        value="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đăng ký trực tuyến</label>
                      <div className="flex items-center space-x-4">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">Không</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tranh giải 3</label>
                      <div className="flex items-center space-x-4">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">Không</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar với logo và background */}
                <div className="space-y-6">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                          Chọn ảnh...
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Background</label>
                    <div className="bg-gradient-to-b from-blue-600 to-green-500 rounded-lg h-48 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative text-center text-white">
                        <Trophy className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Stadium Background</p>
                      </div>
                    </div>
                    <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                      Chọn ảnh...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Đội tham gia */}
        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                Đội tham gia ({teams?.length || 0}/{tournament.maxTeams})
              </h2>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm đội
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </button>
              </div>
            </div>
            
            <TeamRegistrationManager 
              tournament={tournament} 
              teams={teams}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              onTeamsUpdated={() => {
                queryClient.invalidateQueries(['tournament-teams', id]);
                queryClient.invalidateQueries(['tournament', id]);
              }}
            />
          </div>
        )}

        {/* Lịch thi đấu */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-orange-600" />
                Lịch thi đấu
              </h2>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo trận đấu
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tự động tạo lịch
                </button>
              </div>
            </div>
            
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch thi đấu</h4>
              <p className="text-gray-600 mb-6">Tạo lịch thi đấu để bắt đầu quản lý các trận đấu</p>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                Tạo lịch thi đấu đầu tiên
              </button>
            </div>
          </div>
        )}

        {/* Kết quả */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Award className="h-6 w-6 mr-2 text-purple-600" />
                Kết quả thi đấu
              </h2>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nhập kết quả
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất báo cáo
                </button>
              </div>
            </div>
            
            <div className="text-center py-16">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có kết quả</h4>
              <p className="text-gray-600 mb-6">Kết quả sẽ hiển thị sau khi các trận đấu được hoàn thành</p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Xem lịch thi đấu
              </button>
            </div>
          </div>
        )}

        {/* Sơ đồ thi đấu */}
        {activeTab === 'bracket' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="h-6 w-6 mr-2 text-red-600" />
                  Sơ đồ thi đấu
                </h2>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Tạo sơ đồ
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Xuất PDF
                  </button>
                </div>
              </div>
              
              {tournament.status === 'REGISTRATION' && (
                <TournamentBracketGenerator 
                  tournament={tournament}
                  onBracketGenerated={() => {
                    queryClient.invalidateQueries(['tournament-bracket', id]);
                    queryClient.invalidateQueries(['tournament', id]);
                  }}
                />
              )}
              
              {bracket && <TournamentBracketView bracket={bracket} tournament={tournament} />}
              
              {tournament.status === 'ONGOING' && (
                <TournamentRoundManager 
                  tournament={tournament}
                  currentRound={bracket?.currentRound}
                  matches={matches}
                  onRoundAdvanced={() => {
                    queryClient.invalidateQueries(['tournament-bracket', id]);
                    queryClient.invalidateQueries(['tournament-matches', id]);
                    queryClient.invalidateQueries(['tournament', id]);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Thống kê */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-indigo-600" />
                Thống kê và phân tích
              </h2>
              <div className="flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cập nhật
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất báo cáo
                </button>
              </div>
            </div>
            
            <TournamentAnalytics tournament={tournament} matches={matches} teams={teams} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TournamentEditForm
          tournament={tournament}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['tournament', id]);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TournamentAdminDetailPage;