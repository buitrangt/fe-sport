import React, { useState } from 'react';
import SportImage from './SportImage';
import { sportImageUrls, supportedSports } from '../utils/sportImages';

const SportImageGallery = ({ onClose }) => {
  const [selectedSport, setSelectedSport] = useState('stadium');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gallery Ảnh Thể Thao</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Sport Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn môn thể thao:
            </label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              {supportedSports.map(sport => (
                <option key={sport} value={sport}>
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Test với ảnh online */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Ảnh Online (Unsplash)</h3>
              {sportImageUrls[selectedSport]?.map((imageUrl, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <SportImage
                    src={imageUrl}
                    alt={`${selectedSport} - Online ${index + 1}`}
                    fallbackType={selectedSport}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs text-gray-600 truncate">{imageUrl}</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 italic">Không có ảnh cho môn này</p>
              )}
            </div>

            {/* Test với ảnh lỗi (để test fallback) */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Test Fallback (Ảnh lỗi)</h3>
              <div className="border rounded-lg overflow-hidden">
                <SportImage
                  src="https://invalid-url-to-test-fallback.jpg"
                  alt={`${selectedSport} - Fallback Test`}
                  fallbackType={selectedSport}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600">Fallback Local Image</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <SportImage
                  src="https://another-invalid-url.jpg"
                  alt={`${selectedSport} - Gradient Test`}
                  fallbackType={selectedSport}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600">Fallback Gradient + Icon</p>
                </div>
              </div>
            </div>

            {/* Test với các gradient khác nhau */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Custom Gradients</h3>
              {[
                'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
                'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700', 
                'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
              ].map((gradient, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <SportImage
                    src="https://invalid-gradient-test.jpg"
                    alt={`${selectedSport} - Custom Gradient ${index + 1}`}
                    fallbackType={selectedSport}
                    gradientClass={gradient}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs text-gray-600">Custom Gradient {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Test */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Test Loading States</h3>
            <p className="text-sm text-gray-600 mb-4">
              Các ảnh phía trên sẽ hiển thị loading placeholder trước khi load xong.
              Nếu ảnh online lỗi, sẽ fallback xuống ảnh local, nếu ảnh local cũng lỗi sẽ hiển thị gradient + icon.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Slow loading image test */}
              <div className="border rounded-lg overflow-hidden">
                <SportImage
                  src="https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&slow=1"
                  alt="Slow loading test"
                  fallbackType={selectedSport}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600">Large Image (may load slowly)</p>
                </div>
              </div>

              {/* Immediate fallback test */}
              <div className="border rounded-lg overflow-hidden">
                <SportImage
                  src="https://definitely-does-not-exist-url-test-404.jpg"
                  alt="404 test"
                  fallbackType={selectedSport}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600">404 URL (immediate fallback)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Đóng Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportImageGallery;