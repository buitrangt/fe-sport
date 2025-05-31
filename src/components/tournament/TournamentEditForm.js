import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { X, Save, Trophy, Calendar } from 'lucide-react'; // Đã bỏ Users, MapPin vì không dùng trực tiếp trong JSX
import { tournamentService } from '../../services';
import {
  SPORT_TYPES,
  SPORT_TYPE_LABELS, // Giữ lại nếu bạn muốn dùng nhãn tiếng Việt từ constants
  TOURNAMENT_STATUS,
  TOURNAMENT_STATUS_LABELS, // Giữ lại nếu bạn muốn dùng nhãn tiếng Việt từ constants
  VALIDATION_RULES
} from '../../utils/constants.safe';
import { formatDateTimeForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TournamentEditForm = ({ tournament, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue, // Giữ lại setValue dù không dùng trực tiếp trong code bạn cung cấp, phòng trường hợp cần
    formState: { errors, isValid, isDirty }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sportType: SPORT_TYPES?.FOOTBALL || 'FOOTBALL',
      maxTeams: 16,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      rules: '',
      prizeInfo: '',
      contactInfo: '',
      status: TOURNAMENT_STATUS?.REGISTRATION || 'REGISTRATION'
    },
    mode: 'onChange'
  });

  // Điền dữ liệu vào form khi dữ liệu giải đấu thay đổi
  useEffect(() => {
    if (tournament && isOpen) {
      reset({
        name: tournament.name || '',
        description: tournament.description || '',
        sportType: tournament.sportType || 'FOOTBALL',
        maxTeams: tournament.maxTeams || 16,
        startDate: tournament.startDate ? formatDateTimeForInput(new Date(tournament.startDate)) : '',
        endDate: tournament.endDate ? formatDateTimeForInput(new Date(tournament.endDate)) : '',
        registrationDeadline: tournament.registrationDeadline ? formatDateTimeForInput(new Date(tournament.registrationDeadline)) : '',
        location: tournament.location || '',
        rules: tournament.rules || '',
        prizeInfo: tournament.prizeInfo || '',
        contactInfo: tournament.contactInfo || '',
        status: tournament.status || 'REGISTRATION'
      });
    }
  }, [tournament, isOpen, reset]);

  const updateTournamentMutation = useMutation(
    (tournamentData) => tournamentService.updateTournament(tournament.id, tournamentData),
    {
      onSuccess: (response) => {
        toast.success('Cập nhật giải đấu thành công!');
        onSuccess?.(response.data);
        handleClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật giải đấu thất bại');
        setIsSubmitting(false);
      }
    }
  );

  const watchStartDate = watch('startDate');
  const watchStatus = watch('status'); // Giữ lại dù không dùng trực tiếp trong logic hiện tại

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Xác thực ngày tháng
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const regDeadline = new Date(data.registrationDeadline);

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

      // Kiểm tra nếu số đội tối đa bị giảm xuống dưới số đội hiện tại
      if (data.maxTeams < tournament.currentTeams) {
        if (!window.confirm(`Giảm số đội tối đa xuống ${data.maxTeams} sẽ không ảnh hưởng đến các đội đã đăng ký (${tournament.currentTeams}). Bạn có muốn tiếp tục không?`)) {
          setIsSubmitting(false);
          return;
        }
      }

      // Chuẩn bị dữ liệu giải đấu
      const tournamentData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
        maxTeams: parseInt(data.maxTeams)
      };

      console.log('Cập nhật giải đấu với dữ liệu:', tournamentData);
      await updateTournamentMutation.mutateAsync(tournamentData);
    } catch (error) {
      console.error('Lỗi khi cập nhật giải đấu:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng không?')) {
      return;
    }
    reset();
    setIsSubmitting(false);
    onClose();
  };

  // Tạo ngày tối thiểu
  const today = new Date();
  const minStartDate = formatDateTimeForInput(today);
  const minEndDate = watchStartDate ?
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() + 24 * 60 * 60 * 1000)) :
    minStartDate;
  const maxRegDeadline = watchStartDate ?
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() - 24 * 60 * 60 * 1000)) :
    '';

  // Xác định trường nào nên bị vô hiệu hóa dựa trên trạng thái giải đấu
  const isOngoing = tournament?.status === 'ONGOING' || tournament?.status === 'COMPLETED';
  const hasRegisteredTeams = tournament?.currentTeams > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa Giải đấu</h2>
              <p className="text-sm text-gray-600">Cập nhật thông tin và cài đặt giải đấu</p>
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
            {/* Cảnh báo cho giải đấu đang diễn ra */}
            {isOngoing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">Thông báo trạng thái Giải đấu</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Giải đấu này đang ở trạng thái {tournament.status.toLowerCase() === 'ongoing' ? 'Đang diễn ra' : 'Đã hoàn thành'}. Một số trường có thể bị hạn chế chỉnh sửa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tên Giải đấu */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Giải đấu *
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Tên giải đấu là bắt buộc',
                    minLength: {
                      value: VALIDATION_RULES?.TOURNAMENT_NAME?.MIN_LENGTH || 3,
                      message: `Tên giải đấu phải có ít nhất ${VALIDATION_RULES?.TOURNAMENT_NAME?.MIN_LENGTH || 3} ký tự`
                    },
                    maxLength: {
                      value: VALIDATION_RULES?.TOURNAMENT_NAME?.MAX_LENGTH || 100,
                      message: `Tên giải đấu không được vượt quá ${VALIDATION_RULES?.TOURNAMENT_NAME?.MAX_LENGTH || 100} ký tự`
                    }
                  })}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Nhập tên giải đấu"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Loại hình Thể thao */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hình Thể thao *
                </label>
                <select
                  {...register('sportType', { required: 'Vui lòng chọn loại hình thể thao' })}
                  className={`input-field ${errors.sportType ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || hasRegisteredTeams}
                >
                  {/* Có thể sử dụng SPORT_TYPE_LABELS nếu bạn có định nghĩa nhãn tiếng Việt cho các loại hình thể thao */}
                  <option value="FOOTBALL">Bóng đá</option>
                  <option value="BASKETBALL">Bóng rổ</option>
                  <option value="VOLLEYBALL">Bóng chuyền</option>
                  <option value="BADMINTON">Cầu lông</option>
                  <option value="TENNIS">Quần vợt</option>
                </select>
                {errors.sportType && (
                  <p className="mt-1 text-sm text-red-600">{errors.sportType.message}</p>
                )}
                {hasRegisteredTeams && (
                  <p className="mt-1 text-sm text-gray-500">
                    Không thể thay đổi loại hình thể thao khi đã có đội đăng ký
                  </p>
                )}
              </div>

              {/* Số đội tối đa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số đội tối đa *
                </label>
                <select
                  {...register('maxTeams', {
                    required: 'Vui lòng chọn số đội tối đa',
                    min: { value: tournament?.currentTeams || 4, message: `Phải có ít nhất ${tournament?.currentTeams || 4} đội` }
                  })}
                  className={`input-field ${errors.maxTeams ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isOngoing}
                >
                  {[4, 8, 16, 32, 64].map(num => (
                    <option
                      key={num}
                      value={num}
                      disabled={num < (tournament?.currentTeams || 0)}
                    >
                      {num} đội {num < (tournament?.currentTeams || 0) ? '(quá ít)' : ''}
                    </option>
                  ))}
                </select>
                {errors.maxTeams && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
                )}
                {tournament?.currentTeams > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Hiện có {tournament.currentTeams} đội đã đăng ký
                  </p>
                )}
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả Giải đấu *
              </label>
              <textarea
                {...register('description', {
                  required: 'Mô tả giải đấu là bắt buộc',
                  minLength: { value: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
                })}
                rows={3}
                className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Mô tả chi tiết giải đấu"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Ngày tháng */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                  min={minStartDate}
                  className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isOngoing}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
                {isOngoing && (
                  <p className="mt-1 text-sm text-gray-500">Không thể thay đổi ngày cho giải đấu đang diễn ra</p>
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
                  className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
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
                  max={maxRegDeadline}
                  className={`input-field ${errors.registrationDeadline ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isOngoing}
                />
                {errors.registrationDeadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline.message}</p>
                )}
              </div>
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Địa điểm là bắt buộc' })}
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Nhập địa điểm giải đấu"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Thông tin bổ sung */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quy tắc Giải đấu
                </label>
                <textarea
                  {...register('rules')}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Mô tả các quy tắc và quy định của giải đấu"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thông tin Giải thưởng
                </label>
                <textarea
                  {...register('prizeInfo')}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Mô tả các giải thưởng và phần thưởng"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông tin liên hệ *
              </label>
              <input
                type="text"
                {...register('contactInfo', { required: 'Thông tin liên hệ là bắt buộc' })}
                className={`input-field ${errors.contactInfo ? 'border-red-500' : ''}`}
                placeholder="Email hoặc số điện thoại liên hệ"
                disabled={isSubmitting}
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
              )}
            </div>

            {/* Tóm tắt thay đổi */}
            {isDirty && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Thay đổi Đang chờ</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Bạn có những thay đổi chưa lưu cho giải đấu này. Nhấp vào "Lưu thay đổi" để áp dụng.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !isValid || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentEditForm;