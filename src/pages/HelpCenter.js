import React from 'react';
// Sửa đổi dòng import này:
import { HelpCircle, BookOpen, MessageSquare, Search, Mail } from 'lucide-react'; // Thêm Mail vào đây
import { Link } from 'react-router-dom'; // Import Link cho liên kết nội bộ

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative text-center py-16 px-6 sm:px-12 bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-teal-200" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
            Trung tâm trợ giúp
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
            Chào mừng bạn đến với Trung tâm trợ giúp EduSports! Tìm câu trả lời cho các câu hỏi thường gặp,
            <br className="hidden sm:inline" /> khám phá hướng dẫn sử dụng và liên hệ với đội ngũ hỗ trợ của chúng tôi.
          </p>
          {/* Optional: Search Bar for Help Center */}
          <div className="mt-8 relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề hoặc câu hỏi..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {/* FAQs Section */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                Các câu hỏi thường gặp (FAQs)
              </h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Làm cách nào để đăng ký tài khoản?</h3>
                <p className="text-gray-700">
                  Bạn có thể đăng ký tài khoản bằng cách nhấp vào nút "Đăng ký" ở góc trên bên phải màn hình và làm theo hướng dẫn.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Làm cách nào để tạo giải đấu mới?</h3>
                <p className="text-gray-700">
                  Nếu bạn là Ban tổ chức hoặc Quản trị viên, bạn có thể tạo giải đấu từ trang tổng quan của mình. Điều hướng đến phần "Quản lý giải đấu" và tìm nút "Tạo giải đấu mới".
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Làm cách nào để tham gia một đội?</h3>
                <p className="text-gray-700">
                  Bạn có thể tham gia một đội hiện có bằng cách nhận lời mời từ đội trưởng hoặc bằng cách tìm kiếm các đội công khai và gửi yêu cầu.
                </p>
              </div>
              {/* Add more FAQs here */}
            </div>
          </section>

          {/* User Guides Section */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                Hướng dẫn sử dụng
              </h2>
            </div>
            <ul className="list-none space-y-4"> {/* Changed to list-none for custom styling */}
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">1.</span>
                <p className="text-gray-700">Hướng dẫn Quản lý người dùng</p>
              </li>
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">2.</span>
                <p className="text-gray-700">Hướng dẫn Tin tức và Thông báo</p>
              </li>
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">3.</span>
                <p className="text-gray-700">Hướng dẫn Tạo và Quản lý trận đấu</p>
              </li>
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">4.</span>
                <p className="text-gray-700">Hướng dẫn về Sơ đồ giải đấu</p>
              </li>
              {/* Add more guides */}
            </ul>
          </section>

          {/* Need More Help Section */}
          <section className="text-center py-8 bg-blue-50 rounded-lg shadow-inner">
            <div className="flex items-center justify-center text-gray-800 mb-4">
              <MessageSquare className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold">Bạn vẫn cần trợ giúp?</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Nếu bạn không thể tìm thấy câu trả lời cho câu hỏi của mình, đừng ngần ngại liên hệ với chúng tôi.
            </p>
            <Link to="/contact-us" className="btn-primary inline-flex items-center space-x-2 px-6 py-3 text-lg">
              <Mail className="h-5 w-5" /> {/* <-- Dòng 101, nơi 'Mail' được sử dụng */}
              <span>Liên hệ đội ngũ hỗ trợ của chúng tôi</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;