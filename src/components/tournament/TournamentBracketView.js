import React, { useState } from 'react';
import { Trophy, Users, Calendar, Target, RefreshCw, Maximize2, Eye } from 'lucide-react';
import { useQuery } from 'react-query';
import { matchService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';

const TournamentBracketView = ({ tournament, refreshInterval = 30000 }) => {
  const [expandedView, setExpandedView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // FIXED: Use same API as MatchResultsManager - get matches by tournament
  const { data: matchesData, isLoading, error, refetch } = useQuery(
    ['tournament-matches-all', tournament.id],
    () => matchService.getMatchesByTournament(tournament.id),
    {
      enabled: !!tournament.id,
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 10000, // 10 seconds
      onError: (error) => {
        console.error('Failed to fetch matches:', error);
      },
      onSuccess: (data) => {
        console.log('🔍 [BracketView] Raw matches API response:', data);
        console.log('🔍 [BracketView] Data structure:', {
          type: typeof data,
          keys: Object.keys(data || {}),
          hasData: !!data?.data,
          dataKeys: data?.data ? Object.keys(data.data) : null,
          hasMatches: !!data?.data?.matches,
          matchesCount: data?.data?.matches?.length || 0
        });
      }
    }
  );

  // FIXED: Extract matches using same logic as MatchResultsManager
  let allMatches = [];
  
  try {
    // Try different possible data structures (same as MatchResultsManager)
    if (Array.isArray(matchesData?.data?.matches)) {
      allMatches = matchesData.data.matches;
    } else if (Array.isArray(matchesData?.data)) {
      allMatches = matchesData.data;
    } else if (Array.isArray(matchesData?.matches)) {
      allMatches = matchesData.matches;
    } else if (Array.isArray(matchesData)) {
      allMatches = matchesData;
    } else {
      console.log('🚷 [BracketView] No valid match array found in:', matchesData);
      allMatches = [];
    }
  } catch (err) {
    console.error('🚨 [BracketView] Error extracting match data:', err);
    allMatches = [];
  }

  // FIXED: Group matches by round to create bracket structure
  const rounds = [];
  if (allMatches.length > 0) {
    // Group matches by round number
    const matchesByRound = allMatches.reduce((acc, match) => {
      const roundNum = match.roundNumber || 1;
      if (!acc[roundNum]) {
        acc[roundNum] = [];
      }
      acc[roundNum].push(match);
      return acc;
    }, {});

    // Convert to rounds array
    Object.keys(matchesByRound)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(roundNum => {
        const roundMatches = matchesByRound[roundNum];
        rounds.push({
          roundNumber: parseInt(roundNum),
          name: roundMatches[0]?.roundName || `Round ${roundNum}`,
          roundName: roundMatches[0]?.roundName || `Round ${roundNum}`,
          matches: roundMatches
        });
      });
  }

  console.log('🔍 [BracketView] Processed data:', {
    allMatchesCount: allMatches.length,
    roundsCount: rounds.length,
    rounds: rounds.map(r => ({ 
      roundNumber: r.roundNumber, 
      name: r.name, 
      matchesCount: r.matches.length 
    }))
  });

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading tournament bracket...</p>
      </div>
    );
  }

  if (error) {
    console.error('🔍 [BracketView] Error details:', error);
    return (
      <div className="card text-center py-8">
        <Trophy className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bracket</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // FIXED: Check for matches properly
  if (!rounds || rounds.length === 0) {
    console.log('🔍 [BracketView] No rounds found - showing empty state');
    return (
      <div className="card text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bracket Generated</h3>
        <p className="text-gray-600 mb-4">
          Generate a tournament bracket to view the competition structure.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Debug info:</strong>
          </p>
          <pre className="text-xs text-left mt-2 bg-white p-2 rounded border overflow-auto">
            {JSON.stringify({ 
              hasData: !!matchesData, 
              allMatchesCount: allMatches.length,
              tournamentId: tournament.id,
              tournamentStatus: tournament.status 
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalTeams = tournament.currentTeams || tournament.registeredTeams || 0;
  const completedMatches = allMatches.filter(match => match.status === 'COMPLETED').length;
  const totalMatches = allMatches.length;
  const tournamentProgress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  console.log('🔍 [BracketView] Stats:', {
    totalTeams,
    completedMatches,
    totalMatches,
    tournamentProgress,
    roundsCount: rounds.length
  });

  return (
    <div className="space-y-6">
      {/* Tournament Info & Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Tournament Bracket</h3>
            <p className="text-gray-600">Live tournament bracket with real-time updates</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Tournament Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalTeams} Teams</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{rounds.length} Rounds</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span>{Math.round(tournamentProgress)}% Complete</span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg border transition-colors ${
                  autoRefresh 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              </button>
              
              <button
                onClick={() => refetch()}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title="Refresh bracket"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setExpandedView(!expandedView)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title={expandedView ? 'Compact view' : 'Expanded view'}
              >
                {expandedView ? <Eye className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Tournament Progress</span>
            <span className="text-sm text-gray-600">{completedMatches}/{totalMatches} matches completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${tournamentProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bracket Visualization */}
      <div className={`card overflow-x-auto ${expandedView ? 'max-h-none' : 'max-h-96 overflow-y-auto'}`}>
        <div className="min-w-max">
          <div className={`flex ${expandedView ? 'space-x-12' : 'space-x-8'}`}>
            {rounds.map((round, roundIndex) => {
              // Handle matches for this round
              const roundMatches = round.matches || [];
              const roundCompleted = roundMatches.filter(match => match.status === 'COMPLETED').length;
              const roundTotal = roundMatches.length;
              const isCurrentRound = tournament.currentRound === round.roundNumber;
              
              console.log(`🔍 [BracketView] Round ${round.roundNumber}:`, {
                roundName: round.name,
                matchesCount: roundMatches.length,
                completed: roundCompleted,
                total: roundTotal,
                isCurrent: isCurrentRound,
                matches: roundMatches
              });
              
              return (
                <div key={round.roundNumber} className={`${expandedView ? 'min-w-80' : 'min-w-64'}`}>
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      isCurrentRound 
                        ? 'bg-primary-100 text-primary-800' 
                        : roundCompleted === roundTotal && roundTotal > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span>{round.name}</span>
                      {isCurrentRound && <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {roundCompleted}/{roundTotal} completed
                    </p>
                  </div>

                  <div className={`space-y-${expandedView ? '6' : '4'}`}>
                    {roundMatches.map((match, matchIndex) => {
                      // Handle match data (same as original logic)
                      const team1 = match.team1 || null;
                      const team2 = match.team2 || null;
                      const team1Score = match.team1Score ?? 0;
                      const team2Score = match.team2Score ?? 0;
                      const winnerId = match.winnerTeam?.id || match.winnerId;
                      const matchStatus = match.status || 'SCHEDULED';
                      
                      console.log(`🔍 [BracketView] Match ${match.matchNumber || matchIndex + 1}:`, {
                        team1: team1?.name,
                        team2: team2?.name,
                        team1Score,
                        team2Score,
                        winnerId,
                        status: matchStatus
                      });
                      
                      return (
                        <div key={match.id || matchIndex} className={`bg-white border-2 rounded-lg shadow-sm transition-all duration-200 ${
                          matchStatus === 'COMPLETED' 
                            ? 'border-green-200 bg-green-50' 
                            : matchStatus === 'IN_PROGRESS'
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${expandedView ? 'p-6' : 'p-4'}`}>
                          <div className="text-center mb-3">
                            <div className="flex items-center justify-center space-x-2">
                              <span className={`text-xs font-medium ${
                                matchStatus === 'COMPLETED' ? 'text-green-600' :
                                matchStatus === 'IN_PROGRESS' ? 'text-blue-600' :
                                'text-gray-500'
                              }`}>
                                Match {match.matchNumber || matchIndex + 1}
                              </span>
                              {matchStatus === 'IN_PROGRESS' && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                            {expandedView && match.matchDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(match.matchDate).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className={`space-y-${expandedView ? '3' : '2'}`}>
                            {/* Team 1 */}
                            <div className={`${expandedView ? 'p-3' : 'p-2'} rounded-lg border-2 transition-all ${
                              winnerId === team1?.id 
                                ? 'bg-green-100 border-green-300 shadow-sm' 
                                : 'bg-white border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {winnerId === team1?.id && (
                                    <Trophy className="h-4 w-4 text-green-600" />
                                  )}
                                  <span className={`font-medium ${expandedView ? 'text-base' : 'text-sm'} ${
                                    team1?.name ? 'text-gray-900' : 'text-gray-400 italic'
                                  }`}>
                                    {team1?.name || 'TBD'}
                                  </span>
                                </div>
                                {team1Score !== undefined && (
                                  <span className={`font-bold ${
                                    expandedView ? 'text-xl' : 'text-sm'
                                  } ${
                                    winnerId === team1?.id ? 'text-green-700' : 'text-gray-700'
                                  }`}>
                                    {team1Score}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* VS */}
                            <div className={`text-center font-medium ${
                              expandedView ? 'text-sm text-gray-500' : 'text-xs text-gray-400'
                            }`}>
                              {matchStatus === 'IN_PROGRESS' ? 'LIVE' : 'VS'}
                            </div>

                            {/* Team 2 */}
                            <div className={`${expandedView ? 'p-3' : 'p-2'} rounded-lg border-2 transition-all ${
                              winnerId === team2?.id 
                                ? 'bg-green-100 border-green-300 shadow-sm' 
                                : 'bg-white border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {winnerId === team2?.id && (
                                    <Trophy className="h-4 w-4 text-green-600" />
                                  )}
                                  <span className={`font-medium ${expandedView ? 'text-base' : 'text-sm'} ${
                                    team2?.name ? 'text-gray-900' : 'text-gray-400 italic'
                                  }`}>
                                    {team2?.name || 'TBD'}
                                  </span>
                                </div>
                                {team2Score !== undefined && (
                                  <span className={`font-bold ${
                                    expandedView ? 'text-xl' : 'text-sm'
                                  } ${
                                    winnerId === team2?.id ? 'text-green-700' : 'text-gray-700'
                                  }`}>
                                    {team2Score}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Match Status */}
                          <div className="mt-3 text-center">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${
                              matchStatus === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : matchStatus === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {matchStatus === 'COMPLETED' && <Trophy className="h-3 w-3" />}
                              {matchStatus === 'IN_PROGRESS' && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
                              <span>{matchStatus || 'PENDING'}</span>
                            </span>
                          </div>

                          {/* Match Time - Only show in compact view */}
                          {!expandedView && match.matchDate && (
                            <div className="mt-2 text-center">
                              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tournament Winner */}
      {tournament.winnerTeam && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tournament Winner</h3>
            <p className="text-lg font-semibold text-yellow-700">
              {tournament.winnerTeam.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Congratulations to the champion!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracketView;