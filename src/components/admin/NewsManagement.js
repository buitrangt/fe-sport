// src/components/admin/NewsManagement.js
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Image,
  AlertTriangle,
  X
} from 'lucide-react';
import newsService from '../../services/newsService';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';
import CreateNewsModal from './CreateNewsModal'; // <-- Import CreateNewsModal (chỉ tạo mới)
import UpdateNewsModal from './UpdateNewsModal'; // <-- Import UpdateNewsModal mới
import NewsDetailModal from './NewsDetailModal';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    console.error("Định dạng ngày không hợp lệ:", dateString, e);
    return 'Ngày không hợp lệ';
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};


const NewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false); // Cho modal tạo mới
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Cho modal cập nhật
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null); // Dùng chung cho cả detail và update

  const queryClient = useQueryClient();

  const { data: news, isLoading, error, refetch } = useQuery(
      ['admin-news', { page, searchTerm }],
      async () => {
        console.log("DEBUG FETCH: Đang tìm nạp tin tức với trang:", page, "từ khóa tìm kiếm:", searchTerm);
        const allNews = await newsService.getAllNews();

        let filteredNews = allNews;
        if (searchTerm) {
          filteredNews = allNews.filter(article =>
              article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (article.shortDescription && article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        const itemsPerPage = 6;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedNews = filteredNews.slice(startIndex, endIndex);

        return {
          data: paginatedNews,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredNews.length / itemsPerPage),
            totalItems: filteredNews.length,
            hasNext: page < Math.ceil(filteredNews.length / itemsPerPage),
            hasPrev: page > 1
          }
        };
      },
      {
        staleTime: 2 * 60 * 1000,
        keepPreviousData: true,
        onError: (err) => {
          console.error("DEBUG FETCH ERROR: Lỗi khi tìm nạp các bài viết tin tức:", err);
        }
      }
  );

  const deleteNewsMutation = useMutation(
      (newsId) => newsService.deleteNews(newsId),
      {
        onSuccess: () => {
          toast.success('Bài viết tin tức đã được xóa thành công');
          queryClient.invalidateQueries('admin-news');
          queryClient.invalidateQueries('news');
        },
        onError: (error) => {
          console.error("DEBUG DELETE ERROR: Lỗi khi xóa bài viết tin tức:", error);
          toast.error(`Lỗi khi xóa tin tức: ${error.message || 'Vui lòng thử lại.'}`);
        }
      }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    queryClient.invalidateQueries('admin-news');
  };

  const handleDeleteNews = (newsId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài đăng này?')) {
      deleteNewsMutation.mutate(newsId);
    }
  };

  // Hàm xử lý khi click vào tin tức để mở modal chi tiết (Không thay đổi)
  const handleViewNewsDetail = (article) => {
    setSelectedNews(article);
    setShowDetailModal(true);
  };

  // Hàm xử lý khi click vào nút "Create Article"
  const handleCreateNews = () => {
    setSelectedNews(null); // Đảm bảo không có tin tức nào được chọn
    setShowCreateModal(true);
  };

  // Hàm xử lý khi click vào nút "Edit" của một tin tức
  const handleEditNews = (article) => {
    setSelectedNews(article); // Đặt tin tức cần chỉnh sửa
    setShowUpdateModal(true); // Mở modal cập nhật
  };

  // Callback khi CreateNewsModal submit thành công
  const handleNewsCreated = () => {
    setShowCreateModal(false);
    queryClient.invalidateQueries('admin-news');
    queryClient.invalidateQueries('news');
    refetch();
  };

  // Callback khi UpdateNewsModal submit thành công
  const handleNewsUpdated = () => {
    setShowUpdateModal(false);
    setSelectedNews(null); // Xóa tin tức đã chọn
    queryClient.invalidateQueries('admin-news');
    queryClient.invalidateQueries('news');
    refetch();
  };


  if (error) {
    return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Lỗi khi tải các bài viết tin tức. Vui lòng thử lại sau.</p>
        </div>
    );
  }

  return (
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quản Lý Tin Tức</h2>
            <p className="text-gray-600">Tạo, chỉnh sửa và xuất bản các bài viết tin tức và thông báo.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              {news?.pagination?.totalItems || 0} Bài Viết
            </div>
            <button
                onClick={handleCreateNews} // Gọi hàm để mở modal tạo mới
                className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo Bài Viết
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Tìm kiếm bài viết tin tức theo tiêu đề hoặc nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-field"
                />
              </div>
            </div>
            <button
                type="submit"
                className="btn-primary whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* News Grid Display */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
                <p className="text-gray-500 mt-2">Đang tải các bài viết tin tức...</p>
              </div>
          ) : news?.data?.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">Không tìm thấy bài viết tin tức nào.</p>
                <button
                    onClick={handleCreateNews}
                    className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Bài Viết Đầu Tiên Của Bạn
                </button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {news?.data?.map((article) => (
                    <div
                        key={article.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer"
                        onClick={() => handleViewNewsDetail(article)}
                    >
                      {/* Article Image */}
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                        {article.attachments && article.attachments.length > 0 ? (
                            <img
                                src={newsService.getImageUrl(article.attachments[0].url)}
                                alt={article.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=Không+có+ảnh'; }}
                            />
                        ) : (
                            <Image className="h-16 w-16 text-gray-400" />
                        )}
                      </div>

                      {/* Article Content Display */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {article.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                          {truncateText(article.shortDescription || article.content, 120)}
                        </p>

                        {/* Article Meta Data */}
                        {/* <div className="flex items-center text-xs text-gray-500 mb-4 mt-auto">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(article.createdAt)}</span>
                    <User className="h-3 w-3 ml-4 mr-1" />
                    <span>{article.author || 'Đội EduSports'}</span>
                  </div> */}

                        {/* Action Buttons for each article */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleViewNewsDetail(article); }}
                                className="btn-icon"
                                title="Xem Bài Viết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEditNews(article); }} // Gọi hàm để mở modal cập nhật
                                className="btn-icon text-blue-600 hover:text-blue-700"
                                title="Chỉnh Sửa Bài Viết"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteNews(article.id); }}
                              className="btn-icon text-red-600 hover:text-red-700"
                              title="Xóa Bài Viết"
                              disabled={deleteNewsMutation.isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}

          {/* Pagination Controls */}
          {news?.pagination?.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị trang <span className="font-medium">{news.pagination.currentPage}</span> trên <span className="font-medium">{news.pagination.totalPages}</span> ({news.pagination.totalItems} mục)
                </div>
                <div className="flex space-x-2">
                  <button
                      onClick={() => setPage(prev => prev - 1)}
                      disabled={!news.pagination.hasPrev || deleteNewsMutation.isLoading}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={!news.pagination.hasNext || deleteNewsMutation.isLoading}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Render Create News Modal */}
        <CreateNewsModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onNewsCreated={handleNewsCreated}
        />

        {/* Render Update News Modal */}
        <UpdateNewsModal
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            newsItem={selectedNews} // Truyền tin tức cần cập nhật
            onNewsUpdated={handleNewsUpdated}
        />

        {/* Render News Detail Modal */}
        <NewsDetailModal
            show={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            newsItem={selectedNews}
        />
      </div>
  );
};

export default NewsManagement;