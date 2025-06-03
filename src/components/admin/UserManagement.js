import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Shield,
    Crown,
    User,
    AlertTriangle,
    Download,
    Upload,
    MoreVertical,
    UserPlus,
    Key,
    UserX,
    UserCheck
} from 'lucide-react';
import { adminUserService, roleManagementService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import UserModal from './UserModal';
import UserDetailModal from './UserDetailModal';
import ConfirmModal from './ConfirmModal';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0); // Backend sử dụng phân trang dựa trên 0
    const [size] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [sortDirection, setSortDirection] = useState('ASC');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Trạng thái Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const queryClient = useQueryClient();

    const { data: usersResponse, isLoading, error } = useQuery(
        ['admin-users', { page, size, sortBy, sortDirection, search: searchTerm, role: roleFilter, isActive: statusFilter }],
        () => adminUserService.getAllUsers({
            page,
            size,
            sortBy,
            sortDirection,
            search: searchTerm || undefined,
            role: roleFilter || undefined,
            isActive: statusFilter !== '' ? statusFilter === 'true' : undefined
        }),
        {
            staleTime: 30 * 1000, // 30 giây
            keepPreviousData: true,
            onError: (error) => {
                console.error('Lỗi khi tải người dùng:', error);
                toast.error('Không thể tải người dùng');
            }
        }
    );

    // Lấy thống kê người dùng
    const { data: userStats } = useQuery(
        'user-statistics',
        () => adminUserService.getUserStatistics(),
        {
            staleTime: 5 * 60 * 1000, // 5 phút
            onError: (error) => {
                console.error('Lỗi khi tải thống kê người dùng:', error);
            }
        }
    );

    // Lấy vai trò cho dropdown
    const { data: rolesResponse } = useQuery(
        'roles',
        () => roleManagementService.getAllRoles(),
        {
            staleTime: 10 * 60 * 1000, // 10 phút
            onError: (error) => {
                console.error('Lỗi khi tải vai trò:', error);
            }
        }
    );

    // Mutations
    const createUserMutation = useMutation(
        (userData) => adminUserService.createUser(userData),
        {
            onSuccess: () => {
                toast.success('Người dùng đã được tạo thành công');
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
                setIsCreateModalOpen(false);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Không thể tạo người dùng');
            }
        }
    );

    const updateUserMutation = useMutation(
        ({ id, userData }) => adminUserService.updateUser(id, userData),
        {
            onSuccess: () => {
                toast.success('Người dùng đã được cập nhật thành công');
                queryClient.invalidateQueries('admin-users');
                setIsEditModalOpen(false);
                setSelectedUser(null);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Không thể cập nhật người dùng');
            }
        }
    );

    const deleteUserMutation = useMutation(
        (id) => adminUserService.deleteUser(id),
        {
            onSuccess: () => {
                toast.success('Người dùng đã được xóa thành công');
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Không thể xóa người dùng');
            }
        }
    );

    const toggleStatusMutation = useMutation(
        ({ id, isActive }) => adminUserService.toggleUserStatus(id, isActive),
        {
            onSuccess: () => {
                toast.success('Trạng thái người dùng đã được cập nhật thành công');
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Không thể cập nhật trạng thái người dùng');
            }
        }
    );

    const resetPasswordMutation = useMutation(
        ({ id, newPassword }) => adminUserService.resetUserPassword(id, newPassword),
        {
            onSuccess: () => {
                toast.success('Mật khẩu đã được đặt lại thành công');
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Không thể đặt lại mật khẩu');
            }
        }
    );

    const bulkDeleteMutation = useMutation(
        (userIds) => adminUserService.bulkDeleteUsers(userIds),
        {
            onSuccess: () => {
                toast.success(`${selectedUsers.length} người dùng đã được xóa thành công`);
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
                setSelectedUsers([]);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Không thể xóa người dùng');
            }
        }
    );

    // Xử lý sự kiện
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); // Đặt lại về trang đầu tiên
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
        setPage(0);
    };

    const handleToggleStatus = (user) => {
        toggleStatusMutation.mutate({
            id: user.id,
            // Sử dụng user.active từ dữ liệu API để xác định trạng thái hiện tại
            isActive: !user.active 
        });
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleResetPassword = (user) => {
        const newPassword = prompt('Nhập mật khẩu mới cho ' + user.name + ':');
        if (newPassword && newPassword.length >= 6) {
            resetPasswordMutation.mutate({
                id: user.id,
                newPassword
            });
        } else if (newPassword) {
            toast.error('Mật khẩu phải dài ít nhất 6 ký tự');
        }
    };

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) {
            toast.error('Vui lòng chọn người dùng để xóa');
            return;
        }
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng này không?`)) {
            bulkDeleteMutation.mutate(selectedUsers);
        }
    };

    const handleExportUsers = async () => {
        try {
            const response = await adminUserService.exportUsers({
                search: searchTerm || undefined,
                role: roleFilter || undefined,
                // Giữ isActive ở đây, vì API của bạn có thể mong đợi tên tham số này cho bộ lọc
                // Nếu backend của bạn mong đợi 'active', hãy thay đổi thành 'active'
                isActive: statusFilter !== '' ? statusFilter === 'true' : undefined
            });

            // Tạo và tải xuống tệp CSV
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Người dùng đã được xuất thành công');
        } catch (error) {
            toast.error('Không thể xuất người dùng');
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUsers(usersResponse?.data?.content?.map(user => user.id) || []);
        } else {
            setSelectedUsers([]);
        }
    };

    // Hàm trợ giúp
    const getRoleIcon = (role) => {
        const roleArray = Array.isArray(role) ? role : [role];
        if (roleArray.includes('ADMIN')) {
            return <Crown className="h-4 w-4 text-yellow-500" />;
        } else if (roleArray.includes('ORGANIZER')) {
            return <Shield className="h-4 w-4 text-blue-500" />;
        } else {
            return <User className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRoleBadge = (roles) => {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        const primaryRole = roleArray[0];
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

        switch (primaryRole) {
            case 'ADMIN':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'ORGANIZER':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'STUDENT':
                return `${baseClasses} bg-green-100 text-green-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Lỗi khi tải người dùng. Vui lòng thử lại sau.</p>
                <button
                    onClick={() => queryClient.invalidateQueries('admin-users')}
                    className="btn-primary mt-4"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    const users = usersResponse?.data;
    const totalUsers = userStats?.data?.totalUsers || 0;
    const activeUsers = userStats?.data?.activeUsers || 0;
    const availableRoles = rolesResponse?.data || [];

    return (
        <div className="space-y-6">
            {/* Phần đầu với Thống kê */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h2>
                    <p className="text-gray-600">Quản lý tài khoản người dùng, vai trò và quyền hạn</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {totalUsers} Tổng số người dùng
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {activeUsers} Hoạt động
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm người dùng
                    </button>
                </div>
            </div>

            {/* Tìm kiếm và Bộ lọc */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 input-field"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="input-field min-w-[120px]"
                        >
                            <option value="">Tất cả vai trò</option>
                            {availableRoles.map((role) => (
                                <option key={role.name} value={role.name}>{role.name}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field min-w-[120px]"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Hoạt động</option>
                            <option value="false">Không hoạt động</option>
                        </select>

                        <button
                            type="submit"
                            className="btn-primary whitespace-nowrap"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Áp dụng
                        </button>
                    </div>
                </form>
            </div>

            {/* Thanh hành động */}
            {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">
                            Đã chọn {selectedUsers.length} người dùng
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleBulkDelete}
                                className="btn-secondary text-red-600 hover:bg-red-50"
                                disabled={bulkDeleteMutation.isLoading}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa đã chọn
                            </button>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="btn-secondary"
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nút xuất */}
            {/* Nếu bạn muốn dùng lại, chỉ cần bỏ comment */}
            {/* <div className="flex justify-end">
                <button
                    onClick={handleExportUsers}
                    className="btn-secondary"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Xuất CSV
                </button>
            </div> */}

            {/* Bảng người dùng */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner />
                    </div>
                ) : users?.content?.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Không tìm thấy người dùng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === users?.content?.length && users?.content?.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                        onClick={() => handleSort('name')}
                                    >
                                        Người dùng {sortBy === 'name' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                        onClick={() => handleSort('isActive')}
                                    >
                                        Trạng thái {sortBy === 'isActive' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        Đã tạo {sortBy === 'createdAt' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users?.content?.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {user.avatar ? (
                                                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                            <span className="text-primary-600 font-medium text-sm">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                    {user.phone && (
                                                        <div className="text-xs text-gray-400">{user.phone}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {getRoleIcon(user.roles)}
                                                <span className={getRoleBadge(user.roles)}>
                                                    {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                user.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.active ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="text-gray-600 hover:text-primary-600 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                                    title="Chỉnh sửa người dùng"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user)}
                                                    className="text-gray-600 hover:text-purple-600 transition-colors"
                                                    title="Đặt lại mật khẩu"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`transition-colors ${
                                                        user.active
                                                            ? 'text-gray-600 hover:text-red-600'
                                                            : 'text-gray-600 hover:text-green-600'
                                                    }`}
                                                    title={user.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                    disabled={toggleStatusMutation.isLoading}
                                                >
                                                    {user.active ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-gray-600 hover:text-red-600 transition-colors"
                                                    title="Xóa người dùng"
                                                    disabled={deleteUserMutation.isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Phân trang */}
                {users && users.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị từ {users.page * users.size + 1} đến {Math.min((users.page + 1) * users.size, users.totalElements)} trên tổng số {users.totalElements} kết quả
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={users.first}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                <span className="px-3 py-2 text-sm text-gray-700">
                                    Trang {page + 1} trên {users.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={users.last}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Tiếp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
                <UserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={(userData) => createUserMutation.mutate(userData)}
                    isLoading={createUserMutation.isLoading}
                    availableRoles={availableRoles}
                    title="Tạo người dùng mới"
                />
            )}

            {isEditModalOpen && selectedUser && (
                <UserModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onSubmit={(userData) => updateUserMutation.mutate({ id: selectedUser.id, userData })}
                    isLoading={updateUserMutation.isLoading}
                    availableRoles={availableRoles}
                    initialData={selectedUser}
                    title="Chỉnh sửa người dùng"
                />
            )}

            {isDetailModalOpen && selectedUser && (
                <UserDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
            )}

            {isDeleteModalOpen && selectedUser && (
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onConfirm={() => deleteUserMutation.mutate(selectedUser.id)}
                    isLoading={deleteUserMutation.isLoading}
                    title="Xóa người dùng"
                    message={`Bạn có chắc chắn muốn xóa "${selectedUser.name}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    confirmButtonClass="btn-danger"
                />
            )}
        </div>
    );
};

export default UserManagement;