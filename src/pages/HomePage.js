import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Trophy, Users, Calendar, Target, ArrowRight, Play, Star, Clock, MapPin, User, Zap, Award, TrendingUp } from 'lucide-react';
import { tournamentServiceFixed as tournamentService } from '../services/tournamentServiceFixed';
import newsService from '../services/newsService';
import { dashboardService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';
import SportImage from '../components/SportImage';
import StadiumHeroImage from '../components/StadiumHeroImage';
import SportImageGallery from '../components/SportImageGallery';

// Import NewsDetailModal
import NewsDetailModal from '../components/admin/NewsDetailModal';

// Import sport images styles
import '../styles/sport-images.css';

const HomePage = () => {
  console.log('🏠 [HomePage] Component mounting at', new Date().toLocaleTimeString());

  const [selectedNewsArticle, setSelectedNewsArticle] = useState(null);
  const [isNewsDetailModalOpen, setIsNewsDetailModalOpen] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  useEffect(() => {
    console.log('🏠 [HomePage] useEffect running at', new Date().toLocaleTimeString());

    const currentPath = window.location.pathname;
    console.log('📍 [HomePage] Current path:', currentPath);

    const handleUrlChange = () => {
      console.log('⚠️ [HomePage] URL changed to:', window.location.pathname, 'at', new Date().toLocaleTimeString());
    };

    window.addEventListener('popstate', handleUrlChange);

    return () => {
      console.log('🏠 [HomePage] Component unmounting at', new Date().toLocaleTimeString());
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Get dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
      'dashboard-stats',
      () => dashboardService.getDashboardStats(),
      {
        staleTime: 2 * 60 * 1000,
        onSuccess: (data) => {
          console.log('📊 [HomePage] Dashboard stats loaded at', new Date().toLocaleTimeString());
        },
        select: (response) => {
          console.log('📊 [HomePage] Dashboard Stats Response:', response);
          return response?.data || null;
        },
        onError: (error) => {
          console.warn('⚠️ [HomePage] Dashboard stats API failed, using mock data:', error);
        }
      }
  );

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
      ['tournaments', { page: 1, limit: 3 }],
      () => tournamentService.getAllTournaments({ page: 1, limit: 3 }),
      {
        staleTime: 5 * 60 * 1000,
        select: (response) => {
          console.log('🏆 [HomePage] Tournaments API Response:', response);

          if (response && Array.isArray(response.data)) {
            console.log('🏆 [HomePage] Found tournaments:', response.data.length);
            return response.data;
          }

          if (Array.isArray(response)) {
            return response;
          }
          if (response?.data && Array.isArray(response.data)) {
            return response.data;
          }
          if (response?.data?.content && Array.isArray(response.data.content)) {
            return response.data.content;
          }
          if (response?.data?.tournaments && Array.isArray(response.data.tournaments)) {
            return response.data.tournaments;
          }

          console.warn('⚠️ [HomePage] Tournaments data is not an array:', response);
          return [];
        }
      }
  );

  const { data: news, isLoading: newsLoading, error: newsError } = useQuery(
      'recent-news',
      () => newsService.getAllNews(),
      {
        staleTime: 5 * 60 * 1000,
        select: (data) => {
          let newsArray = [];

          if (Array.isArray(data)) {
            newsArray = data;
          } else if (data?.data && Array.isArray(data.data)) {
            newsArray = data.data;
          } else if (data?.content && Array.isArray(data.content)) {
            newsArray = data.content;
          } else if (data?.news && Array.isArray(data.news)) {
            newsArray = data.news;
          } else {
            if (data && typeof data === 'object') {
              const keys = Object.keys(data);
              for (const key of keys) {
                if (Array.isArray(data[key])) {
                  newsArray = data[key];
                  break;
                }
              }
            }
          }

          return newsArray.slice(0, 3);
        },
        onError: (error) => {
          console.error('Error loading news:', error);
        }
      }
  );

  // Hàm mở modal chi tiết tin tức
  const openNewsDetailModal = (article) => {
    setSelectedNewsArticle(article);
    setIsNewsDetailModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Hàm đóng modal chi tiết tin tức
  const closeNewsDetailModal = () => {
    setIsNewsDetailModalOpen(false);
    setSelectedNewsArticle(null);
    document.body.style.overflow = 'unset';
  };

  // Xử lý Escape key cho News Detail Modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isNewsDetailModalOpen) {
        closeNewsDetailModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isNewsDetailModalOpen]);

  const stats = React.useMemo(() => {
    if (dashboardStats) {
      return [
        {
          icon: Trophy,
          label: 'Giải đang diễn ra',
          value: dashboardStats.activeTournaments?.toString() || '0',
          color: 'text-sports-orange'
        },
        {
          icon: Users,
          label: 'Đội tham gia',
          value: dashboardStats.registeredTeams?.toString() || '0',
          color: 'text-sports-green'
        },
        {
          icon: Calendar,
          label: 'Trận đã thi đấu',
          value: dashboardStats.matchesPlayed?.toString() || '0',
          color: 'text-sports-purple'
        },
        {
          icon: Target,
          label: 'Tỷ lệ thành công',
          value: dashboardStats.successRate ? `${Math.round(dashboardStats.successRate)}%` : '0%',
          color: 'text-sports-pink'
        },
      ];
    }

    return [
      { icon: Trophy, label: 'Giải đang diễn ra', value: '-', color: 'text-sports-orange' },
      { icon: Users, label: 'Đội tham gia', value: '-', color: 'text-sports-green' },
      { icon: Calendar, label: 'Trận đã thi đấu', value: '-', color: 'text-sports-purple' },
      { icon: Target, label: 'Tỷ lệ thành công', value: '-', color: 'text-sports-pink' },
    ];
  }, [dashboardStats]);

  const features = [
    {
      title: 'Quản lý đa môn thể thao',
      description: 'Tạo và quản lý các hoạt động thể thao đa dạng. Từ bóng đá, bóng rổ đến cầu lông, bóng chuyền.',
      icon: Trophy,
    },
    {
      title: 'Đăng ký vận động viên',
      description: 'Quy trình đăng ký vận động viên và đội thi đấu đơn giản với quản lý thông tin chi tiết.',
      icon: Users,
    },
    {
      title: 'Theo dõi kết quả',
      description: 'Cập nhật kết quả thi đấu theo thời gian thực cho tất cả các môn thể thao.',
      icon: Play,
    },
    {
      title: 'Thống kê & Xếp hạng',
      description: 'Thống kê toàn diện và bảng xếp hạng cho các môn thể thao và vận động viên.',
      icon: Target,
    },
  ];

  // Mock data cho các sự kiện thể thao sắp tới
  const upcomingEvents = [
    {
      id: 1,
      homeTeam: 'Đại học Bách Khoa',
      awayTeam: 'Đại học Quốc Gia',
      sport: 'Bóng đá',
      date: '2025-06-01',
      time: '14:00',
      venue: 'Sân vận động Quốc Gia'
    },
    {
      id: 2,
      homeTeam: 'Đại học Kinh Tế',
      awayTeam: 'Đại học Ngoại Thương',
      sport: 'Bóng rổ',
      date: '2025-06-02',
      time: '16:00',
      venue: 'Nhà thi đấu Thành phố'
    },
    {
      id: 3,
      homeTeam: 'Đại học Y',
      awayTeam: 'Đại học Luật',
      sport: 'Cầu lông',
      date: '2025-06-03',
      time: '09:00',
      venue: 'Cung thể thao'
    }
  ];

  // Mock data cho kết quả mới nhất
  const recentResults = [
    {
      id: 1,
      homeTeam: 'Đại học Y',
      awayTeam: 'Đại học Luật',
      homeScore: 2,
      awayScore: 1,
      sport: 'Bóng đá',
      date: '2025-05-28'
    },
    {
      id: 2,
      homeTeam: 'Đại học Sư Phạm',
      awayTeam: 'Đại học Công Nghệ',
      homeScore: 78,
      awayScore: 82,
      sport: 'Bóng rổ',
      date: '2025-05-27'
    },
    {
      id: 3,
      homeTeam: 'Đại học Ngoại Thương',
      awayTeam: 'Đại học Kinh Tế',
      homeScore: 21,
      awayScore: 15,
      sport: 'Cầu lông',
      date: '2025-05-26'
    }
  ];

  return (
      <div className="min-h-screen">
        {/* NewsDetailModal */}
        <NewsDetailModal
            newsItem={selectedNewsArticle}
            show={isNewsDetailModalOpen}
            onClose={closeNewsDetailModal}
        />

        {/* Sport Image Gallery - Only show in development */}
        {showImageGallery && (
          <SportImageGallery onClose={() => setShowImageGallery(false)} />
        )}

        {/* Hero Section với ảnh sân thể thao tổng hợp */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background Image - Multi-sport stadium */}
          <div className="absolute inset-0">
            <StadiumHeroImage className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
          </div>
          
          {/* Floating particles */}
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                Hệ thống quản lý thể thao{' '}
                <span className="bg-gradient-to-r from-red-400 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  EduSports
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto animate-slide-up">
                Hệ thống quản lý các hoạt động thể thao tổng hợp cho các trường đại học.
                Tổ chức, thi đấu và tôn vinh thành tích thể thao đa dạng.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                <Link
                    to="/tournaments"
                    className="group bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2 animate-glow"
                >
                  <Trophy className="h-5 w-5 group-hover:animate-bounce-slow" />
                  <span>Xem các môn thể thao</span>
                </Link>
                <Link
                    to="/register"
                    className="group glass-effect text-white hover:bg-white/20 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2"
                >
                  <Users className="h-5 w-5 group-hover:animate-float" />
                  <span>Tham gia ngay</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-br from-red-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {statsLoading ? (
                <div className="text-center">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                      <div key={index} className="text-center group animate-scale-hover">
                        <div className="flex justify-center mb-4">
                          <div className={`p-4 rounded-full transform transition-all duration-300 group-hover:scale-110 ${
                            index === 0 ? 'bg-gradient-to-br from-red-500 to-red-700' :
                            index === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                            index === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                            'bg-gradient-to-br from-red-600 via-purple-600 to-blue-600'
                          }`}>
                            <stat.icon className="h-8 w-8 text-white group-hover:animate-bounce-slow" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {stat.value}
                        </div>
                        <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                          {stat.label}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        {/* 3 Sections chính theo mẫu */}
        {/* <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> */}
              
              {/* SỰ KIỆN TIẾP THEO */}
              {/* <div className="bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-glow">
                <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center space-x-2">
                  <Zap className="h-6 w-6 animate-bounce-slow" />
                  <span>SỰ KIỆN TIẾP THEO</span>
                </h3>
                {upcomingEvents.slice(0, 1).map((event) => (
                  <div key={event.id} className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm bg-white/20 rounded-full px-3 py-1 mb-2 inline-block">
                        {event.sport}
                      </div>
                      <div className="text-lg font-semibold">{event.homeTeam}</div>
                      <div className="text-4xl font-bold my-2">VS</div>
                      <div className="text-lg font-semibold">{event.awayTeam}</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.time} - {formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}

              {/* LỊCH THỂ THAO SẮP TỚI */}
              {/* <div className="bg-white p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-100">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center space-x-2">
                  <Calendar className="h-6 w-6 text-purple-600 animate-float" />
                  <span>LỊCH THỂ THAO SẮP TỚI</span>
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">{event.homeTeam}</div>
                        <div className="text-xs text-gray-500">vs</div>
                        <div className="text-sm font-medium">{event.awayTeam}</div>
                      </div>
                      <div className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1 text-center mb-1 inline-block w-full">
                        {event.sport}
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        {event.time} - {formatDate(event.date)}
                      </div>
                      <div className="text-xs text-gray-500 text-center">{event.venue}</div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/tournaments"
                  className="block text-center mt-4 text-purple-600 hover:text-purple-800 font-medium"
                >
                  Xem tất cả →
                </Link>
              </div> */}

              {/* KẾT QUẢ MỚI NHẤT */}
              {/* <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 text-white p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center space-x-2">
                  <Award className="h-6 w-6 animate-bounce-slow" />
                  <span>KẾT QUẢ MỚI NHẤT</span>
                </h3>
                <div className="space-y-4">
                  {recentResults.map((result) => (
                    <div key={result.id} className="space-y-2">
                      <div className="text-xs bg-white/20 rounded-full px-2 py-1 text-center mb-2">
                        {result.sport}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">{result.homeTeam}</div>
                        <div className="text-lg font-bold">
                          {result.homeScore} - {result.awayScore}
                        </div>
                        <div className="text-sm">{result.awayTeam}</div>
                      </div>
                      <div className="text-xs text-center opacity-80">
                        {formatDate(result.date)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/tournaments"
                  className="block text-center mt-4 text-white hover:text-gray-200 font-medium"
                >
                  Xem thêm kết quả →
                </Link>
              </div> */}
            {/* </div>
          </div>
        </section> */}

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mọi thứ bạn cần để quản lý hoạt động thể thao
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Từ đăng ký đến kết quả cuối cùng, nền tảng toàn diện của chúng tôi xử lý mọi khía cạnh
                của quản lý các hoạt động thể thao đa dạng với các công cụ chuyên nghiệp.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                  <div key={index} className="group card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 border-2 border-transparent hover:border-gradient-to-r hover:border-blue-300">
                    <div className="text-center">
                      <div className={`p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                        index === 0 ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' :
                        index === 1 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' :
                        index === 2 ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700' :
                        'bg-gradient-to-br from-red-600 via-purple-600 to-blue-600'
                      } shadow-lg group-hover:shadow-2xl`}>
                        <feature.icon className="h-10 w-10 text-white group-hover:animate-bounce-slow" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Tournaments */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Hoạt động thể thao nổi bật</h2>
                <p className="text-xl text-gray-600">Tham gia các hoạt động thể thao thú vị đang diễn ra</p>
              </div>
              <Link
                  to="/tournaments"
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {tournamentsLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {(tournaments || []).slice(0, 3).map((tournament, index) => (
                      <div key={tournament.id} className="group card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1">
                        <div className="relative mb-4 overflow-hidden rounded-xl">
                          <div className="relative h-40 rounded-xl overflow-hidden">
                            <SportImage
                              src={
                                index === 0 ? 
                                'https://phongvu.vn/cong-nghe/wp-content/uploads/sites/2/2022/12/hinh-nen-bong-da-3.png' :
                                index === 1 ?
                                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR6JOE7E2eX3ft9co3dVKUdxkjEIFhmtq8jA&s' :
                                'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_11_30_638369553968368819_co-tft-bia.jpg'
                              }
                              alt={`${tournament.name} - Giải thể thao`}
                              fallbackType={
                                index === 0 ? 'football' :
                                index === 1 ? 'basketball' :
                                'volleyball'
                              }
                              className="w-full h-40 object-cover transform transition-all duration-500 group-hover:scale-110"
                              gradientClass={
                                index === 0 ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' :
                                index === 1 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' :
                                'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                              }
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                          </div>
                          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium glass-effect ${getStatusColor(tournament.status)}`}>
                            {tournament.status}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tournament.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span>Bắt đầu: {formatDate(tournament.startDate)}</span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{tournament.maxTeams} đội</span>
                          </span>
                        </div>
                        <Link
                            to={`/tournaments/${tournament.id}`}
                            className="group bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full text-center block"
                        >
                          <span className="group-hover:animate-bounce-slow">Xem chi tiết</span>
                        </Link>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        {/* Latest News */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Tin tức mới nhất</h2>
                <p className="text-xl text-gray-600">Cập nhật tin tức thể thao mới nhất</p>
              </div>
              <Link
                  to="/news"
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {newsLoading ? (
                <div className="text-center">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600">Đang tải tin tức...</p>
                </div>
            ) : newsError ? (
                <div className="text-center">
                  <p className="text-red-600">Lỗi tải tin tức: {newsError.message}</p>
                  <p className="text-gray-600 mt-2">Vui lòng kiểm tra backend có đang chạy không.</p>
                </div>
            ) : !news || news.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-600">Hiện tại chưa có tin tức nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {news.map((article, index) => {
                    return (
                        <div
                            key={article.id || index}
                            className="group card hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:rotate-1 overflow-hidden"
                            onClick={() => openNewsDetailModal(article)}
                        >
                          <div className="relative h-40 rounded-xl mb-4 overflow-hidden">
                            {article.attachments && article.attachments.length > 0 ? (
                                <SportImage
                                  src={newsService.getImageUrl(article.attachments[0].url)}
                                  alt={article.name || 'Hình ảnh tin tức'}
                                  fallbackType={
                                    index === 0 ? 'running' :
                                    index === 1 ? 'tennis' :
                                    'swimming'
                                  }
                                  className="w-full h-40 object-cover transform transition-all duration-500 group-hover:scale-110"
                                  gradientClass={
                                    index === 0 ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' :
                                    index === 1 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' :
                                    'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                                  }
                                />
                            ) : (
                                <SportImage
                                  src={
                                    index === 0 ? 
                                    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' :
                                    index === 1 ?
                                    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' :
                                    'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
                                  }
                                  alt={`Tin tức thể thao ${index + 1}`}
                                  fallbackType={
                                    index === 0 ? 'running' :
                                    index === 1 ? 'tennis' :
                                    'swimming'
                                  }
                                  className="w-full h-40 object-cover transform transition-all duration-500 group-hover:scale-110"
                                  gradientClass={
                                    index === 0 ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' :
                                    index === 1 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' :
                                    'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                                  }
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {article.name || article.title || 'Không có tiêu đề'}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {article.shortDescription || article.content || 'Không có nội dung'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {article.createdAt ? formatDate(article.createdAt) : 'Gần đây'}
                            </span>
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openNewsDetailModal(article);
                                }}
                                className="group/btn text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 transform transition-all duration-300 hover:scale-110"
                            >
                              <span>Đọc thêm</span>
                              <ArrowRight className="h-3 w-3 group-hover/btn:animate-bounce-slow" />
                            </button>
                          </div>
                        </div>
                    );
                  })}
                </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <SportImage
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="CTA Background - Thể thao"
              fallbackType="stadium"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-purple-900/80 to-blue-900/90"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu hành trình thể thao của bạn?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn vận động viên và nhà tổ chức tin tưởng EduSports cho nhu cầu quản lý hoạt động thể thao.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                  to="/register"
                  className="bg-white text-purple-700 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Bắt đầu ngay hôm nay
              </Link>
              <Link
                  to="/tournaments"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-700 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Khám phá các môn thể thao
              </Link>
            </div>
          </div>
        </section>
      </div>
  );
};

export default HomePage;