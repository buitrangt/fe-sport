import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { tournamentService, teamService, matchService } from '../../services';

// DEBUG COMPONENT FOR TOURNAMENT ADMIN PAGE
// Component này giúp debug các API call để tìm ra nguyên nhân lỗi

const TournamentAPIDebugger = ({ tournamentId = 44 }) => {
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Test các API endpoint
  const apiTests = [
    {
      key: 'tournament',
      name: 'Tournament Detail',
      query: ['debug-tournament', tournamentId],
      fn: () => tournamentService.getTournamentById(tournamentId)
    },
    {
      key: 'teams',
      name: 'Tournament Teams', 
      query: ['debug-teams', tournamentId],
      fn: () => teamService.getTeamsByTournament(tournamentId)
    },
    {
      key: 'matches',
      name: 'Tournament Matches',
      query: ['debug-matches', tournamentId],
      fn: () => matchService.getMatchesByTournament(tournamentId)
    },
    {
      key: 'bracket',
      name: 'Tournament Bracket',
      query: ['debug-bracket', tournamentId],
      fn: () => matchService.getTournamentBracket(tournamentId)
    },
    {
      key: 'currentRound',
      name: 'Current Round',
      query: ['debug-current-round', tournamentId],
      fn: () => tournamentService.getCurrentRound(tournamentId)
    }
  ];

  const runTest = async (test) => {
    console.log(`🧪 [Debug] Running test: ${test.name}`);
    setActiveTest(test.key);
    
    try {
      const result = await test.fn();
      console.log(`✅ [Debug] ${test.name} success:`, result);
      setTestResults(prev => ({
        ...prev,
        [test.key]: { success: true, data: result, error: null }
      }));
    } catch (error) {
      console.error(`❌ [Debug] ${test.name} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [test.key]: { success: false, data: null, error: error }
      }));
    } finally {
      setActiveTest(null);
    }
  };

  const runAllTests = async () => {
    console.log('🚀 [Debug] Running all API tests...');
    for (const test of apiTests) {
      await runTest(test);
      // Delay giữa các test
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 m-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🔬 API Debug Panel - Tournament {tournamentId}
        </h2>
        <p className="text-sm text-gray-600">
          Test các API endpoint để debug lỗi trong TournamentAdminDetailPage
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={activeTest}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {activeTest ? `Testing ${activeTest}...` : 'Run All Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {apiTests.map((test) => {
          const result = testResults[test.key];
          const isActive = activeTest === test.key;
          
          return (
            <div key={test.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{test.name}</h3>
                <div className="flex items-center space-x-2">
                  {isActive && (
                    <span className="text-xs text-blue-600 animate-pulse">Testing...</span>
                  )}
                  {result && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  )}
                  <button
                    onClick={() => runTest(test)}
                    disabled={isActive}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 disabled:bg-gray-50"
                  >
                    Test
                  </button>
                </div>
              </div>

              {result && (
                <div className="mt-3">
                  {result.success ? (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm font-medium text-green-800 mb-2">✅ Response:</p>
                      <pre className="text-xs text-green-700 overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm font-medium text-red-800 mb-2">❌ Error:</p>
                      <div className="text-xs text-red-700">
                        <p><strong>Status:</strong> {result.error?.response?.status || 'Unknown'}</p>
                        <p><strong>Message:</strong> {result.error?.message || 'Unknown error'}</p>
                        {result.error?.response?.data && (
                          <div className="mt-2">
                            <p><strong>Response Data:</strong></p>
                            <pre className="overflow-auto max-h-32">
                              {JSON.stringify(result.error.response.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Test Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600">✅ Passed: </span>
              <span className="font-medium">
                {Object.values(testResults).filter(r => r.success).length}
              </span>
            </div>
            <div>
              <span className="text-red-600">❌ Failed: </span>
              <span className="font-medium">
                {Object.values(testResults).filter(r => !r.success).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentAPIDebugger;
