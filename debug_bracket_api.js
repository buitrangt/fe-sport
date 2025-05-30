// DEBUG: Test Tournament Bracket API
// Run this in browser console or create a test page

async function debugBracketAPI() {
  console.log('🔍 [DEBUG] Starting bracket API test...');
  
  // Replace with your tournament ID
  const tournamentId = 1; // Change this to your tournament ID
  const baseURL = 'http://localhost:8080';
  
  try {
    // Test 1: Get tournament bracket
    console.log('\n📊 [TEST 1] Getting tournament bracket...');
    const bracketResponse = await fetch(`${baseURL}/api/tournaments/${tournamentId}/bracket`);
    const bracketText = await bracketResponse.text();
    
    console.log('Status:', bracketResponse.status);
    console.log('Headers:', Object.fromEntries(bracketResponse.headers.entries()));
    console.log('Raw response:', bracketText);
    
    if (bracketResponse.ok) {
      try {
        const bracketData = JSON.parse(bracketText);
        console.log('✅ Bracket data:', bracketData);
        console.log('Data structure:');
        console.log('  - Type:', typeof bracketData);
        console.log('  - Keys:', Object.keys(bracketData));
        
        if (bracketData.data) {
          console.log('  - bracketData.data keys:', Object.keys(bracketData.data));
          if (bracketData.data.bracket) {
            console.log('  - bracketData.data.bracket keys:', Object.keys(bracketData.data.bracket));
            if (bracketData.data.bracket.rounds) {
              console.log('  - rounds count:', bracketData.data.bracket.rounds.length);
              console.log('  - first round structure:', bracketData.data.bracket.rounds[0]);
            }
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse bracket JSON:', e);
      }
    } else {
      console.error('❌ Bracket API failed:', bracketResponse.status, bracketText);
    }
    
    // Test 2: Get tournament matches  
    console.log('\n📊 [TEST 2] Getting tournament matches...');
    const matchesResponse = await fetch(`${baseURL}/api/tournaments/${tournamentId}/matches`);
    const matchesText = await matchesResponse.text();
    
    console.log('Status:', matchesResponse.status);
    console.log('Raw response:', matchesText);
    
    if (matchesResponse.ok) {
      try {
        const matchesData = JSON.parse(matchesText);
        console.log('✅ Matches data:', matchesData);
        console.log('Matches structure:');
        console.log('  - Type:', typeof matchesData);
        console.log('  - Keys:', Object.keys(matchesData));
        
        if (matchesData.data) {
          console.log('  - matchesData.data keys:', Object.keys(matchesData.data));
          if (matchesData.data.matches) {
            console.log('  - matches count:', matchesData.data.matches.length);
            console.log('  - first match:', matchesData.data.matches[0]);
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse matches JSON:', e);
      }
    } else {
      console.error('❌ Matches API failed:', matchesResponse.status, matchesText);
    }
    
    // Test 3: Get tournament info
    console.log('\n📊 [TEST 3] Getting tournament info...');
    const tournamentResponse = await fetch(`${baseURL}/api/tournaments/${tournamentId}`);
    const tournamentText = await tournamentResponse.text();
    
    console.log('Status:', tournamentResponse.status);
    console.log('Raw response:', tournamentText);
    
    if (tournamentResponse.ok) {
      try {
        const tournamentData = JSON.parse(tournamentText);
        console.log('✅ Tournament data:', tournamentData);
        console.log('Tournament structure:');
        console.log('  - Type:', typeof tournamentData);
        console.log('  - Keys:', Object.keys(tournamentData));
        
        if (tournamentData.data) {
          console.log('  - tournamentData.data keys:', Object.keys(tournamentData.data));
          console.log('  - status:', tournamentData.data.status);
          console.log('  - currentTeams:', tournamentData.data.currentTeams);
        }
      } catch (e) {
        console.error('❌ Failed to parse tournament JSON:', e);
      }
    } else {
      console.error('❌ Tournament API failed:', tournamentResponse.status, tournamentText);
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] Network error:', error);
  }
  
  console.log('\n🔍 [DEBUG] Test completed!');
}

// Instructions to run:
console.log('🚀 To debug bracket API, run: debugBracketAPI()');
console.log('📝 Make sure to change tournamentId to your actual tournament ID');

// Auto-run if you want
// debugBracketAPI();
