import React from 'react';
import { ShieldCheck, Info, User, Share2, Award } from 'lucide-react'; // Thêm các icon phù hợp
import { Link } from 'react-router-dom'; // <-- THÊM DÒNG NÀY ĐỂ IMPORT LINK

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative text-center py-16 px-6 sm:px-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-blue-200" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
            Chính sách quyền riêng tư
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
            Quyền riêng tư của bạn là tối quan trọng. Chính sách này nêu rõ cách EduSports thu thập,
            <br className="hidden sm:inline" /> sử dụng và bảo vệ thông tin cá nhân của bạn.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Introduction */}
          <section className="mb-10 text-gray-700 leading-relaxed">
            <p className="mb-4">
              Chính sách quyền riêng tư này mô tả cách EduSports ("chúng tôi" hoặc "của chúng tôi") thu thập, sử dụng và tiết lộ thông tin cá nhân của bạn khi bạn sử dụng các dịch vụ của chúng tôi, bao gồm trang web và các ứng dụng của chúng tôi. Bằng cách truy cập hoặc sử dụng các dịch vụ của chúng tôi, bạn đồng ý với các điều khoản của Chính sách quyền riêng tư này.
            </p>
            <p>
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và xử lý dữ liệu của bạn một cách công khai và minh bạch.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Info className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                1. Thông tin chúng tôi thu thập
              </h2>
            </div>
            <p className="text-gray-700 mb-4">Chúng tôi thu thập nhiều loại thông tin khác nhau để cung cấp và cải thiện dịch vụ của chúng tôi:</p>
            <ul className="space-y-4">
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="h-5 w-5 text-purple-600 mr-2" /> Thông tin cá nhân
                </h3>
                <p className="text-gray-700">
                  Điều này bao gồm thông tin bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như tên, địa chỉ email, số điện thoại, ngày sinh và các chi tiết nhận dạng khác khi bạn đăng ký tài khoản, tham gia các giải đấu hoặc liên hệ với chúng tôi.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="h-5 w-5 text-purple-600 mr-2" /> Dữ liệu sử dụng
                </h3>
                <p className="text-gray-700">
                  Thông tin về cách bạn truy cập và sử dụng trang web và các ứng dụng của chúng tôi. Điều này có thể bao gồm địa chỉ Giao thức Internet (IP) của bạn, loại trình duyệt, các trang đã xem, thời gian dành cho các trang và các dữ liệu chẩn đoán khác.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <Share2 className="h-5 w-5 text-purple-600 mr-2" /> Thông tin từ bên thứ ba
                </h3>
                <p className="text-gray-700">
                  Chúng tôi có thể nhận thông tin về bạn từ các đối tác của chúng tôi hoặc từ các nguồn công khai để nâng cao dịch vụ của chúng tôi.
                </p>
              </li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Info className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                2. Cách chúng tôi sử dụng thông tin của bạn
              </h2>
            </div>
            <p className="text-gray-700 mb-4">Chúng tôi sử dụng thông tin đã thu thập cho các mục đích khác nhau:</p>
            <ul className="space-y-4">
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">Để cung cấp và duy trì dịch vụ của chúng tôi.</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">Để cải thiện trải nghiệm người dùng và cá nhân hóa nội dung.</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">Để phân tích cách các dịch vụ của chúng tôi được sử dụng nhằm phát triển các tính năng mới.</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">Để gửi cho bạn các thông báo, cập nhật và thông tin tiếp thị (với sự đồng ý của bạn).</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">Để thực hiện các nghĩa vụ pháp lý và bảo vệ quyền của chúng tôi.</p>
              </li>
            </ul>
          </section>

          {/* 3. Sharing Your Information */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Share2 className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                3. Chia sẻ thông tin của bạn
              </h2>
            </div>
            <p className="text-gray-700 bg-gray-100 p-6 rounded-lg shadow-sm">
              Chúng tôi không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba, trừ khi có sự đồng ý của bạn hoặc khi luật pháp yêu cầu. Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ bên thứ ba đáng tin cậy, những người hỗ trợ chúng tôi trong việc vận hành trang web, thực hiện hoạt động kinh doanh hoặc phục vụ người dùng của chúng tôi, với điều kiện các bên đó đồng ý giữ bí mật thông tin này.
            </p>
          </section>

          {/* 4. Your Rights */}
          <section className="text-gray-700">
            <div className="flex items-center text-gray-800 mb-6">
              <User className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                4. Quyền của bạn
              </h2>
            </div>
            <p className="mb-4 bg-gray-100 p-6 rounded-lg shadow-sm">
              Bạn có quyền truy cập, chỉnh sửa, xóa hoặc phản đối việc xử lý thông tin cá nhân của mình. Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua trang <Link to="/contact-us" className="text-primary-600 hover:underline font-medium">Liên hệ</Link> của chúng tôi. Chúng tôi sẽ phản hồi yêu cầu của bạn theo luật bảo vệ dữ liệu hiện hành.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;