import React, { useState } from 'react';
import { tournamentService } from '../../services';

const TournamentApiTester = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('🧪 Đang kiểm tra API giải đấu...');
      const result = await tournamentService.getAllTournaments({
        page: 1,
        limit: 5
      });
      
      console.log('📊 Kết quả kiểm tra API:', result);
      setResponse(result);
    } catch (err) {
      console.error('❌ Kiểm tra API thất bại:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧪 Công Cụ Kiểm Tra API Giải Đấu</h2>
      
      <button 
        onClick={testApiCall}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Đang kiểm tra...' : 'Kiểm Tra Gọi API'}
      </button>

      {loading && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p>🔄 Đang kiểm tra cuộc gọi API...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800">❌ Lỗi</h3>
          <pre className="text-sm text-red-600 mt-2 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {response && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">✅ Thành công</h3>
            <div className="mt-2 text-sm text-green-600">
              <p><strong>Kiểu Dữ liệu:</strong> {Array.isArray(response.data) ? 'Mảng' : typeof response.data}</p>
              <p><strong>Độ Dài Dữ liệu:</strong> {response.data?.length || 'Không áp dụng'}</p>
              <p><strong>Có Phân trang:</strong> {response.pagination ? 'Có' : 'Không'}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold text-gray-800">📄 Phản Hồi Thô</h3>
            <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {response.data && Array.isArray(response.data) && response.data.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800">🏆 Giải đấu Mẫu</h3>
              <pre className="text-xs text-blue-600 mt-2 whitespace-pre-wrap">
                {JSON.stringify(response.data[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentApiTester;