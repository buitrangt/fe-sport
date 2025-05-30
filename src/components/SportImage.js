import React, { useState } from 'react';
import { Trophy, Target, Users, Play } from 'lucide-react';

const SportImage = ({ 
  src, 
  alt, 
  fallbackType = 'default', 
  className = '',
  gradientClass = '',
  iconSize = 'h-16 w-16'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Danh sách ảnh backup local
  const localSportImages = {
    football: '/images/sports/football-fallback.svg',
    basketball: '/images/sports/basketball-fallback.svg',
    volleyball: '/images/sports/volleyball-fallback.jpg',
    badminton: '/images/sports/badminton-fallback.jpg',
    tennis: '/images/sports/tennis-fallback.svg',
    running: '/images/sports/running-fallback.svg',
    swimming: '/images/sports/swimming-fallback.jpg',
    stadium: '/images/sports/stadium-fallback.svg',
    hero: '/images/sports/hero-stadium.svg'
  };

  // Icon cho các loại thể thao
  const getSportIcon = (type) => {
    switch(type) {
      case 'football':
      case 'basketball':
      case 'volleyball':
        return <Trophy className={`${iconSize} text-white animate-float`} />;
      case 'badminton':
      case 'tennis':
        return <Target className={`${iconSize} text-white animate-float`} />;
      case 'running':
      case 'swimming':
        return <Play className={`${iconSize} text-white animate-float`} />;
      case 'hero':
      case 'stadium':
        return <Users className={`${iconSize} text-white animate-float`} />;
      default:
        return <Users className={`${iconSize} text-white animate-float`} />;
    }
  };

  // Gradient backgrounds cho fallback
  const getGradientBackground = (type) => {
    if (gradientClass) return gradientClass;
    
    switch(type) {
      case 'hero':
        return 'bg-gradient-to-br from-blue-600 via-purple-600 to-red-600';
      case 'football':
        return 'bg-gradient-to-br from-green-500 via-green-600 to-green-700';
      case 'basketball':
        return 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700';
      case 'volleyball':
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700';
      case 'badminton':
        return 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700';
      case 'tennis':
        return 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700';
      case 'running':
        return 'bg-gradient-to-br from-red-500 via-red-600 to-red-700';
      case 'swimming':
        return 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700';
      case 'stadium':
        return 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800';
      default:
        return 'bg-gradient-to-br from-red-600 via-purple-600 to-blue-600';
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Nếu có lỗi với ảnh chính, thử ảnh local backup
  if (imageError) {
    const localBackup = localSportImages[fallbackType];
    if (localBackup) {
      return (
        <img
          src={localBackup}
          alt={alt}
          className={className}
          onError={() => {
            // Thay thế bằng div gradient nếu ảnh local cũng lỗi
            const parentElement = document.querySelector(`img[alt="${alt}"]`)?.parentElement;
            if (parentElement) {
              parentElement.innerHTML = `
                <div class="${className} ${getGradientBackground(fallbackType)} flex items-center justify-center">
                  <div class="${iconSize} text-white"></div>
                </div>
              `;
            }
          }}
          onLoad={handleImageLoad}
        />
      );
    }
    
    // Fallback cuối cùng: gradient với icon
    return (
      <div className={`${className} ${getGradientBackground(fallbackType)} flex items-center justify-center`}>
        {getSportIcon(fallbackType)}
      </div>
    );
  }

  // Hiển thị ảnh chính
  return (
    <div className="relative">
      {!imageLoaded && (
        <div className={`absolute inset-0 ${getGradientBackground(fallbackType)} flex items-center justify-center animate-pulse`}>
          {getSportIcon(fallbackType)}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default SportImage;