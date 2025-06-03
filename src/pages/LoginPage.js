import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log('Attempting login with:', { username: data.email });
      const response = await login({
        username: data.email,
        password: data.password,
      });
      console.log('Login successful:', response);
      toast.success('Đăng nhập thành công!');
      // Thay đổi ở đây: Chuyển hướng về trang chủ
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Đăng nhập thất bại!');
    }
  };

  // const handleGoogleSuccess = async (credentialResponse) => {
  //   console.log("Google Login Success (via GoogleLogin component):", credentialResponse);

  //   const googleIdToken = credentialResponse.credential;

  //   if (googleIdToken) {
  //     try {
  //       await loginWithGoogle(googleIdToken);
  //       toast.success('Đăng nhập bằng Google thành công!');
  //       // Thay đổi ở đây: Chuyển hướng về trang chủ
  //       navigate('/');
  //     } catch (error) {
  //       console.error('Backend login with Google ID Token failed:', error);
  //       toast.error(error.message || 'Đăng nhập bằng Google thất bại ở backend.');
  //     }
  //   } else {
  //     toast.error('Phản hồi đăng nhập Google thiếu ID token (credential).');
  //     console.error('credentialResponse của Google không chứa ID token.');
  //   }
  // };

  // const handleGoogleError = () => {
  //   console.log('Đăng nhập bằng Google thất bại');
  //   toast.error('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  // };

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

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
            <p className="text-gray-600">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ Email
              </label>
              <input
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Địa chỉ email không hợp lệ',
                  },
                })}
                type="email"
                className="input-field"
                placeholder="Nhập địa chỉ email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Nhập mật khẩu"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Nhớ mật khẩu
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Hoặc</span>
            </div>
          </div> */}

          {/* <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          /> */}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-white hover:text-gray-200 text-sm">
            ← Quay lại Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;