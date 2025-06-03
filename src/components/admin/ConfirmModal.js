// import React from 'react';
// import { AlertTriangle, X, Trash2, UserX, Shield } from 'lucide-react';

// const ConfirmModal = ({
//                           isOpen,
//                           onClose,
//                           onConfirm,
//                           isLoading = false,
//                           title = 'Xác nhận Hành động',
//                           message = 'Bạn có chắc chắn muốn tiếp tục?',
//                           confirmText = 'Xác nhận',
//                           cancelText = 'Hủy bỏ',
//                           confirmButtonClass = 'btn-danger',
//                           icon = 'warning',
//                           showIcon = true
//                       }) => {
//     if (!isOpen) return null;

//     const getIcon = () => {
//         switch (icon) {
//             case 'danger':
//             case 'delete':
//                 return <Trash2 className="h-6 w-6 text-red-600" />;
//             case 'user':
//                 return <UserX className="h-6 w-6 text-red-600" />;
//             case 'shield':
//                 return <Shield className="h-6 w-6 text-yellow-600" />;
//             case 'warning':
//             default:
//                 return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
//         }
//     };

//     const handleConfirm = () => {
//         onConfirm();
//     };

//     return (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//                 {/* Background overlay */}
//                 <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

//                 {/* Modal panel */}
//                 <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
//                     {/* Header with Icon */}
//                     <div className="flex items-start space-x-4">
//                         {showIcon && (
//                             <div className="flex-shrink-0">
//                                 <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
//                                     {getIcon()}
//                                 </div>
//                             </div>
//                         )}

//                         <div className="flex-1">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h3 className="text-lg font-medium text-gray-900">{title}</h3>
//                                 <button
//                                     onClick={onClose}
//                                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                                     disabled={isLoading}
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>

//                             <div className="mb-6">
//                                 <p className="text-sm text-gray-600 leading-relaxed">
//                                     {message}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex justify-end space-x-3">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="btn-secondary"
//                             disabled={isLoading}
//                         >
//                             {cancelText}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={handleConfirm}
//                             className={confirmButtonClass}
//                             disabled={isLoading}
//                         >
//                             {isLoading ? (
//                                 <div className="flex items-center">
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                                     Đang xử lý...
//                                 </div>
//                             ) : (
//                                 confirmText
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ConfirmModal;

import React from 'react';
import { AlertTriangle, X, Trash2, UserX, Shield, Play } from 'lucide-react'; // Thêm Play icon

const ConfirmModal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          isLoading = false,
                          title = 'Xác nhận Hành động',
                          message = 'Bạn có chắc chắn muốn tiếp tục?',
                          confirmText = 'Xác nhận',
                          cancelText = 'Hủy bỏ',
                          confirmButtonClass = 'btn-danger',
                          icon = 'warning',
                          showIcon = true
                      }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (icon) {
            case 'danger':
            case 'delete':
                return <Trash2 className="h-6 w-6 text-red-600" />;
            case 'user':
                return <UserX className="h-6 w-6 text-red-600" />;
            case 'shield':
                return <Shield className="h-6 w-6 text-yellow-600" />;
            case 'play': // Thêm case cho icon 'play'
                return <Play className="h-6 w-6 text-green-600" />;
            case 'warning':
            default:
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
        }
    };

    const getIconBackgroundColor = () => {
        switch (icon) {
            case 'danger':
            case 'delete':
            case 'user':
                return 'bg-red-100';
            case 'play':
                return 'bg-green-100'; // Màu nền cho icon Play
            case 'warning':
            case 'shield':
            default:
                return 'bg-yellow-100'; // Đổi từ red-100 sang yellow-100 cho default warning
        }
    }

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header with Icon */}
                    <div className="flex items-start space-x-4">
                        {showIcon && (
                            <div className="flex-shrink-0">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getIconBackgroundColor()}`}>
                                    {getIcon()}
                                </div>
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={confirmButtonClass}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang xử lý...
                                </div>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;