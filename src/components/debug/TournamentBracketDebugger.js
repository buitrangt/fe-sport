import React, { useState } from 'react';
import { tournamentKnockoutService, teamService } from '../../services';

const TournamentBracketDebugger = ({ tournamentId = 44 }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [bracketResult, setBracketResult] = useState(null);

  const loadTeams = async () => {
    try {
      console.log('🔍 Loading teams for tournament:', tournamentId);
      const response = await teamService.getTeamsByTournament(tournamentId);
      console.log('✅ Teams loaded:', response);
      
      const teamsData = response?.data || [];
      setTeams(teamsData);
      setTeamsLoaded(true);
      
      console.log('📊 Teams summary:', {
        total: teamsData.length,
        approved: teamsData.filter(t => t.registrationStatus === 'APPROVED').length,
        pending: teamsData.filter(t => t.registrationStatus === 'PENDING').length,
        rejected: teamsData.filter(t => t.registrationStatus === 'REJECTED').length
      });
    } catch (error) {
      console.error('❌ Failed to load teams:', error);
      setTeams([]);
      setTeamsLoaded(true);
    }
  };

  const generateBracket = async () => {
    setIsGenerating(true);
    setBracketResult(null);
    
    try {
      console.log('🚀 Generating bracket for tournament:', tournamentId);
      
      const requestData = {
        shuffleTeams: true,
        bracketType: 'SINGLE_ELIMINATION'
      };
      
      console.log('📤 Request data:', requestData);
      const response = await tournamentKnockoutService.generateBracket(tournamentId, requestData);
      console.log('✅ Bracket generated successfully:', response);
      
      setBracketResult({ success: true, data: response });
      
    } catch (error) {
      console.error('❌ Bracket generation failed:', error);
      setBracketResult({ 
        success: false, 
        error: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 m-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🏆 Bracket Generation Debugger - Tournament {tournamentId}
      </h2>
      
      {/* Load Teams Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <h3 className="text-lg font-semibold">1. Load Teams</h3>
          <button
            onClick={loadTeams}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Load Teams
          </button>
        </div>
        
        {teamsLoaded && (
          <div className="bg-gray-50 border rounded p-3">
            <p className="font-medium">Teams Status:</p>
            <ul className="text-sm space-y-1 mt-2">
              <li>📊 Total teams: {teams.length}</li>
              <li>✅ Approved: {teams.filter(t => t.registrationStatus === 'APPROVED').length}</li>
              <li>⏳ Pending: {teams.filter(t => t.registrationStatus === 'PENDING').length}</li>
              <li>❌ Rejected: {teams.filter(t => t.registrationStatus === 'REJECTED').length}</li>
            </ul>
            
            {teams.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-sm">Team List:</p>
                <div className="text-xs space-y-1 mt-1">
                  {teams.map((team, index) => (
                    <div key={team.id} className={`p-2 rounded ${
                      team.registrationStatus === 'APPROVED' ? 'bg-green-100' :
                      team.registrationStatus === 'PENDING' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      {index + 1}. {team.name} ({team.registrationStatus})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Generate Bracket Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <h3 className="text-lg font-semibold">2. Generate Bracket</h3>
          <button
            onClick={generateBracket}
            disabled={isGenerating || !teamsLoaded}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating...' : 'Generate Bracket'}
          </button>
        </div>
        
        {bracketResult && (
          <div className={`border rounded p-3 ${
            bracketResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {bracketResult.success ? (
              <div>
                <p className="font-medium text-green-800">✅ Bracket Generated Successfully!</p>
                <pre className="text-xs text-green-700 mt-2 overflow-auto max-h-40">
                  {JSON.stringify(bracketResult.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <p className="font-medium text-red-800">❌ Bracket Generation Failed</p>
                <div className="text-sm text-red-700 mt-2">
                  <p><strong>Status:</strong> {bracketResult.error.status}</p>
                  <p><strong>Message:</strong> {bracketResult.error.message}</p>
                  {bracketResult.error.data && (
                    <div className="mt-2">
                      <p><strong>Response Data:</strong></p>
                      <pre className="text-xs overflow-auto max-h-32">
                        {JSON.stringify(bracketResult.error.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <h4 className="font-medium text-blue-800">📋 How to use:</h4>
        <ol className="text-sm text-blue-700 mt-2 space-y-1">
          <li>1. Click "Load Teams" để xem teams đã đăng ký</li>
          <li>2. Kiểm tra có ít nhất 2 teams APPROVED</li>
          <li>3. Click "Generate Bracket" để tạo matches</li>
          <li>4. Sau khi thành công, quay lại trang admin để xem matches</li>
        </ol>
      </div>
      
      {/* Quick Links */}
      <div className="mt-4 text-center space-x-3">
        <a 
          href="/admin/tournaments/44" 
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          → Back to Admin Page
        </a>
        <a 
          href="/debug-full" 
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          → Full API Debugger
        </a>
      </div>
    </div>
  );
};

export default TournamentBracketDebugger;
