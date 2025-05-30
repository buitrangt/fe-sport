// TEST API ENDPOINTS FOR TOURNAMENT 44
// Chạy file này trong browser console để test các endpoint

const API_BASE = 'http://localhost:8080';
const TOURNAMENT_ID = 44;

// Get token from localStorage
const token = localStorage.getItem('accessToken');
console.log('Token present:', !!token);

// Helper function to test API endpoints
async function testEndpoint(url, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
      return { success: true, data, status: response.status };
    } else {
      const errorData = await response.text();
      console.log('❌ Error:', errorData);
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
    return { success: false, error: error.message, status: 'NETWORK_ERROR' };
  }
}

// Test all possible match endpoints
async function testMatchEndpoints() {
  console.log('🚀 Starting API endpoint tests for Tournament', TOURNAMENT_ID);
  
  const endpoints = [
    // Original endpoint
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}/matches`,
      desc: 'Tournament Matches (current endpoint)'
    },
    
    // Alternative versioned endpoints
    {
      url: `${API_BASE}/api/v1/tournaments/${TOURNAMENT_ID}/matches`,
      desc: 'Tournament Matches (v1)'
    },
    
    // Alternative paths
    {
      url: `${API_BASE}/tournaments/${TOURNAMENT_ID}/matches`,
      desc: 'Tournament Matches (no api prefix)'
    },
    
    // Query parameter approach
    {
      url: `${API_BASE}/api/matches?tournamentId=${TOURNAMENT_ID}`,
      desc: 'Matches by query parameter'
    },
    
    // Bracket endpoint (this one works)
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}/bracket`,
      desc: 'Tournament Bracket (working endpoint)'
    },
    
    // Tournament detail (this one works)
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}`,
      desc: 'Tournament Detail (working endpoint)'
    },
    
    // Current round endpoint
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}/current-round`,
      desc: 'Tournament Current Round'
    },
    
    // Teams endpoint 
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}/teams`,
      desc: 'Tournament Teams'
    },
    
    // Alternative match endpoints
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}/rounds`,
      desc: 'Tournament Rounds'
    },
    
    {
      url: `${API_BASE}/api/tournaments/${TOURNAMENT_ID}/fixtures`,
      desc: 'Tournament Fixtures'
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.desc);
    results.push({ ...endpoint, ...result });
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 SUMMARY OF RESULTS:');
  console.log('='.repeat(50));
  
  const working = results.filter(r => r.success);
  const notFound = results.filter(r => r.status === 404);
  const errors = results.filter(r => !r.success && r.status !== 404);
  
  console.log('✅ Working endpoints:');
  working.forEach(r => console.log(`  - ${r.desc}: ${r.url}`));
  
  console.log('\n❌ 404 Not Found:');
  notFound.forEach(r => console.log(`  - ${r.desc}: ${r.url}`));
  
  console.log('\n💥 Other errors:');
  errors.forEach(r => console.log(`  - ${r.desc}: ${r.url} (${r.status})`));
  
  return results;
}

// Run the test
testMatchEndpoints();

// Export for manual testing
window.testMatchEndpoints = testMatchEndpoints;
window.testEndpoint = testEndpoint;

console.log('🔧 Helper functions added to window: testMatchEndpoints(), testEndpoint()');
