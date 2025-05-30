import React from 'react';
import TournamentBracketDebugger from '../components/debug/TournamentBracketDebugger';

const SimpleDebugPage = () => {
  console.log('🔧 [Debug] DebugPage component rendered successfully');
  console.log('🔧 [Debug] Current URL:', window.location.href);
  console.log('🔧 [Debug] NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 [Debug] REACT_APP_ENV:', process.env.REACT_APP_ENV);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔧 Debug Page - Working!
          </h1>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h2 className="font-semibold text-green-800">✅ Debug Route Active</h2>
              <p className="text-green-700">Trang debug đã load thành công!</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h2 className="font-semibold text-blue-800">📍 Current Info</h2>
              <ul className="text-blue-700 text-sm space-y-1">
                <li><strong>URL:</strong> {window.location.href}</li>
                <li><strong>Path:</strong> {window.location.pathname}</li>
                <li><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</li>
                <li><strong>REACT_APP_ENV:</strong> {process.env.REACT_APP_ENV || 'undefined'}</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h2 className="font-semibold text-yellow-800">🧪 Test Links</h2>
              <div className="space-y-2">
                <a 
                  href="/admin/tournaments/44" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  ➡️ Go to Problem Page: /admin/tournaments/44
                </a>
                <a 
                  href="/admin" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  ➡️ Go to Admin Panel: /admin
                </a>
                <a 
                  href="/" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  ➡️ Go to Home: /
                </a>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h2 className="font-semibold text-gray-800">🚀 Next Steps</h2>
              <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                <li>Kiểm tra console logs để debug info</li>
                <li>Click vào link "Problem Page" để test fix</li>
                <li>Mở DevTools → Console để xem API logs</li>
                <li>Kiểm tra Network tab để xem HTTP requests</li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Bracket Generation Debugger */}
        <TournamentBracketDebugger tournamentId={44} />
      </div>
    </div>
  );
};

export default SimpleDebugPage;
