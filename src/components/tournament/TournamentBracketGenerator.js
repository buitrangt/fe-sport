import React, { useState } from 'react';
import { Play, Trophy, Users, AlertCircle } from 'lucide-react';
import { tournamentKnockoutService } from '../../services';
import toast from 'react-hot-toast';

const TournamentBracketGenerator = ({ tournament, onBracketGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bracketData, setBracketData] = useState({
    type: 'SINGLE_ELIMINATION',
    randomize: true
  });

  const handleGenerateBracket = async () => {
    setIsGenerating(true);
    try {
      console.log('🚀 Đang tạo nhánh đấu cho giải đấu:', tournament.id);
      console.log('📊 Dữ liệu nhánh đấu:', bracketData);
      console.log('👥 Số đội hiện tại:', tournament.currentTeams);
      
      // Gỡ lỗi: Kiểm tra dữ liệu đội trước khi tạo nhánh đấu
      try {
        const teamsResponse = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/teams`);
        const teamsData = await teamsResponse.json();
        console.log('📊 Phản hồi API đội:', teamsData);
        console.log('📊 Số lượng đội:', teamsData?.data?.length || 0);
        console.log('📊 ID đội:', teamsData?.data?.map(t => ({ id: t.id, name: t.name })) || []);
      } catch (teamError) {
        console.error('⚠️ Không thể lấy dữ liệu đội để gỡ lỗi:', teamError);
      }
      
      // ĐÃ SỬA: Gửi đúng định dạng yêu cầu
      const requestData = {
        shuffleTeams: bracketData.randomize,
        bracketType: bracketData.type
      };
      
      console.log('📤 [Tạo] Đang gửi yêu cầu:', requestData);
      const response = await tournamentKnockoutService.generateBracket(tournament.id, requestData);
      console.log('✅ Tạo nhánh đấu thành công:', response);
      
      toast.success('Nhánh đấu giải đấu đã được tạo thành công!');
      onBracketGenerated?.(response.data);
    } catch (error) {
      console.error('❌ Lỗi tạo nhánh đấu:', error);
      console.error('📋 Chi tiết lỗi:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        statusText: error.response?.statusText
      });
      
      // Xử lý lỗi chi tiết hơn
      let errorMessage = 'Không thể tạo nhánh đấu';
      
      if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message;
        if (backendMessage?.includes('Data truncated')) {
          errorMessage = '🗃️ Lỗi cấu hình cơ sở dữ liệu. Trường trạng thái giải đấu có thể quá ngắn. Vui lòng liên hệ quản trị viên.';
        } else if (backendMessage?.includes('not-null property references a null')) {
          if (backendMessage.includes('team1') || backendMessage.includes('team2')) {
            errorMessage = '👥 Lỗi dữ liệu đội. Không thể tạo trận đấu vì việc gán đội là null. Vui lòng kiểm tra xem các đội đã được đăng ký đúng cách và có ID hợp lệ hay không.';
          } else {
            errorMessage = `🗃️ Vi phạm ràng buộc cơ sở dữ liệu: ${backendMessage}`;
          }
        } else if (backendMessage?.includes('not enough teams')) {
          errorMessage = `⚠️ Không đủ đội để tạo nhánh đấu. Cần ít nhất 2 đội, hiện tại: ${tournament.currentTeams || 0}`;
        } else if (backendMessage) {
          errorMessage = backendMessage;
        } else {
          errorMessage = 'Dữ liệu giải đấu không hợp lệ. Vui lòng kiểm tra xem giải đấu có đủ đội đã đăng ký hay không.';
        }
      } else if (error.response?.status === 500) {
        errorMessage = '🔧 Lỗi máy chủ. Vui lòng kiểm tra nhật ký backend và thử lại.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          padding: '16px',
          borderRadius: '8px'
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartKnockout = async () => {
    try {
      await tournamentKnockoutService.startKnockout(tournament.id);
      toast.success('Giải đấu loại trực tiếp đã bắt đầu!');
      window.location.reload(); // Tải lại để cập nhật trạng thái giải đấu
    } catch (error) {
      console.error('Lỗi khi bắt đầu loại trực tiếp:', error);
      toast.error(error.response?.data?.message || 'Không thể bắt đầu giải đấu loại trực tiếp');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-primary-500 to-sports-purple p-3 rounded-full">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Nhánh đấu giải đấu</h3>
          <p className="text-gray-600">Tạo và quản lý nhánh đấu giải đấu</p>
        </div>
      </div>

      {(tournament.status === 'REGISTRATION' || tournament.status === 'UPCOMING' || tournament.status === 'READY_TO_START') && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Sẵn sàng tạo nhánh đấu</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Giải đấu có {tournament.currentTeams || tournament.registeredTeams || 0} đội đã đăng ký. 
                  Hãy tạo nhánh đấu để thiết lập các trận đấu.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại nhánh đấu
              </label>
              <select
                value={bracketData.type}
                onChange={(e) => setBracketData({ ...bracketData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="SINGLE_ELIMINATION">Loại trực tiếp đơn</option>
                <option value="DOUBLE_ELIMINATION">Loại trực tiếp kép</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="randomize"
                checked={bracketData.randomize}
                onChange={(e) => setBracketData({ ...bracketData, randomize: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="randomize" className="text-sm text-gray-700">
                Ngẫu nhiên vị trí đội
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleGenerateBracket}
                disabled={isGenerating || (tournament.currentTeams || 0) < 2}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isGenerating ? 'Đang tạo...' : 'Tạo nhánh đấu'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {(tournament.status === 'READY' || tournament.status === 'READY_TO_START') && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trophy className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Nhánh đấu đã được tạo</h4>
                <p className="text-sm text-green-700 mt-1">
                  Nhánh đấu giải đấu đã sẵn sàng. Bây giờ bạn có thể bắt đầu vòng loại trực tiếp.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartKnockout}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Bắt đầu giải đấu loại trực tiếp</span>
          </button>
        </div>
      )}

      {tournament.status === 'ONGOING' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-orange-900">Giải đấu đang diễn ra</h4>
              <p className="text-sm text-orange-700 mt-1">
                Giải đấu loại trực tiếp hiện đang diễn ra. Quản lý các trận đấu từ tab trận đấu.
              </p>
            </div>
          </div>
        </div>
      )}

      {tournament.status === 'COMPLETED' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Trophy className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Giải đấu đã hoàn thành</h4>
              <p className="text-sm text-gray-700 mt-1">
                Giải đấu này đã hoàn thành. Xem kết quả cuối cùng và nhánh đấu.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracketGenerator;