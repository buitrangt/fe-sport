import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
    Trophy,
    Users,
    Calendar,
    TrendingUp,
    Plus,
    Eye,
    Edit,
    Award,
    BookOpen,
    Info,
    Zap,
    Star, // Thêm icon Star cho rating/rank
    MessageSquare, // Thêm icon cho thông báo/tin nhắn
    BarChart2, // Thêm icon cho biểu đồ/thống kê chuyên sâu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// Loại bỏ các import service không cần thiết nếu chỉ dùng mock data
// import { tournamentService, teamService, userService } from '../services'; 
// import LoadingSpinner from '../components/LoadingSpinner'; // Loại bỏ nếu không có loading thật
// import { formatDate, getStatusColor } from '../utils/helpers'; // Giữ lại cho formatDate và getStatusColor
import { formatDate, getStatusColor } from '../utils/helpers'; // Giữ lại nếu bạn có helpers này

const DashboardPage = () => {
    const { user } = useAuth(); // Vẫn dùng useAuth để lấy thông tin user role
    const userName = user?.name || user?.email || 'Người dùng';
    const isOrganizerOrAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER'; // Kiểm tra vai trò

    // --- Dữ liệu giả định (Mock Data) ---

    // Mock User Stats
    const mockUserStats = {
        totalTournaments: 15,
        registeredTeams: 3,
        matchesPlayed: 45,
        winRate: '78%',
        // Có thể thêm: totalAwards: 5, rank: 'Top 100'
    };

    // Mock Tournaments (có thể khác nhau tùy vai trò)
    const mockTournaments = isOrganizerOrAdmin ? [
        { id: 't1', name: 'Giải Vô Địch Mùa Hè 2024', startDate: '2024-07-01', status: 'ONGOING' },
        { id: 't2', name: 'Cúp Thể Thao Học Sinh 2024', startDate: '2024-08-15', status: 'UPCOMING' },
        { id: 't3', name: 'Đại Hội Thể Thao Lần I', startDate: '2024-05-01', status: 'COMPLETED' },
    ] : [
        { id: 't4', name: 'Giải Bóng Rổ Sinh Viên Toàn Quốc', startDate: '2024-06-10', status: 'ONGOING' },
        { id: 't5', name: 'Esports Championship 2024', startDate: '2024-09-01', status: 'UPCOMING' },
        { id: 't6', name: 'Giải Cờ Vua Mở Rộng 2024', startDate: '2024-04-20', status: 'COMPLETED' },
    ];

    // Mock Recent Activity
    const mockRecentActivities = [
        { id: 'a1', type: 'tournament_register', description: 'Đã đăng ký <span class="font-semibold">Giải Vô Địch Mùa Hè 2024</span>', time: '2 giờ trước', icon: Trophy, color: 'text-green-600', bgColor: 'bg-green-50', iconBg: 'bg-green-100' },
        { id: 'a2', type: 'team_update', description: 'Đội "<span class="font-semibold">Eagles</span>" đã cập nhật thông tin thành viên', time: '1 ngày trước', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', iconBg: 'bg-blue-100' },
        { id: 'a3', type: 'match_win', description: 'Đã thắng trận đấu với đội "<span class="font-semibold">Tigers</span>" tại giải <span class="font-semibold">Cúp Thể Thao Học Sinh</span>', time: '3 ngày trước', icon: Award, color: 'text-purple-600', bgColor: 'bg-purple-50', iconBg: 'bg-purple-100' },
        { id: 'a4', type: 'match_scheduled', description: 'Trận đấu tiếp theo đã được lên lịch: <span class="font-semibold">vs Dragons</span>', time: '1 tuần trước', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', iconBg: 'bg-orange-100' },
        { id: 'a5', type: 'profile_update', description: 'Đã cập nhật thông tin hồ sơ cá nhân', time: '2 tuần trước', icon: Edit, color: 'text-pink-600', bgColor: 'bg-pink-50', iconBg: 'bg-pink-100' },
    ];

    // Mock Notifications (Có thể hiển thị ở đây hoặc ở một component riêng)
    const mockNotifications = [
        { id: 'n1', message: 'Giải đấu "Cúp Mùa Thu" đã mở đăng ký!', type: 'info', icon: Info },
        { id: 'n2', message: 'Trận đấu của bạn vào ngày 20/06 đã bị hoãn.', type: 'warning', icon: AlertTriangle },
        { id: 'n3', message: 'Bạn đã được mời tham gia đội "Phoenix".', type: 'invitation', icon: Users },
    ];

    // --- Cấu trúc lại các Stats để dùng mock data ---
    const stats = [
        {
            name: 'Tổng số giải đấu',
            value: mockUserStats.totalTournaments,
            icon: Trophy,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100',
        },
        {
            name: 'Đội đã đăng ký',
            value: mockUserStats.registeredTeams,
            icon: Users,
            color: 'text-green-500',
            bgColor: 'bg-green-100',
        },
        {
            name: 'Trận đấu đã chơi',
            value: mockUserStats.matchesPlayed,
            icon: Calendar,
            color: 'text-purple-500',
            bgColor: 'bg-purple-100',
        },
        {
            name: 'Tỷ lệ thắng',
            value: mockUserStats.winRate,
            icon: TrendingUp,
            color: 'text-pink-500',
            bgColor: 'bg-pink-100',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header chào mừng */}
                <div className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                        Chào mừng trở lại, <span className="text-primary-600">{userName}</span>!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Nơi bắt đầu mọi hành trình thể thao của bạn.
                    </p>
                </div>

                {/* --- Thống kê nhanh (Stats Grid) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white rounded-xl shadow-lg p-6 flex items-center transform transition-transform hover:scale-105 hover:shadow-2xl">
                            <div className={`${stat.bgColor} p-4 rounded-xl flex-shrink-0`}>
                                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                            <div className="ml-5">
                                <p className="text-base font-medium text-gray-600">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* --- Các giải đấu gần đây / của bạn --- */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isOrganizerOrAdmin ? 'Giải đấu của bạn' : 'Giải đấu gần đây'}
                            </h2>
                            <div className="flex space-x-3">
                                {isOrganizerOrAdmin && (
                                    <Link
                                        to="/admin/tournaments/new"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tạo mới
                                    </Link>
                                )}
                                <Link
                                    to="/tournaments"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem tất cả
                                </Link>
                            </div>
                        </div>

                        {(mockTournaments || []).length === 0 ? (
                            <div className="text-center py-10">
                                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">Hiện chưa có giải đấu nào.</p>
                                {isOrganizerOrAdmin && (
                                    <Link
                                        to="/admin/tournaments/new"
                                        className="mt-5 inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Tạo giải đấu đầu tiên của bạn
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(mockTournaments || []).map((tournament) => (
                                    <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-primary-500 p-3 rounded-lg flex-shrink-0">
                                                <Trophy className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">{tournament.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Ngày bắt đầu: {formatDate(tournament.startDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                                                {tournament.status}
                                            </div>
                                            <Link
                                                to={`/tournaments/${tournament.id}`}
                                                className="text-primary-600 hover:text-primary-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                title="Xem chi tiết giải đấu"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            {isOrganizerOrAdmin && (
                                                <Link
                                                    to={`/admin/tournaments/${tournament.id}/edit`}
                                                    className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                    title="Chỉnh sửa giải đấu"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- Hoạt động gần đây --- */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
                        <div className="space-y-4">
                            {mockRecentActivities.map((activity) => (
                                <div key={activity.id} className={`flex items-center space-x-4 p-4 ${activity.bgColor} rounded-lg shadow-sm`}>
                                    <div className={`${activity.iconBg} p-3 rounded-full flex-shrink-0`}>
                                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                                    </div>
                                    <div>
                                        {/* Sử dụng dangerouslySetInnerHTML để render HTML từ description */}
                                        <p className="text-base font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: activity.description }}></p>
                                        <p className="text-sm text-gray-600">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Link
                                to="/dashboard/activity"
                                className="text-primary-600 hover:text-primary-700 text-base font-medium transition-colors"
                            >
                                Xem tất cả hoạt động &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- Thông báo và tin tức quan trọng --- */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông báo & Tin tức</h2>
                    <div className="space-y-4">
                        {mockNotifications.length === 0 ? (
                            <p className="text-gray-600 text-center py-4">Hiện không có thông báo mới nào.</p>
                        ) : (
                            mockNotifications.map(notif => (
                                <div key={notif.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {notif.type === 'info' && <Info className="h-6 w-6 text-blue-500" />}
                                        {notif.type === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                                        {notif.type === 'invitation' && <Users className="h-6 w-6 text-purple-500" />}
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-800">{notif.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-8 text-center">
                        <Link
                            to="/notifications" // Giả định có trang này
                            className="text-primary-600 hover:text-primary-700 text-base font-medium transition-colors"
                        >
                            Xem tất cả thông báo &rarr;
                        </Link>
                    </div>
                </div>

                {/* --- Hành động nhanh (Quick Actions) --- */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Hành động nhanh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            to="/tournaments"
                            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:scale-105 hover:shadow-2xl group"
                        >
                            <div className="bg-primary-100 p-4 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                                <Trophy className="h-10 w-10 text-primary-600 group-hover:text-primary-700 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Duyệt giải đấu</h3>
                            <p className="text-gray-600">Tìm và tham gia các giải đấu hấp dẫn đang diễn ra.</p>
                        </Link>

                        {isOrganizerOrAdmin ? (
                            <Link
                                to="/admin/tournaments/new"
                                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:scale-105 hover:shadow-2xl group"
                            >
                                <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                                    <Plus className="h-10 w-10 text-green-600 group-hover:text-green-700 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Tạo giải đấu</h3>
                                <p className="text-gray-600">Bắt đầu tổ chức giải đấu thể thao của riêng bạn.</p>
                            </Link>
                        ) : (
                            <Link
                                to="/news"
                                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:scale-105 hover:shadow-2xl group"
                            >
                                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                                    <BookOpen className="h-10 w-10 text-blue-600 group-hover:text-blue-700 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Xem tin tức</h3>
                                <p className="text-gray-600">Luôn cập nhật những tin tức và thông báo mới nhất.</p>
                            </Link>
                        )}

                        <Link
                            to="/profile"
                            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:scale-105 hover:shadow-2xl group"
                        >
                            <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
                                <Edit className="h-10 w-10 text-purple-600 group-hover:text-purple-700 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cập nhật hồ sơ</h3>
                            <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.</p>
                        </Link>
                    </div>
                </div>

                {/* --- Có thể thêm một phần cho bảng xếp hạng hoặc gợi ý giải đấu --- */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Đề xuất cho bạn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg shadow-sm">
                            <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                                <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Top Giải Đấu Nổi Bật</h3>
                                <p className="text-base text-gray-700">Khám phá các giải đấu được nhiều người quan tâm và có giải thưởng lớn.</p>
                                <Link to="/tournaments?filter=hot" className="text-sm text-primary-600 hover:underline mt-2 inline-block">Xem ngay &rarr;</Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg shadow-sm">
                            <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                                <BarChart2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Bảng Xếp Hạng Cá Nhân</h3>
                                <p className="text-base text-gray-700">Xem thứ hạng của bạn và những người chơi khác trong hệ thống.</p>
                                <Link to="/leaderboard" className="text-sm text-primary-600 hover:underline mt-2 inline-block">Kiểm tra thứ hạng &rarr;</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;