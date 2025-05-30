import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.'); // Đã dịch
      // Navigate and force page refresh to ensure clean state
      navigate('/login');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại'); // Đã dịch
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-sports-purple flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="bg-white p-3 rounded-full">
              <Trophy className="h-8 w-8 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-white">EduSports</span>
          </Link>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</h1> {/* Đã dịch */}
            <p className="text-gray-600">Tham gia EduSports để đăng ký các giải đấu</p> {/* Đã dịch */}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Họ và Tên
              </label> {/* Đã dịch */}
              <input
                {...register('name', {
                  required: 'Họ và tên là bắt buộc', // Đã dịch
                  minLength: {
                    value: 2,
                    message: 'Tên phải có ít nhất 2 ký tự', // Đã dịch
                  },
                })}
                type="text"
                className="input-field"
                placeholder="Nhập họ và tên đầy đủ của bạn" // Đã dịch
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ Email
              </label> {/* Đã dịch */}
              <input
                {...register('email', {
                  required: 'Email là bắt buộc', // Đã dịch
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Địa chỉ email không hợp lệ', // Đã dịch
                  },
                })}
                type="email"
                className="input-field"
                placeholder="Nhập địa chỉ email của bạn" // Đã dịch
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label> {/* Đã dịch */}
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc', // Đã dịch
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự', // Đã dịch
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Nhập mật khẩu của bạn" // Đã dịch
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận Mật khẩu
              </label> {/* Đã dịch */}
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu của bạn', // Đã dịch
                    validate: (value) =>
                      value === password || 'Mật khẩu không khớp', // Đã dịch
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Xác nhận mật khẩu của bạn" // Đã dịch
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('acceptTerms', {
                  required: 'Bạn phải chấp nhận các điều khoản và điều kiện', // Đã dịch
                })}
                id="accept-terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                Tôi đồng ý với{' '} {/* Đã dịch */}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Điều khoản và Điều kiện
                </Link>{' '} {/* Đã dịch */}
                và{' '} {/* Đã dịch */}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Chính sách quyền riêng tư
                </Link> {/* Đã dịch */}
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Tạo tài khoản</span> {/* Đã dịch */}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Bạn đã có tài khoản?{' '} {/* Đã dịch */}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Đăng nhập
              </Link> {/* Đã dịch */}
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-white hover:text-gray-200 text-sm">
            ← Quay lại Trang chủ
          </Link> {/* Đã dịch */}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;