import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Award,
  Activity,
  Zap
} from 'lucide-react';

const TournamentAnalytics = ({ tournament, matches = [], teams = [] }) => {
  const analytics = useMemo(() => {
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
    const ongoingMatches = matches.filter(m => m.status === 'ONGOING').length;
    const pendingMatches = matches.filter(m => m.status === 'PENDING' || !m.status).length;

    const totalTeams = teams.length;
    const approvedTeams = teams.filter(t => t.status === 'APPROVED').length;
    const pendingTeams = teams.filter(t => t.status === 'PENDING').length;
    const rejectedTeams = teams.filter(t => t.status === 'REJECTED').length;

    // Calculate completion percentage
    const completionPercentage = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
    
    // Team registration rate
    const registrationRate = tournament.maxTeams > 0 ? Math.round((totalTeams / tournament.maxTeams) * 100) : 0;

    // Calculate average match duration (mock data for now)
    const avgMatchDuration = '90 phút'; // This would come from actual match data

    // Tournament progress phases
    const tournamentPhases = [
      { name: 'Đăng ký', completed: tournament.status !== 'REGISTRATION' },
      { name: 'Tạo Bảng đấu', completed: ['ONGOING', 'COMPLETED'].includes(tournament.status) },
      { name: 'Các trận đấu', completed: tournament.status === 'COMPLETED' },
      { name: 'Giải thưởng', completed: tournament.status === 'COMPLETED' }
    ];

    // Top performing teams (based on wins - mock calculation)
    const topTeams = teams
      .map(team => ({
        ...team,
        wins: Math.floor(Math.random() * completedMatches), // Mock data
        matchesPlayed: Math.floor(Math.random() * totalMatches)
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 5);

    return {
      totalMatches,
      completedMatches,
      ongoingMatches,
      pendingMatches,
      totalTeams,
      approvedTeams,
      pendingTeams,
      rejectedTeams,
      completionPercentage,
      registrationRate,
      avgMatchDuration,
      tournamentPhases,
      topTeams
    };
  }, [tournament, matches, teams]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, current, total, color = 'bg-blue-600' }) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-600">{current}/{total} ({percentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng số đội"
          value={analytics.totalTeams}
          subtitle={`${analytics.registrationRate}% sức chứa`}
          icon={Users}
          color="text-blue-600"
          trend={analytics.registrationRate > 80 ? "+15% tuần này" : null}
        />
        
        <StatCard
          title="Tổng số trận đấu"
          value={analytics.totalMatches}
          subtitle={`${analytics.completedMatches} đã hoàn thành`}
          icon={Calendar}
          color="text-green-600"
        />
        
        <StatCard
          title="Tỷ lệ hoàn thành"
          value={`${analytics.completionPercentage}%`}
          subtitle="Tiến độ giải đấu"
          icon={Target}
          color="text-orange-600"
        />
        
        <StatCard
          title="Thời lượng trận TB"
          value={analytics.avgMatchDuration}
          subtitle="Mỗi trận"
          icon={Clock}
          color="text-purple-600"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tournament Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            Tiến độ Giải đấu
          </h3>
          <div className="space-y-4">
            {analytics.tournamentPhases.map((phase, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  phase.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {phase.completed && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className={`text-sm ${
                  phase.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {phase.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Match Statistics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
            Thống kê trận đấu
          </h3>
          <div className="space-y-4">
            <ProgressBar
              label="Trận đấu đã hoàn thành"
              current={analytics.completedMatches}
              total={analytics.totalMatches}
              color="bg-green-600"
            />
            <ProgressBar
              label="Trận đấu đang diễn ra"
              current={analytics.ongoingMatches}
              total={analytics.totalMatches}
              color="bg-blue-600"
            />
            <ProgressBar
              label="Trận đấu đang chờ"
              current={analytics.pendingMatches}
              total={analytics.totalMatches}
              color="bg-yellow-600"
            />
          </div>
        </div>
      </div>

      {/* Teams Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Registration Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-orange-600 mr-2" />
            Đăng ký Đội
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đội đã duyệt</span>
              </div>
              <span className="text-sm font-bold text-green-700">{analytics.approvedTeams}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đội đang chờ</span>
              </div>
              <span className="text-sm font-bold text-yellow-700">{analytics.pendingTeams}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đội đã từ chối</span>
              </div>
              <span className="text-sm font-bold text-red-700">{analytics.rejectedTeams}</span>
            </div>
          </div>
        </div>

        {/* Top Performing Teams */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
            Các đội hàng đầu
          </h3>
          {analytics.topTeams.length > 0 ? (
            <div className="space-y-3">
              {analytics.topTeams.map((team, index) => (
                <div key={team.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.teamColor || '#6B7280' }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{team.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{team.wins} trận thắng</div>
                    <div className="text-xs text-gray-500">{team.matchesPlayed} đã đấu</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Chưa có dữ liệu hiệu suất nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Tournament Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 text-purple-600 mr-2" />
          Dòng thời gian Giải đấu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">Thời gian đăng ký</div>
            <div className="text-xs text-gray-600 mt-1">
              Đến ngày {new Date(tournament.registrationDeadline).toLocaleDateString('vi-VN')}
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">Bắt đầu Giải đấu</div>
            <div className="text-xs text-gray-600 mt-1">
              {new Date(tournament.startDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">Kết thúc dự kiến</div>
            <div className="text-xs text-gray-600 mt-1">
              {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('vi-VN') : 'Sẽ thông báo sau'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          Thông tin nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Trạng thái đăng ký</h4>
            <p className="text-sm text-gray-700">
              {analytics.registrationRate >= 100 ? (
                <>🎉 Giải đấu đã đủ số lượng! Tất cả {tournament.maxTeams} vị trí đã được lấp đầy.</>
              ) : analytics.registrationRate >= 80 ? (
                <>🔥 Rất nhiều sự quan tâm! {analytics.registrationRate}% vị trí đã được lấp đầy.</>
              ) : analytics.registrationRate >= 50 ? (
                <>📈 Tiến độ tốt! Đã đạt {analytics.registrationRate}% sức chứa.</>
              ) : (
                <>📢 Cần quảng bá thêm. Chỉ mới {analytics.registrationRate}% được lấp đầy.</>
              )}
            </p>
          </div>
          
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Tiến độ Giải đấu</h4>
            <p className="text-sm text-gray-700">
              {analytics.completionPercentage >= 100 ? (
                <>🏆 Giải đấu đã hoàn thành! Tất cả các trận đấu đã kết thúc.</>
              ) : analytics.completionPercentage >= 75 ? (
                <>⚡ Giai đoạn cuối! Đã hoàn thành {analytics.completionPercentage}%.</>
              ) : analytics.completionPercentage >= 25 ? (
                <>🎯 Đang có tiến triển! {analytics.completionPercentage}% số trận đấu đã xong.</>
              ) : (
                <>🚀 Mới bắt đầu! Đã hoàn thành {analytics.completionPercentage}%.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentAnalytics;