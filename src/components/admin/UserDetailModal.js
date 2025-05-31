import React from 'react';
import { X, User, Mail, Phone, Calendar, Shield, Crown, Eye, MapPin, Camera } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const getRoleIcon = (role) => {
        const roleArray = Array.isArray(role) ? role : [role];
        if (roleArray.includes('ADMIN')) {
            return <Crown className="h-5 w-5 text-yellow-500" />;
        } else if (roleArray.includes('ORGANIZER')) {
            return <Shield className="h-5 w-5 text-blue-500" />;
        } else {
            return <User className="h-5 w-5 text-gray-500" />;
        }
    };

    const getRoleBadge = (roles) => {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.map((role, index) => {
            const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
            let colorClasses;

            switch (role) {
                case 'ADMIN':
                    colorClasses = 'bg-yellow-100 text-yellow-800';
                    break;
                case 'ORGANIZER':
                    colorClasses = 'bg-blue-100 text-blue-800';
                    break;
                case 'STUDENT':
                    colorClasses = 'bg-green-100 text-green-800';
                    break;
                default:
                    colorClasses = 'bg-gray-100 text-gray-800';
            }

            return (
                <span key={role} className={`${baseClasses} ${colorClasses}`}>
          {role}
        </span>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Lớp phủ nền */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Bảng điều khiển Modal */}
                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Tiêu đề */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Chi Tiết Người Dùng</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Tiêu đề Hồ sơ Người dùng */}
                    <div className="flex items-center space-x-6 mb-8 p-6 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            {user.avatar ? (
                                <img
                                    className="h-20 w-20 rounded-full object-cover"
                                    src={user.avatar}
                                    alt={user.name}
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <div className="flex items-center space-x-2">
                                    {getRoleIcon(user.roles)}
                                </div>
                            </div>
                            <p className="text-gray-600 mb-2">{user.email}</p>
                            <div className="flex items-center space-x-2">
                                {getRoleBadge(user.roles)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                  {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Lưới Thông tin Người dùng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Thông tin Liên hệ */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Thông Tin Liên Hệ
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900">{user.email}</p>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Điện thoại</p>
                                            <p className="text-gray-900">{user.phone}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Vai trò</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {getRoleBadge(user.roles)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className={`h-5 w-5 rounded-full ${
                                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <div>
                                        <p className="text-sm text-gray-500">Trạng thái tài khoản</p>
                                        <p className={`font-medium ${
                                            user.isActive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {user.isActive ? 'Tài khoản hoạt động' : 'Tài khoản không hoạt động'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin Tài khoản */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Thông Tin Tài Khoản
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Thành viên từ</p>
                                        <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Eye className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Đăng nhập lần cuối</p>
                                        <p className="text-gray-900">
                                            {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa từng đăng nhập'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">ID Người dùng</p>
                                        <p className="text-gray-900 font-mono">{user.id}</p>
                                    </div>
                                </div>

                                {user.avatar && (
                                    <div className="flex items-center space-x-3">
                                        <Camera className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ảnh đại diện</p>
                                            <p className="text-gray-900">Đã tải lên ảnh đại diện tùy chỉnh</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tóm tắt Tài khoản */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Tóm Tắt Tài Khoản</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{user.roles?.length || 1}</p>
                                <p className="text-sm text-gray-600">Vai trò{user.roles?.length > 1 ? 's' : ''}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {user.createdAt ? Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                                </p>
                                <p className="text-sm text-gray-600">Ngày hoạt động</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {user.isActive ? 'Có' : 'Không'}
                                </p>
                                <p className="text-sm text-gray-600">Có thể đăng nhập</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {user.lastLogin ? 'Gần đây' : 'Chưa bao giờ'}
                                </p>
                                <p className="text-sm text-gray-600">Hoạt động cuối</p>
                            </div>
                        </div>
                    </div>

                    {/* Hành động */}
                    <div className="flex justify-end pt-6">
                        <button
                            onClick={onClose}
                            className="btn-primary"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;