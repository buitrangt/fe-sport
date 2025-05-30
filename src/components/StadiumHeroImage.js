import React, { useState } from 'react';

const StadiumHeroImage = ({ className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Danh sách ảnh sân vận động từ nhiều nguồn khác nhau
  const stadiumImages = [
    // Unsplash - Stadium images
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1920&q=80', 
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1920&q=80',
    // Pexels backup
    'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    // Pixabay backup 
    'https://cdn.pixabay.com/photo/2016/06/03/13/57/digital-art-1433427_1920.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageError = () => {
    // Thử ảnh tiếp theo
    if (currentImageIndex < stadiumImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageError(false);
    } else {
      // Hết ảnh để thử, dùng fallback
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Nếu tất cả ảnh đều lỗi, hiển thị ảnh local hoặc gradient
  if (imageError && currentImageIndex >= stadiumImages.length - 1) {
    return (
      <div className="relative">
        {/* Thử ảnh local SVG trước */}
        <img
          src="/images/sports/hero-stadium.svg"
          alt="Stadium local"
          className={className}
          onError={() => {
            // Nếu SVG cũng lỗi, dùng gradient
            const element = document.querySelector('img[alt="Stadium local"]');
            if (element) {
              element.style.display = 'none';
              element.nextElementSibling.style.display = 'flex';
            }
          }}
          onLoad={() => {/* Local SVG loaded */}}
        />
        
        {/* Gradient fallback cuối cùng */}
        <div 
          className={`${className} bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 items-center justify-center text-white text-center`}
          style={{ 
            display: 'none',
            backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.8), rgba(29, 78, 216, 0.8)), 
                             url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='40' ry='25' fill='none' stroke='white' stroke-width='2' opacity='0.5'/%3E%3Crect x='10' y='30' width='80' height='8' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="text-6xl mb-4">🏟️</div>
          <div className="text-2xl font-bold">EduSports Stadium</div>
          <div className="text-lg opacity-80">Multi-Sport Complex</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center animate-pulse`}>
          <div className="text-white text-center">
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-lg">Loading Stadium...</div>
          </div>
        </div>
      )}
      
      {/* Main stadium image */}
      <img
        src={stadiumImages[currentImageIndex]}
        alt="Stadium thể thao"
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default StadiumHeroImage;