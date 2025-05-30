# Sport Images - Hướng dẫn sử dụng ảnh thể thao

## Tổng quan
Dự án đã được cập nhật với hệ thống quản lý ảnh thể thao thông minh, bao gồm:

- **SportImage Component**: Component xử lý load ảnh với fallback
- **Sport Images Utilities**: Các hàm tiện ích để quản lý ảnh
- **CSS Fallback**: Styles cho các placeholder ảnh
- **SVG Placeholders**: Ảnh placeholder local cho các môn thể thao

## Cấu trúc thư mục ảnh

```
public/
└── images/
    └── sports/
        ├── football-fallback.svg
        ├── basketball-fallback.svg
        ├── stadium-fallback.svg
        ├── volleyball-fallback.jpg
        ├── badminton-fallback.jpg
        ├── tennis-fallback.jpg
        ├── running-fallback.jpg
        └── swimming-fallback.jpg
```

## Cách sử dụng SportImage Component

### Import
```javascript
import SportImage from '../components/SportImage';
```

### Sử dụng cơ bản
```javascript
<SportImage 
  src="https://example.com/image.jpg"
  alt="Ảnh thể thao"
  fallbackType="football"
  className="w-full h-40 object-cover"
/>
```

### Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `src` | string | - | URL ảnh chính |
| `alt` | string | - | Alt text cho ảnh |
| `fallbackType` | string | 'default' | Loại thể thao cho fallback |
| `className` | string | '' | CSS classes |
| `gradientClass` | string | '' | CSS gradient class cho fallback |
| `iconSize` | string | 'h-16 w-16' | Kích thước icon fallback |

### Các loại fallbackType được hỗ trợ

- `stadium` - Sân vận động
- `football` - Bóng đá  
- `basketball` - Bóng rổ
- `volleyball` - Bóng chuyền
- `badminton` - Cầu lông
- `tennis` - Tennis
- `running` - Chạy bộ/điền kinh
- `swimming` - Bơi lội

## Các ảnh đã được tích hợp

### Ảnh Hero Section
- **Chính**: Ảnh stadium đa năng từ Unsplash
- **Fallback**: SVG stadium local

### Ảnh Tournaments
- **Football**: Sân bóng đá với fallback SVG bóng đá
- **Basketball**: Sân bóng rổ với fallback SVG bóng rổ  
- **Volleyball**: Sân bóng chuyền với fallback gradient

### Ảnh News Section
- **Running**: Ảnh chạy bộ/điền kinh
- **Tennis**: Ảnh tennis
- **Swimming**: Ảnh bơi lội

### Ảnh CTA Section
- **Background**: Ảnh sân thi đấu với fallback stadium

## Tính năng xử lý lỗi ảnh

1. **Load ảnh chính**: Thử load ảnh từ URL được cung cấp
2. **Fallback local**: Nếu lỗi, thử load ảnh local từ `/images/sports/`
3. **Gradient + Icon**: Nếu ảnh local cũng lỗi, hiển thị gradient với icon SVG
4. **Loading state**: Hiển thị placeholder trong khi đang load

## Thêm ảnh mới

### 1. Thêm ảnh vào thư mục public
```
public/images/sports/[sport-name]-fallback.[jpg|svg]
```

### 2. Cập nhật localSportImages trong SportImage.js
```javascript
const localSportImages = {
  // ... existing images
  newSport: '/images/sports/newsport-fallback.jpg'
};
```

### 3. Thêm gradient style trong sport-images.css
```css
.sport-newsport {
  background-image: linear-gradient(rgba(r,g,b,0.8), rgba(r,g,b,0.9)), 
                    url('data:image/svg+xml,[your-svg-here]');
}
```

## Optimizations đã áp dụng

- ✅ Lazy loading với state management
- ✅ Optimized image URLs (w=800 thay vì w=2070)
- ✅ Progressive fallback system
- ✅ CSS-based SVG patterns cho placeholder
- ✅ Smooth transitions và animations
- ✅ Gradient overlays cho tăng contrast text

## Troubleshooting

### Ảnh không hiển thị
1. Kiểm tra URL ảnh trong Developer Tools
2. Xác nhận file ảnh tồn tại trong `/public/images/sports/`
3. Kiểm tra console cho lỗi CORS hoặc 404

### Fallback không hoạt động
1. Xác nhận `fallbackType` được truyền đúng
2. Kiểm tra CSS styles đã được import
3. Đảm bảo SVG placeholder syntax đúng

### Performance issues
1. Sử dụng ảnh có kích thước phù hợp (800px width cho thumbnails)
2. Compress ảnh local trước khi thêm
3. Sử dụng WebP format nếu có thể

## Liên hệ
Nếu có vấn đề với hệ thống ảnh, vui lòng kiểm tra:
1. Network connectivity
2. Image URLs validity  
3. Local fallback files existence
4. CSS imports
