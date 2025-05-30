// Sport Image Gallery - Các ảnh thể thao được sử dụng trong dự án

export const sportImageUrls = {
  // Ảnh stadium và sân thi đấu tổng hợp
  stadium: [
    'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Sân vận động lớn
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Sân chạy điền kinh
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Sân thể thao đêm
  ],

  // Ảnh bóng đá
  football: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Sân bóng đá
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Trận đấu bóng đá
    'https://images.unsplash.com/photo-1606668011842-0fb97bbe0b8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Quả bóng đá
  ],

  // Ảnh bóng rổ
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Sân bóng rổ
    'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Rổ bóng rổ
    'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Quả bóng rổ
  ],

  // Ảnh bóng chuyền
  volleyball: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Sân bóng chuyền
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Quả bóng chuyền
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Lưới bóng chuyền
  ],

  // Ảnh cầu lông
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Sân cầu lông
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Vợt cầu lông
    'https://images.unsplash.com/photo-1551318181-655e9999853d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Quả cầu lông
  ],

  // Ảnh tennis
  tennis: [
    'https://images.unsplash.com/photo-1551318181-655e9999853d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Sân tennis
    'https://images.unsplash.com/photo-1554068297-540ad0c4413a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Vợt tennis
    'https://images.unsplash.com/photo-1595438014525-bd73c4b3bf05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Quả tennis
  ],

  // Ảnh chạy bộ / điền kinh
  running: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Đường chạy
    'https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // VĐV chạy
    'https://images.unsplash.com/photo-1512355144108-3b803282e6b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Giày chạy
  ],

  // Ảnh bơi lội
  swimming: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Bể bơi
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // VĐV bơi lội
    'https://images.unsplash.com/photo-1602152544421-ee4ac5be2a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Nước trong bể bơi
  ],

  // Ảnh tin tức và sự kiện
  news: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Sự kiện thể thao
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Lễ trao giải
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cổ động viên
  ]
};

// Hàm lấy ảnh ngẫu nhiên cho một môn thể thao
export const getRandomSportImage = (sportType) => {
  const images = sportImageUrls[sportType];
  if (!images || images.length === 0) {
    return sportImageUrls.stadium[0]; // Fallback to stadium
  }
  return images[Math.floor(Math.random() * images.length)];
};

// Hàm lấy ảnh theo index cho một môn thể thao
export const getSportImageByIndex = (sportType, index = 0) => {
  const images = sportImageUrls[sportType];
  if (!images || images.length === 0) {
    return sportImageUrls.stadium[0]; // Fallback to stadium
  }
  return images[index % images.length];
};

// Danh sách các môn thể thao được hỗ trợ
export const supportedSports = [
  'stadium',
  'football', 
  'basketball',
  'volleyball',
  'badminton',
  'tennis',
  'running',
  'swimming'
];

export default {
  sportImageUrls,
  getRandomSportImage,
  getSportImageByIndex,
  supportedSports
};