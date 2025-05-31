import React, { useState } from 'react';
import { 
  Play, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Target,
  Save,
  Crown,
  AlertCircle,
  Clock
} from 'lucide-react';

const TournamentWorkflowGuide = ({ tournament, currentRound, matches, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Safety check
  if (!tournament) {
    return null;
  }

  const totalMatches = matches?.length || 0;
  const completedMatches = matches?.filter(m => m?.status === 'COMPLETED').length || 0;
  const remainingMatches = totalMatches - completedMatches;

  const steps = [
    {
      id: 1,
      title: "Nhập Kết Quả Trận Đấu",
      description: "Nhập tỷ số cho mỗi trận đấu trong vòng hiện tại",
      icon: Save,
      status: remainingMatches > 0 ? 'current' : 'completed',
      details: [
        "Nhấp vào nút 'Nhập Tỷ Số' cho mỗi trận đấu",
        "Nhập tỷ số của các đội (phải khác nhau - không hòa)",
        "Nhấp 'Lưu' để xác nhận kết quả",
        "Trạng thái trận đấu sẽ chuyển sang ĐÃ HOÀN THÀNH"
      ]
    },
    {
      id: 2,
      title: "Hoàn Thành Vòng Hiện Tại",
      description: "Hoàn thành tất cả các trận đấu trong vòng này",
      icon: CheckCircle,
      status: remainingMatches === 0 ? 'completed' : 'pending',
      details: [
        `Hoàn thành ${remainingMatches} trận đấu còn lại`,
        "Tất cả các trận đấu phải có người thắng cuộc được xác định",
        "Tiến độ vòng đấu sẽ hiển thị 100%",
        "Sẵn sàng để chuyển sang vòng tiếp theo"
      ]
    },
    {
      id: 3,
      title: "Chuyển Vòng",
      description: "Đưa người thắng cuộc vào vòng tiếp theo",
      icon: ArrowRight,
      status: remainingMatches === 0 ? 'current' : 'pending',
      details: [
        "Truy cập tab 'Quản Lý Vòng Đấu'",
        "Nhấp vào nút 'Chuyển sang Vòng X'",
        "Hệ thống tự động tạo các trận đấu mới",
        "Người thắng cuộc trở thành người tham gia vòng tiếp theo"
      ]
    },
    {
      id: 4,
      title: "Lặp Lại Cho Đến Chung Kết",
      description: "Tiếp tục cho đến khi giải đấu hoàn thành",
      icon: Trophy,
      status: 'pending',
      details: [
        "Lặp lại bước 1-3 cho mỗi vòng",
        "Mỗi vòng có ít đội hơn",
        "Vòng chung kết xác định người thắng cuộc",
        "Trạng thái giải đấu trở thành ĐÃ HOÀN THÀNH"
      ]
    },
    {
      id: 5,
      title: "Tuyên Bố Người Thắng Cuộc",
      description: "Chúc mừng nhà vô địch giải đấu",
      icon: Crown,
      status: 'pending',
      details: [
        "Trận chung kết xác định nhà vô địch",
        "Người thắng cuộc được tự động công bố",
        "Giải đấu được đánh dấu là ĐÃ HOÀN THÀNH",
        "Kết quả là cuối cùng và công khai"
      ]
    }
  ];

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Quy Trình Quản Lý Giải Đấu</h2>
              <p className="text-blue-100">
                Hướng dẫn từng bước để quản lý giải đấu của bạn: {tournament.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Current Status */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{currentRound}</div>
                <div className="text-sm text-blue-100">Vòng Hiện Tại</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMatches}</div>
                <div className="text-sm text-blue-100">Tổng Số Trận</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{completedMatches}</div>
                <div className="text-sm text-blue-100">Đã Hoàn Thành</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{remainingMatches}</div>
                <div className="text-sm text-blue-100">Còn Lại</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tiến Độ Giải Đấu</span>
              <span className="text-sm text-gray-600">
                {completedMatches}/{totalMatches} trận đấu đã hoàn thành
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              
              return (
                <div 
                  key={step.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                    isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        getStepIcon(step.status)
                      }`}>
                        {step.id}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStepIcon(step.status)
                      }`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${
                          getStepColor(step.status)
                        }`}>
                          {step.status === 'completed' ? 'Đã Hoàn Thành' : 
                           step.status === 'current' ? 'Hiện Tại' : 'Đang Chờ'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      {/* Step Details */}
                      {isActive && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Hướng Dẫn Chi Tiết:</h4>
                          <ul className="space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="w-px h-6 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Action */}
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Hành Động Tiếp Theo Cần Thiết</h3>
                {remainingMatches > 0 ? (
                  <div>
                    <p className="text-orange-700 mb-2">
                      <strong>🎯 Nhập kết quả trận đấu:</strong> {remainingMatches} trận cần tỷ số
                    </p>
                    <p className="text-sm text-orange-600">
                      Chuyển đến tab "Kết Quả Trận Đấu" và nhấp "Nhập Tỷ Số" cho mỗi trận đấu đang chờ.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-orange-700 mb-2">
                      <strong>🚀 Chuyển vòng:</strong> Tất cả các trận đấu đã hoàn thành!
                    </p>
                    <p className="text-sm text-orange-600">
                      Chuyển đến tab "Quản Lý Vòng Đấu" và nhấp "Chuyển sang Vòng {currentRound + 1}".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            💡 Mẹo: Hoàn thành các trận đấu theo thứ tự và chuyển vòng một cách có hệ thống
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Đã hiểu!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentWorkflowGuide;