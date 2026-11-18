import React, { useEffect } from 'react';
import {
    ExclamationTriangleIcon,
    TrashIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export type CiPressModalType = 'confirm' | 'danger' | 'warning' | 'success' | 'info';

export interface CiPressModalProps {
    isOpen: boolean;
    type?: CiPressModalType;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
    onClose?: () => void;
}

export const CiPressModal: React.FC<CiPressModalProps> = ({
    isOpen,
    type = 'confirm',
    title,
    message,
    confirmText,
    cancelText,
    showCancel,
    onConfirm,
    onCancel,
    onClose
}) => {
    // ESC key closes modal
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (onCancel) onCancel();
                else if (onClose) onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, onClose]);

    if (!isOpen) return null;

    // Determine if cancel button should be visible:
    // Only show cancel if explicitly requested (showCancel === true), or
    // if type is 'confirm', or if type is 'danger' AND a cancelText was explicitly passed (destructive confirmation).
    const isConfirmationDialog = type === 'confirm' || (type === 'danger' && Boolean(cancelText));
    const shouldShowCancel = showCancel !== undefined 
        ? showCancel 
        : (isConfirmationDialog || Boolean(cancelText && cancelText.trim().length > 0 && type !== 'info' && type !== 'success'));

    const finalCancelText = cancelText || 'Cancelar';

    // Default confirm text depending on type
    const defaultConfirmText = type === 'danger' && isConfirmationDialog
        ? 'Eliminar' 
        : (type === 'confirm' ? 'Confirmar' : 'Entendido');
    const finalConfirmText = confirmText || defaultConfirmText;

    // Style and icon based on type
    const getIconAndColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <TrashIcon className="w-7 h-7 text-red-600" />,
                    iconBg: 'bg-red-50 border-red-200',
                    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                };
            case 'warning':
            case 'confirm':
                return {
                    icon: <ExclamationTriangleIcon className="w-7 h-7 text-orange-600" />,
                    iconBg: 'bg-orange-50 border-orange-200',
                    confirmBtn: 'bg-primary hover:bg-orange-600 text-white shadow-orange-200'
                };
            case 'success':
                return {
                    icon: <CheckCircleIcon className="w-7 h-7 text-emerald-600" />,
                    iconBg: 'bg-emerald-50 border-emerald-200',
                    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                };
            case 'info':
            default:
                return {
                    icon: <InformationCircleIcon className="w-7 h-7 text-blue-600" />,
                    iconBg: 'bg-blue-50 border-blue-200',
                    confirmBtn: 'bg-primary hover:bg-orange-600 text-white shadow-orange-200'
                };
        }
    };

    const { icon, iconBg, confirmBtn } = getIconAndColors();

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            if (onCancel) onCancel();
            else if (onClose) onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4 transition-opacity animate-fade-in"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-100 flex flex-col transform transition-all relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button top-right */}
                <button
                    type="button"
                    onClick={() => {
                        if (onCancel) onCancel();
                        else if (onClose) onClose();
                    }}
                    className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Cerrar ventana"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header Icon + Brand Accent */}
                <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconBg} shadow-sm`}>
                        {icon}
                    </div>
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            CiPress • Mensaje del Sistema
                        </span>
                        <h3 className="text-lg md:text-xl font-bold font-serif text-gray-900 leading-tight">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Content Message */}
                <div className="text-sm text-gray-600 leading-relaxed mb-6 pl-1">
                    {typeof message === 'string' ? (
                        <p>{message}</p>
                    ) : (
                        message
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
                    {shouldShowCancel && (
                        <button
                            type="button"
                            onClick={() => {
                                if (onCancel) onCancel();
                                else if (onClose) onClose();
                            }}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm"
                        >
                            {finalCancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-5 py-2.5 font-bold rounded-xl shadow transition-all text-sm ${confirmBtn}`}
                    >
                        {finalConfirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CiPressModal;

