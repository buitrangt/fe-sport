# FIX MATCH SERVICE ERROR - Tournament Admin Detail Page

## Vấn đề xác định
Trang `/admin/tournaments/44` gặp lỗi 404 khi gọi API:
```
Failed to load resource: the server responded with a status of 404 ()
[API Error] GET /api/tournaments/44/matches
```

## Nguyên nhân
1. **Match Service URL không đúng**: Endpoint `/api/tournaments/{id}/matches` có thể chưa được implement ở backend hoặc URL path khác
2. **Thiếu error handling và logging** trong matchService 
3. **Response format** không nhất quán với các service khác

## Giải pháp

### 1. Cập nhật Match Service
Sửa đổi file `src/services/index.js` - phần matchService:

```javascript
// ==================== MATCH SERVICE ====================
export const matchService = {
  // Get matches by tournament
  getMatchesByTournament: async (tournamentId, params = {}) => {
    console.log('🥅 [MatchService] Getting matches by tournament ID:', tournamentId, 'params:', params);
    try {
      const response = await apiClient.get(`/api/tournaments/${tournamentId}/matches`, { params });
      console.log('✅ [MatchService] Get matches by tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [MatchService] Get matches by tournament failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      // Return empty data structure for 404 errors
      if (error.response?.status === 404) {
        console.log('🔄 [MatchService] Returning empty matches for 404');
        return {
          data: {
            matches: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              hasNext: false,
              hasPrev: false
            }
          }
        };
      }
      
      throw error;
    }
  },

  // Get match by ID
  getMatchById: async (id) => {
    console.log('🥅 [MatchService] Getting match by ID:', id);
    try {
      const response = await apiClient.get(`/api/matches/${id}`);
      console.log('✅ [MatchService] Get match by ID success:', response);
      return response;
    } catch (error) {
      console.error('❌ [MatchService] Get match by ID failed:', error);
      throw error;
    }
  },

  // Create match
  createMatch: async (tournamentId, matchData) => {
    console.log('🥅 [MatchService] Creating match for tournament:', tournamentId, 'data:', matchData);
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/matches`, matchData);
      console.log('✅ [MatchService] Create match success:', response);
      return response;
    } catch (error) {
      console.error('❌ [MatchService] Create match failed:', error);
      throw error;
    }
  },

  // Update match score
  updateMatchScore: async (id, scoreData) => {
    console.log('🥅 [MatchService] Updating match score:', id, 'score:', scoreData);
    try {
      const response = await apiClient.put(`/api/matches/${id}/score`, scoreData);
      console.log('✅ [MatchService] Update match score success:', response);
      return response;
    } catch (error) {
      console.error('❌ [MatchService] Update match score failed:', error);
      throw error;
    }
  },

  // Update match status
  updateMatchStatus: async (id, statusData) => {
    console.log('🥅 [MatchService] Updating match status:', id, 'status:', statusData);
    try {
      const response = await apiClient.put(`/api/matches/${id}/status`, statusData);
      console.log('✅ [MatchService] Update match status success:', response);
      return response;
    } catch (error) {
      console.error('❌ [MatchService] Update match status failed:', error);
      throw error;
    }
  },

  // Get tournament bracket
  getTournamentBracket: async (tournamentId) => {
    console.log('🥅 [MatchService] Getting tournament bracket:', tournamentId);
    try {
      const response = await apiClient.get(`/api/tournaments/${tournamentId}/bracket`);
      console.log('✅ [MatchService] Get tournament bracket success:', response);
      return response;
    } catch (error) {
      console.error('❌ [MatchService] Get tournament bracket failed:', error);
      
      // Return empty bracket for 404 errors
      if (error.response?.status === 404) {
        console.log('🔄 [MatchService] Returning empty bracket for 404');
        return {
          data: {
            rounds: [],
            totalRounds: 0,
            currentRound: 1,
            matches: []
          }
        };
      }
      
      throw error;
    }
  },
};
```

### 2. Kiểm tra Backend Endpoints
Cần xác nhận các endpoints sau có tồn tại trong backend:

1. `GET /api/tournaments/{id}/matches` - Lấy danh sách trận đấu của tournament
2. `GET /api/tournaments/{id}/bracket` - Lấy sơ đồ thi đấu
3. `GET /api/tournaments/{id}/current-round` - Lấy vòng đấu hiện tại

### 3. Cập nhật Component
Trong `TournamentAdminDetailPage.js`, cần handle trường hợp không có matches:

```javascript
// Safe extraction of matches data with fallback
const matchesData = matches?.data || matches || {};
const matchesList = Array.isArray(matchesData?.matches) ? matchesData.matches : 
                   Array.isArray(matchesData) ? matchesData : [];
```

### 4. Kiểm tra phiên bản API
Có thể backend sử dụng versioning khác hoặc path khác:
- `/api/v1/tournaments/{id}/matches`
- `/tournaments/{id}/matches`
- `/matches?tournamentId={id}`

## Hướng dẫn Fix ngay

1. **Sao lưu file hiện tại**:
```bash
cp src/services/index.js src/services/index.js.backup
```

2. **Áp dụng fix trên vào matchService**

3. **Restart development server**:
```bash
npm start
```

4. **Kiểm tra browser console** để xem log chi tiết

5. **Nếu vẫn lỗi 404**, kiểm tra backend API documentation hoặc:
   - Kiểm tra network tab trong DevTools để xem exact URL
   - Kiểm tra backend logs
   - Test API endpoint trực tiếp bằng Postman/curl

## Test commands
```bash
# Test backend API directly
curl -X GET "http://localhost:8080/api/tournaments/44/matches" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or test with different path
curl -X GET "http://localhost:8080/api/v1/tournaments/44/matches" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
