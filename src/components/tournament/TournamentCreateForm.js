import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, Calendar, Users, MapPin, Trophy, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { tournamentServiceFixed } from '../../services/tournamentServiceFixed';
import {
  SPORT_TYPES,
  SPORT_TYPE_LABELS,
  TOURNAMENT_STATUS,
  VALIDATION_RULES,
  QUERY_KEYS
} from '../../utils/constants';
import { formatDateTimeForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TournamentCreateForm = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sportType: 'FOOTBALL',
      maxTeams: 16,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      rules: '',
      prizeInfo: '',
      contactInfo: ''
    },
    mode: 'onChange'
  });

  const createTournamentMutation = useMutation(
    ({ tournamentData, imageFile }) => {
      console.log('🚀 Đang gọi tournamentServiceFixed.createTournamentWithImage với:', { tournamentData, imageFile });
      return tournamentServiceFixed.createTournamentWithImage(tournamentData, imageFile);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Giải đấu đã được tạo thành công:', response);
        toast.success('Tạo giải đấu thành công!');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
        onSuccess?.(response?.data || response);
        handleClose();
      },
      onError: (error) => {
        console.error('❌ Tạo giải đấu thất bại:', error);
        console.error('Chi tiết lỗi:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           'Đã xảy ra lỗi khi tạo giải đấu.';

        toast.error(errorMessage);
        setIsSubmitting(false);
      }
    }
  );

  const watchStartDate = watch('startDate');

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh (JPG, PNG, GIF)');
      event.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 5MB');
      event.target.value = '';
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    console.log('📸 Đã chọn ảnh:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log('📝 Dữ liệu form đã gửi:', data);
      console.log('🖼️ Ảnh đã chọn:', selectedImage);
      setIsSubmitting(true);

      // Validate required fields
      if (!data.name || !data.description || !data.location || !data.contactInfo) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setIsSubmitting(false);
        return;
      }

      // Validate dates
      if (!data.startDate || !data.endDate || !data.registrationDeadline) {
        toast.error('Vui lòng chọn đầy đủ ngày tháng');
        setIsSubmitting(false);
        return;
      }

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const regDeadline = new Date(data.registrationDeadline);
      const now = new Date();

      if (regDeadline <= now) {
        toast.error('Hạn đăng ký phải sau thời điểm hiện tại');
        setIsSubmitting(false);
        return;
      }

      if (regDeadline >= startDate) {
        toast.error('Hạn đăng ký phải trước ngày bắt đầu giải đấu');
        setIsSubmitting(false);
        return;
      }

      if (startDate >= endDate) {
        toast.error('Ngày kết thúc phải sau ngày bắt đầu');
        setIsSubmitting(false);
        return;
      }

      // Prepare tournament data to match backend expectations
      const tournamentData = {
        name: data.name.trim(),
        description: data.description.trim(),
        sportType: data.sportType || 'FOOTBALL',
        maxTeams: parseInt(data.maxTeams) || 16,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        registrationDeadline: regDeadline.toISOString(),
        location: data.location.trim(),
        rules: data.rules?.trim() || '',
        prizeInfo: data.prizeInfo?.trim() || '',
        contactInfo: data.contactInfo.trim()
      };

      console.log('🎯 Dữ liệu giải đấu cuối cùng để gửi:', tournamentData);
      console.log('📷 File ảnh để gửi:', selectedImage);

      await createTournamentMutation.mutateAsync({
        tournamentData,
        imageFile: selectedImage
      });
    } catch (error) {
      console.error('💥 Lỗi tạo giải đấu trong onSubmit:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSubmitting(false);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Generate min dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const minStartDate = formatDateTimeForInput(tomorrow);
  const minEndDate = watchStartDate ?
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() + 24 * 60 * 60 * 1000)) :
    minStartDate;
  const maxRegDeadline = watchStartDate ?
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() - 24 * 60 * 60 * 1000)) :
    '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tạo giải đấu mới</h2>
              <p className="text-sm text-gray-600">Điền thông tin để tạo một giải đấu</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh giải đấu
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Xem trước ảnh giải đấu"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="mt-2 text-sm text-gray-600">{selectedImage?.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="tournament-image"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Tải ảnh lên</span>
                          <input
                            id="tournament-image"
                            name="tournament-image"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleImageSelect}
                            ref={fileInputRef}
                            disabled={isSubmitting}
                          />
                        </label>
                        <p className="pl-1">hoặc kéo và thả</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tournament Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên giải đấu *
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Tên giải đấu là bắt buộc',
                    minLength: {
                      value: 3,
                      message: 'Tên giải đấu phải có ít nhất 3 ký tự'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Tên giải đấu không được vượt quá 100 ký tự'
                    }
                  })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Nhập tên giải đấu"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Sport Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn thể thao *
                </label>
                <select
                  {...register('sportType', { required: 'Vui lòng chọn một môn thể thao' })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sportType ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="FOOTBALL">Bóng đá</option>
                  <option value="LMHT">LMHT</option>
                  <option value="Bi-a">Bi-a</option>
                  <option value="Pickleball">Pickleball</option>
                  <option value="BASKETBALL">Bóng rổ</option>
                  <option value="VOLLEYBALL">Bóng chuyền</option>
                  <option value="BADMINTON">Cầu lông</option>
                  <option value="TENNIS">Quần vợt</option>
                  <option value="GENERAL">Khác</option>
                </select>
                {errors.sportType && (
                  <p className="mt-1 text-sm text-red-600">{errors.sportType.message}</p>
                )}
              </div>

              {/* Max Teams */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số đội tối đa *
                </label>
                <select
                  {...register('maxTeams', {
                    required: 'Vui lòng chọn số đội tối đa'
                  })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxTeams ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value={4}>4 đội</option>
                  <option value={8}>8 đội</option>
                  <option value={16}>16 đội</option>
                  <option value={32}>32 đội</option>
                  <option value={64}>64 đội</option>
                </select>
                {errors.maxTeams && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả giải đấu *
              </label>
              <textarea
                {...register('description', {
                  required: 'Mô tả giải đấu là bắt buộc',
                  minLength: { value: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
                })}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Mô tả chi tiết về giải đấu"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                  min={minStartDate}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
                  min={minEndDate}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hạn đăng ký *
                </label>
                <input
                  type="datetime-local"
                  {...register('registrationDeadline', { required: 'Hạn đăng ký là bắt buộc' })}
                  min={formatDateTimeForInput(today)}
                  max={maxRegDeadline}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.registrationDeadline ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.registrationDeadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Địa điểm là bắt buộc' })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Nhập địa điểm tổ chức"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông tin liên hệ *
              </label>
              <input
                type="text"
                {...register('contactInfo', { required: 'Thông tin liên hệ là bắt buộc' })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactInfo ? 'border-red-500' : ''}`}
                placeholder="Email hoặc số điện thoại liên hệ"
                disabled={isSubmitting}
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luật thi đấu
                </label>
                <textarea
                  {...register('rules')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Mô tả các quy tắc và điều lệ thi đấu"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thông tin giải thưởng
                </label>
                <textarea
                  {...register('prizeInfo')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Mô tả về giải thưởng và phần thưởng"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Tạo giải đấu {selectedImage && '(kèm ảnh)'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentCreateForm;