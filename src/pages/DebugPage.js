import React from 'react';
import TournamentAPIDebugger from '../components/debug/TournamentAPIDebugger';

const DebugPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Debug Tools</h1>
          <p className="text-gray-600 mt-2">Debug API calls for Tournament Admin Page</p>
        </div>
        
        <TournamentAPIDebugger tournamentId={44} />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Chỉ hiển thị trong development mode</p>
          <p>URL: <code>/debug</code></p>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
