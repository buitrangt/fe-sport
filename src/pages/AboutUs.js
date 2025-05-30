import React from 'react';
import { Lightbulb, Users, Target, Rocket, Trophy } from 'lucide-react'; // Import các icon phù hợp
import { Link } from 'react-router-dom'; // Import Link

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Hero Section - Kể câu chuyện */}
        <div className="relative text-center py-20 px-6 sm:px-12 bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
          <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-300 animate-bounce-slow" />
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight animate-fade-in-down">
            Về EduSports
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 max-w-2xl mx-auto animate-fade-in-up">
            Nâng tầm thế hệ vận động viên tiếp theo và thúc đẩy tinh thần fair play thông qua quản lý giải đấu đổi mới.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Our Story Section */}
          <section className="mb-12">
            <div className="flex items-center text-gray-800 mb-8 justify-center">
              <Lightbulb className="h-10 w-10 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold border-b-4 border-primary-500 pb-3 inline-block">
                Câu chuyện của chúng tôi
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="text-gray-700 leading-relaxed text-lg">
                <p className="mb-4">
                  EduSports được thành lập dựa trên một ý tưởng đơn giản nhưng mạnh mẽ: thay đổi cách các tổ chức giáo dục quản lý các giải đấu thể thao của họ. Chúng tôi nhận thấy những thách thức mà các nhà tổ chức phải đối mặt – từ việc lên lịch thủ công tẻ nhạt đến theo dõi điểm số phức tạp – và đã hình dung ra một giải pháp kỹ thuật số liền mạch.
                </p>
                <p className="mb-4">
                  Ra đời từ niềm đam mê với cả giáo dục và thể thao, nền tảng của chúng tôi được thiết kế tỉ mỉ để đơn giản hóa mọi khía cạnh của việc quản lý giải đấu. Chúng tôi tin rằng bằng cách tinh gọn các hoạt động, chúng tôi có thể giúp các trường học và tổ chức thanh thiếu niên tập trung nhiều hơn vào những gì thực sự quan trọng: nuôi dưỡng tài năng, thúc đẩy tinh thần đồng đội và tôn vinh thành tích.
                </p>
                <p>
                  Ngày nay, EduSports là minh chứng cho tầm nhìn đó, không ngừng phát triển để đáp ứng nhu cầu năng động của cộng đồng thể thao giáo dục trên toàn thế giới.
                </p>
              </div>
              <div className="order-first md:order-last">
                {/* Placeholder for an image */}
                <img
                  src="https://nativespeaker.vn/uploaded/page_1656_1712278968_1715676497.jpg"
                  alt="Học sinh chơi thể thao"
                  className="rounded-lg shadow-xl w-full h-64 object-cover md:h-auto"
                />
              </div>
            </div>
          </section>

          {/* Our Mission & Vision Section */}
          <section className="mb-12 bg-blue-50 p-8 rounded-lg shadow-lg">
            <div className="flex items-center text-gray-800 mb-8 justify-center">
              <Target className="h-10 w-10 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold border-b-4 border-primary-500 pb-3 inline-block">
                Sứ mệnh & Tầm nhìn của chúng tôi
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Rocket className="h-6 w-6 text-red-500 mr-2" /> Sứ mệnh của chúng tôi
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Cung cấp một hệ thống quản lý giải đấu trực quan, toàn diện và đáng tin cậy, giúp các tổ chức giáo dục tổ chức, quản lý và theo dõi các cuộc thi thể thao một cách dễ dàng và hiệu quả chưa từng có. Chúng tôi mong muốn giảm bớt gánh nặng hành chính, cho phép các nhà giáo dục và huấn luyện viên tập trung vào sự phát triển của học sinh.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" /> Tầm nhìn của chúng tôi
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Trở thành nền tảng hàng đầu cho thể thao giáo dục trên toàn thế giới, thúc đẩy một cộng đồng toàn cầu nơi mọi học sinh đều có cơ hội tham gia, cạnh tranh và phát triển thông qua các môn thể thao có tổ chức. Chúng tôi hình dung một tương lai nơi quản lý thể thao trở nên dễ dàng, toàn diện và đầy cảm hứng.
                </p>
              </div>
            </div>
          </section>

          {/* Our Team Section (Placeholder) */}
          <section className="mb-12">
            <div className="flex items-center text-gray-800 mb-8 justify-center">
              <Users className="h-10 w-10 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold border-b-4 border-primary-500 pb-3 inline-block">
                Gặp gỡ đội ngũ của chúng tôi
              </h2>
            </div>
            <p className="text-gray-700 text-center text-lg mb-8">
              Đằng sau EduSports là một đội ngũ tận tâm với niềm đam mê công nghệ và thể thao. Mặc dù chúng tôi không thể giới thiệu tất cả mọi người ở đây, nhưng chúng tôi đoàn kết bởi cam kết làm cho thể thao trở nên dễ tiếp cận và thú vị cho tất cả mọi người.
            </p>
            {/* You might add team member cards here later */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Example Team Member Card */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3001/3001758.png" // Placeholder image
                  alt="Tên thành viên nhóm"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-500"
                />
                <h3 className="text-xl font-semibold text-gray-900">Andev</h3>
                <p className="text-primary-600">Lập trình viên</p>
                <p className="text-gray-600 text-sm mt-2">Xây dựng các giải pháp mạnh mẽ và có khả năng mở rộng.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://www.pngkey.com/png/detail/151-1518198_avatar-anonimo-mujer-women-user-icon-png.png" // Placeholder image
                  alt="Tên thành viên nhóm"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-500"
                />
                <h3 className="text-xl font-semibold text-gray-900">TrangPT</h3>
                <p className="text-primary-600">Lập trình viên</p>
                <p className="text-gray-600 text-sm mt-2">Xây dựng các giải pháp mạnh mẽ và có khả năng mở rộng.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://cdn4.iconfinder.com/data/icons/mixed-set-1-1/128/28-512.png" // Placeholder image
                  alt="Tên thành viên nhóm"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-500"
                />
                <h3 className="text-xl font-semibold text-gray-900">Linh</h3>
                <p className="text-primary-600">Quản lý cộng đồng</p>
                <p className="text-gray-600 text-sm mt-2">Kết nối với người dùng và đối tác của chúng tôi.</p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-10 bg-green-50 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Sẵn sàng thay đổi cách tổ chức giải đấu của bạn?</h2>
            <p className="text-gray-700 text-lg mb-6 max-w-xl mx-auto">
              Hãy tham gia cộng đồng các tổ chức giáo dục đang ngày càng phát triển, tận dụng EduSports để có những sự kiện thể thao liền mạch, hiệu quả và thú vị.
            </p>
            <Link to="/contact-us" className="btn-primary inline-flex items-center space-x-2 px-8 py-4 text-xl">
              <Trophy className="h-6 w-6" />
              <span>Bắt đầu ngay hôm nay!</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;