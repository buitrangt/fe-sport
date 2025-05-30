import React from 'react';
import { FileText, UserCheck, Shield, ClipboardList, Info } from 'lucide-react'; // Import các icon phù hợp
import { Link } from 'react-router-dom'; // Import Link

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative text-center py-16 px-6 sm:px-12 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <FileText className="h-16 w-16 mx-auto mb-4 text-orange-200" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
            Điều khoản dịch vụ
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
            Bằng cách sử dụng EduSports, bạn đồng ý với các điều khoản này.
            <br className="hidden sm:inline" /> Vui lòng đọc kỹ.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Introduction */}
          <section className="mb-10 text-gray-700 leading-relaxed">
            <p className="mb-4">
              Chào mừng bạn đến với EduSports! Các Điều khoản dịch vụ này ("Điều khoản") điều chỉnh việc bạn sử dụng trang web, ứng dụng và các dịch vụ liên quan của chúng tôi (gọi chung là "Dịch vụ").
            </p>
            <p>
              Vui lòng đọc kỹ các Điều khoản này trước khi sử dụng Dịch vụ của chúng tôi. Bằng cách truy cập hoặc sử dụng Dịch vụ, bạn đồng ý bị ràng buộc bởi các Điều khoản này và <Link to="/privacy-policy" className="text-primary-600 hover:underline font-medium">Chính sách quyền riêng tư</Link> của chúng tôi. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, bạn có thể không truy cập Dịch vụ.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <UserCheck className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                1. Chấp thuận các Điều khoản
              </h2>
            </div>
            <p className="text-gray-700 bg-gray-100 p-6 rounded-lg shadow-sm">
              Bằng cách truy cập hoặc sử dụng Dịch vụ của chúng tôi, bạn xác nhận sự đồng ý của mình bị ràng buộc bởi các Điều khoản này và Chính sách quyền riêng tư của chúng tôi. Nếu bạn không đồng ý với các Điều khoản này, bạn không được phép sử dụng Dịch vụ của chúng tôi. Các Điều khoản này áp dụng cho tất cả khách truy cập, người dùng và những người khác truy cập hoặc sử dụng Dịch vụ.
            </p>
          </section>

          {/* 2. User Accounts */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <ClipboardList className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                2. Tài khoản người dùng
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  Bạn phải ít nhất 13 tuổi để sử dụng Dịch vụ này. Nếu bạn dưới 18 tuổi, bạn phải có sự cho phép của cha mẹ hoặc người giám hộ để sử dụng Dịch vụ.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình cũng như hạn chế quyền truy cập vào máy tính hoặc thiết bị của bạn, và bạn đồng ý chịu trách nhiệm về tất cả các hoạt động xảy ra dưới tài khoản hoặc mật khẩu của mình.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  Bạn đồng ý cung cấp thông tin chính xác, đầy đủ và hiện tại khi đăng ký tài khoản và cập nhật thông tin của mình khi cần thiết để giữ cho thông tin đó chính xác.
                </p>
              </li>
            </ul>
          </section>

          {/* 3. Intellectual Property Rights */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                3. Quyền sở hữu trí tuệ
              </h2>
            </div>
            <p className="text-gray-700 bg-gray-100 p-6 rounded-lg shadow-sm">
              Tất cả nội dung, tính năng và chức năng của Dịch vụ (bao gồm nhưng không giới hạn ở tất cả thông tin, phần mềm, văn bản, hiển thị, hình ảnh, video và âm thanh, cũng như thiết kế, lựa chọn và sắp xếp của chúng) thuộc sở hữu của EduSports, các nhà cấp phép của nó hoặc các nhà cung cấp khác của tài liệu đó và được bảo vệ bởi luật bản quyền, nhãn hiệu, bằng sáng chế, bí mật thương mại và các luật sở hữu trí tuệ hoặc quyền sở hữu khác.
            </p>
            <p className="text-gray-700 mt-4">
              Bạn được cấp một giấy phép giới hạn, không độc quyền, không thể chuyển nhượng, có thể thu hồi để truy cập và sử dụng Dịch vụ chỉ cho mục đích cá nhân, phi thương mại của bạn.
            </p>
          </section>

          {/* 4. Limitation of Liability */}
          <section className="text-gray-700">
            <div className="flex items-center text-gray-800 mb-6">
              <Info className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                4. Giới hạn trách nhiệm pháp lý
              </h2>
            </div>
            <p className="mb-4 bg-gray-100 p-6 rounded-lg shadow-sm">
              Trong mọi trường hợp, EduSports, cũng như các giám đốc, nhân viên, đối tác, đại lý, nhà cung cấp hoặc các công ty liên kết của nó, sẽ không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, do hậu quả hoặc mang tính trừng phạt nào, bao gồm nhưng không giới hạn ở việc mất lợi nhuận, dữ liệu, việc sử dụng, uy tín hoặc các tổn thất vô hình khác, do (i) việc bạn truy cập hoặc sử dụng hoặc không thể truy cập hoặc sử dụng Dịch vụ; (ii) bất kỳ hành vi hoặc nội dung nào của bất kỳ bên thứ ba nào trên Dịch vụ; (iii) bất kỳ nội dung nào được lấy từ Dịch vụ; và (iv) việc truy cập, sử dụng hoặc thay đổi trái phép các nội dung hoặc thông tin của bạn, cho dù dựa trên bảo hành, hợp đồng, sai phạm (bao gồm sơ suất) hoặc bất kỳ lý thuyết pháp lý nào khác, cho dù chúng tôi đã được thông báo về khả năng xảy ra thiệt hại đó hay chưa.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;