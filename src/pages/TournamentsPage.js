import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { tournamentServiceFixed as tournamentService } from '../services/tournamentServiceFixed';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';
import { getTournamentImageUrl } from '../utils/imageUtils';

const TournamentsPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('startDate');

  const { data: tournaments, isLoading, error, refetch } = useQuery(
    ['tournaments', { page, searchTerm, status: statusFilter, sortBy }],
    () => tournamentService.getAllTournaments({
      page,
      limit: 12,
      search: searchTerm,
      status: statusFilter,
      sortBy,
    }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      keepPreviousData: true,
      select: (response) => {
        // tournamentServiceFixed already handles the response format and returns { data: [...], pagination: {...} }
        if (response && response.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: response.pagination || {
              currentPage: page,
              totalPages: 1,
              totalItems: response.data.length,
              hasNext: false,
              hasPrev: false
            }
          };
        }
        
        // Fallback handling for other formats
        let data = [];
        let pagination = {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        };

        if (Array.isArray(response)) {
          data = response;
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data;
          pagination = response.pagination || pagination;
        } else if (response?.data?.content && Array.isArray(response.data.content)) {
          data = response.data.content;
          pagination = response.data.pagination || pagination;
        } else if (response?.data?.tournaments && Array.isArray(response.data.tournaments)) {
          data = response.data.tournaments;
          pagination = response.data.pagination || pagination;
        }

        return {
          data,
          pagination
        };
      }
    }
  );

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' }, // Translated
    { value: 'UPCOMING', label: 'Sắp diễn ra' }, // Translated
    { value: 'ONGOING', label: 'Đang diễn ra' }, // Translated
    { value: 'COMPLETED', label: 'Đã hoàn thành' }, // Translated
  ];

  const sortOptions = [
    { value: 'startDate', label: 'Ngày bắt đầu' }, // Translated
    { value: 'name', label: 'Tên' }, // Translated
    { value: 'createdAt', label: 'Ngày tạo' }, // Translated
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Lỗi khi tải giải đấu. Vui lòng thử lại sau.</p> {/* Translated */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Các giải đấu</h1> {/* Translated */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá các cuộc thi thể thao hấp dẫn và tham gia ngay {/* Translated */}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm giải đấu..." // Translated
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field min-w-[150px]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-[150px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sắp xếp theo {option.label} {/* Translated */}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Áp dụng {/* Translated */}
              </button>
              
              <button
                type="button"
                onClick={() => refetch()}
                className="btn-secondary whitespace-nowrap"
              >
                Làm mới {/* Translated */}
              </button>
            </div>
          </form>
        </div>

        {/* Tournament Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : tournaments?.data?.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy giải đấu nào</h3> {/* Translated */}
            <p className="text-gray-600">Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn</p> {/* Translated */}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tournaments?.data?.map((tournament) => {
                return (
                <div key={tournament.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="relative mb-4">
                    <div className="h-48 rounded-lg overflow-hidden bg-gradient-to-r from-primary-500 to-sports-purple flex items-center justify-center">
                      {tournament.imageUrl ? (
                        <img
                          src={getTournamentImageUrl(tournament.imageUrl)}
                          alt={tournament.name}
                          className="w-full h-full object-cover absolute inset-0"
                          style={{ opacity: 1 }}
                        />
                      ) : (
                        <Trophy className="h-20 w-20 text-white" />
                      )}
                    </div>
                    
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {
                      // Dịch trạng thái hiển thị
                      tournament.status === 'UPCOMING' ? 'Sắp diễn ra' :
                      tournament.status === 'ONGOING' ? 'Đang diễn ra' :
                      tournament.status === 'COMPLETED' ? 'Đã hoàn thành' :
                      tournament.status
                      }
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {tournament.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tournament.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Bắt đầu: {formatDate(tournament.startDate)}</span> {/* Translated */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Tối đa {tournament.maxTeams} đội</span> {/* Translated */}
                    </div>
                    {tournament.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{tournament.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/tournaments/${tournament.id}`}
                      className="btn-primary flex-1 text-center"
                    >
                      Xem chi tiết {/* Translated */}
                    </Link>
                    {tournament.status === 'UPCOMING' && (
                      <Link
                        to={`/tournaments/${tournament.id}/register`}
                        className="btn-secondary"
                      >
                        Đăng ký {/* Translated */}
                      </Link>
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Pagination */}
            {tournaments?.pagination?.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước {/* Translated */}
                </button>
                
                <span className="text-gray-600">
                  Trang {page} trên tổng số {tournaments.pagination.totalPages} {/* Translated */}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= tournaments.pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp theo {/* Translated */}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;