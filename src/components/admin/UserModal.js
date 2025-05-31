import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const UserModal = ({
                       isOpen,
                       onClose,
                       onSubmit,
                       isLoading,
                       availableRoles = [],
                       initialData = null,
                       title = 'Biểu mẫu người dùng' // Tiêu đề mặc định
                   }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        roles: ['STUDENT'],
        isActive: true,
        avatar: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                password: '', // Luôn để trống cho chế độ chỉnh sửa
                phone: initialData.phone || '',
                roles: Array.isArray(initialData.roles) ? initialData.roles : [initialData.roles || 'STUDENT'],
                isActive: initialData.isActive ?? true,
                avatar: initialData.avatar || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                roles: ['STUDENT'],
                isActive: true,
                avatar: ''
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên là bắt buộc';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Tên phải có ít nhất 2 ký tự';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
        }

        if (!isEditMode && !formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.phone && !/^[\d+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = 'Vui lòng nhập số điện thoại hợp lệ';
        }

        if (!formData.roles || formData.roles.length === 0) {
            newErrors.roles = 'Phải có ít nhất một vai trò';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng sửa các lỗi trong biểu mẫu');
            return;
        }

        const submitData = { ...formData };

        // Không gửi mật khẩu trống cho chế độ chỉnh sửa
        if (isEditMode && !submitData.password) {
            delete submitData.password;
        }

        // Không gửi avatar trống
        if (!submitData.avatar) {
            delete submitData.avatar;
        }

        // Không gửi số điện thoại trống
        if (!submitData.phone) {
            delete submitData.phone;
        }

        onSubmit(submitData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleRoleChange = (role, checked) => {
        setFormData(prev => {
            const newRoles = checked
                ? [...prev.roles, role]
                : prev.roles.filter(r => r !== role);

            return { ...prev, roles: newRoles };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Lớp phủ nền */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Bảng điều khiển Modal */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Tiêu đề */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Biểu mẫu */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tên */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và Tên *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`pl-10 input-field ${
                                        errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="Nhập họ và tên"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`pl-10 input-field ${
                                        errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="Nhập địa chỉ email"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu {!isEditMode && '*'}
                                {isEditMode && <span className="text-gray-500 text-xs"> (để trống nếu không muốn thay đổi)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`input-field pr-10 ${
                                        errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder={isEditMode ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Điện thoại */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`pl-10 input-field ${
                                        errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="Nhập số điện thoại"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* Vai trò */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vai trò *
                            </label>
                            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                                {availableRoles.length > 0 ? (
                                    availableRoles.map((role) => (
                                        <label key={role.name || role} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(role.name || role)}
                                                onChange={(e) => handleRoleChange(role.name || role, e.target.checked)}
                                                className="rounded border-gray-300"
                                                disabled={isLoading}
                                            />
                                            <span className="text-sm text-gray-700">{role.name || role}</span>
                                            {role.userCount !== undefined && (
                                                <span className="text-xs text-gray-500">({role.userCount} người dùng)</span>
                                            )}
                                        </label>
                                    ))
                                ) : (
                                    ['ADMIN', 'ORGANIZER', 'STUDENT'].map((role) => (
                                        <label key={role} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(role)}
                                                onChange={(e) => handleRoleChange(role, e.target.checked)}
                                                className="rounded border-gray-300"
                                                disabled={isLoading}
                                            />
                                            <span className="text-sm text-gray-700">{role}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                            {errors.roles && (
                                <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
                            )}
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                    className="rounded border-gray-300"
                                    disabled={isLoading}
                                />
                                <span className="text-sm text-gray-700">Tài khoản người dùng hoạt động</span>
                            </label>
                        </div>

                        {/* Hành động */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                                    </div>
                                ) : (
                                    isEditMode ? 'Cập nhật người dùng' : 'Tạo người dùng'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserModal;