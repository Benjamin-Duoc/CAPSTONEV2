import React, { useState, useEffect } from 'react';
import type { ShortCollaboration } from '../../types';
import { 
    CalendarDaysIcon, 
    CurrencyDollarIcon, 
    DevicePhoneMobileIcon, 
    CheckCircleIcon, 
    ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';

interface ShortCollaborationFormProps {
    collaboration: ShortCollaboration | null;
    onSave: (collaboration: ShortCollaboration | Omit<ShortCollaboration, 'id'>) => void;
    onClose: () => void;
    isModal?: boolean;
    hideAuthorFields?: boolean;
}

const initialCollaborationState: Omit<ShortCollaboration, 'id'> = {
    title: '',
    deadline: '',
    budget: '',
    author: '',
    authorAvatarUrl: 'https://i.pravatar.cc/40',
    whatsappContact: '',
};

const getTodayISO = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const getMaxDateISO = (daysAhead: number = 30) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatDateToDeadline = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
        return `Hasta el ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
};

const cleanAndFormatBudget = (input: string, isNegotiable: boolean): { valid: boolean; formatted: string; error?: string } => {
    if (isNegotiable) return { valid: true, formatted: 'A convenir' };
    if (!input || !input.trim()) return { valid: false, formatted: '', error: 'El presupuesto es obligatorio.' };
    
    let str = input.trim().replace(/\$/g, '').replace(/CLP/gi, '').trim();

    // Si tiene comas decimales (ej: 280000,57), remover la parte decimal (Chile no usa centavos)
    if (str.includes(',')) {
        str = str.split(',')[0].trim();
    } else if (/\.\d{1,2}$/.test(str)) {
        // Si termina en punto con 1 o 2 decimales (ej: 280000.57), remover decimales
        str = str.replace(/\.\d{1,2}$/, '').trim();
    }

    // Detectar si el usuario ingresó caracteres no numéricos extraños (como 664%vgfg)
    const invalidChars = str.replace(/[\d\.]/g, '').trim();
    if (invalidChars.length > 0) {
        return { 
            valid: false, 
            formatted: '', 
            error: 'Ingresa un monto numérico válido en pesos chilenos (sin letras ni símbolos especiales).' 
        };
    }

    const digitsOnly = str.replace(/\D/g, '');
    if (!digitsOnly) {
        return { valid: false, formatted: '', error: 'Ingresa un monto numérico en CLP.' };
    }

    const amount = parseInt(digitsOnly, 10);
    if (isNaN(amount) || amount < 1000) {
        return { valid: false, formatted: '', error: 'El monto mínimo de presupuesto debe ser de $1.000 CLP.' };
    }

    const formatted = `$${new Intl.NumberFormat('es-CL').format(amount)} CLP`;
    return { valid: true, formatted };
};

const cleanAndFormatWhatsApp = (input: string): { valid: boolean; cleanPhone: string; error?: string } => {
    if (!input || !input.trim()) return { valid: false, cleanPhone: '', error: 'El WhatsApp de contacto es obligatorio.' };
    let digits = input.replace(/\D/g, '');

    // Si es un número chileno de 9 dígitos que empieza con 9 (ej: 912345678), autocompletar código país 56
    if (digits.length === 9 && digits.startsWith('9')) {
        digits = `56${digits}`;
    }

    if (digits.length < 9 || digits.length > 13) {
        return { 
            valid: false, 
            cleanPhone: '', 
            error: 'Ingresa un número de celular válido de 9 a 11 dígitos (ej: 56912345678 o 912345678).' 
        };
    }

    return { valid: true, cleanPhone: digits };
};

const ShortCollaborationForm: React.FC<ShortCollaborationFormProps> = ({ 
    collaboration, 
    onSave, 
    onClose, 
    isModal = true, 
    hideAuthorFields = false 
}) => {
    const [formData, setFormData] = useState(initialCollaborationState);
    const [deadlineDate, setDeadlineDate] = useState<string>('');
    const [rawBudget, setRawBudget] = useState<string>('');
    const [isBudgetNegotiable, setIsBudgetNegotiable] = useState<boolean>(false);
    const [rawWhatsApp, setRawWhatsApp] = useState<string>('');

    // Errores de validación en tiempo real
    const [errors, setErrors] = useState<{
        title?: string;
        deadline?: string;
        budget?: string;
        whatsapp?: string;
    }>({});

    // Modal de alertas institucionales según AGENTS.md
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type?: CiPressModalType;
        title: string;
        message: string;
        confirmText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const showAlert = (title: string, message: string, type: CiPressModalType = 'warning') => {
        setModalConfig({
            isOpen: true,
            type,
            title,
            message,
            confirmText: 'Entendido',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    useEffect(() => {
        if (collaboration) {
            setFormData({
                ...initialCollaborationState,
                ...collaboration
            });

            // Extraer valor de presupuesto
            if (collaboration.budget) {
                if (collaboration.budget.toLowerCase().includes('convenir')) {
                    setIsBudgetNegotiable(true);
                    setRawBudget('');
                } else {
                    setIsBudgetNegotiable(false);
                    setRawBudget(collaboration.budget);
                }
            }

            // Extraer WhatsApp
            if (collaboration.whatsappContact) {
                setRawWhatsApp(collaboration.whatsappContact);
            }

            // Intentar detectar fecha si está en formato ISO o fecha
            if (collaboration.deadline) {
                const matchIso = collaboration.deadline.match(/\d{4}-\d{2}-\d{2}/);
                const matchCl = collaboration.deadline.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                if (matchIso) {
                    setDeadlineDate(matchIso[0]);
                } else if (matchCl) {
                    setDeadlineDate(`${matchCl[3]}-${matchCl[2]}-${matchCl[1]}`);
                }
            }
        } else {
            setFormData(initialCollaborationState);
            setDeadlineDate('');
            setRawBudget('');
            setIsBudgetNegotiable(false);
            setRawWhatsApp('');
        }
    }, [collaboration]);

    // Manejo de fecha con selector y accesos rápidos
    const handleDateSelect = (isoDate: string) => {
        setDeadlineDate(isoDate);
        const today = getTodayISO();
        const maxDate = getMaxDateISO(30);

        if (isoDate && isoDate < today) {
            setErrors(prev => ({ ...prev, deadline: 'La fecha límite no puede estar en el pasado.' }));
            return;
        }
        if (isoDate && isoDate > maxDate) {
            setErrors(prev => ({ ...prev, deadline: 'Por ser una colaboración urgente, el plazo máximo permitido es de 30 días.' }));
            return;
        }

        const formatted = formatDateToDeadline(isoDate);
        setFormData(prev => ({ ...prev, deadline: formatted }));
        setErrors(prev => ({ ...prev, deadline: undefined }));
    };

    const handlePresetDays = (daysFromNow: number) => {
        const target = new Date();
        target.setDate(target.getDate() + daysFromNow);
        const yyyy = target.getFullYear();
        const mm = String(target.getMonth() + 1).padStart(2, '0');
        const dd = String(target.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;
        handleDateSelect(iso);
    };

    // Manejo de presupuesto
    const handleBudgetChange = (val: string) => {
        setRawBudget(val);
        const res = cleanAndFormatBudget(val, isBudgetNegotiable);
        if (res.valid) {
            setFormData(prev => ({ ...prev, budget: res.formatted }));
            setErrors(prev => ({ ...prev, budget: undefined }));
        } else {
            setErrors(prev => ({ ...prev, budget: res.error }));
        }
    };

    const handleNegotiableToggle = (checked: boolean) => {
        setIsBudgetNegotiable(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, budget: 'A convenir' }));
            setErrors(prev => ({ ...prev, budget: undefined }));
        } else {
            handleBudgetChange(rawBudget);
        }
    };

    // Manejo de WhatsApp (solo dígitos)
    const handleWhatsAppChange = (val: string) => {
        const digitsOnly = val.replace(/\D/g, '');
        setRawWhatsApp(digitsOnly);
        const res = cleanAndFormatWhatsApp(digitsOnly);
        if (res.valid) {
            setFormData(prev => ({ ...prev, whatsappContact: res.cleanPhone }));
            setErrors(prev => ({ ...prev, whatsapp: undefined }));
        } else {
            setErrors(prev => ({ ...prev, whatsapp: res.error }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones rigurosas
        const newErrors: typeof errors = {};

        if (!formData.title || formData.title.trim().length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres descriptivos.';
        }

        const today = getTodayISO();
        const maxDate = getMaxDateISO(30);

        if (!formData.deadline || !deadlineDate) {
            newErrors.deadline = 'Debes seleccionar una fecha límite exacta para el encargo.';
        } else if (deadlineDate < today) {
            newErrors.deadline = 'La fecha límite no puede estar en el pasado.';
        } else if (deadlineDate > maxDate) {
            newErrors.deadline = 'Por ser una colaboración urgente, el plazo no puede superar los 30 días a contar de hoy.';
        }

        const budgetValidation = cleanAndFormatBudget(rawBudget, isBudgetNegotiable);
        if (!budgetValidation.valid) {
            newErrors.budget = budgetValidation.error;
        }

        const waValidation = cleanAndFormatWhatsApp(rawWhatsApp);
        if (!waValidation.valid) {
            newErrors.whatsapp = waValidation.error;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showAlert(
                'Datos Incompletos o Inválidos',
                'Por favor corrige los campos señalados antes de guardar el aviso.',
                'warning'
            );
            return;
        }

        const finalData = {
            ...formData,
            title: formData.title.trim(),
            deadline: formatDateToDeadline(deadlineDate),
            budget: budgetValidation.formatted,
            whatsappContact: waValidation.cleanPhone
        };

        onSave(finalData);
    };

    const budgetStatus = cleanAndFormatBudget(rawBudget, isBudgetNegotiable);
    const waStatus = cleanAndFormatWhatsApp(rawWhatsApp);
    const todayISO = getTodayISO();
    const maxDateISO = getMaxDateISO(30);

    const formContent = (
        <div className={`bg-white p-6 md:p-8 w-full ${isModal ? 'rounded-3xl shadow-2xl max-w-xl max-h-[92vh] overflow-y-auto' : 'rounded-3xl border border-gray-100 shadow-md'}`}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900">
                        {collaboration ? 'Editar Colaboración Urgente' : 'Añadir Nueva Colaboración'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Define los requerimientos para que colegas del Banco de Talentos puedan postular o contactarte de inmediato.
                    </p>
                </div>
                {isModal && (
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Cerrar"
                    >
                        ✕
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. TÍTULO */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-bold text-gray-700">Título de la Cobertura / Pauta</label>
                        <span className="text-[11px] text-gray-400 font-mono">{formData.title.length}/90</span>
                    </div>
                    <input 
                        type="text" 
                        name="title" 
                        maxLength={90}
                        value={formData.title} 
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, title: e.target.value }));
                            if (e.target.value.trim().length >= 5) {
                                setErrors(prev => ({ ...prev, title: undefined }));
                            }
                        }} 
                        placeholder="Ej: Cobertura fotográfica en terreno - Marcha Estudiantil Santiago" 
                        className={`block w-full border ${errors.title ? 'border-red-400 bg-red-50/30' : 'border-gray-300'} rounded-xl shadow-xs py-2.5 px-3.5 text-sm focus:ring-primary focus:border-primary`} 
                        required 
                    />
                    {errors.title && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* 2. PLAZO / FECHA LÍMITE */}
                <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 text-primary mr-1.5" />
                            Plazo / Fecha Límite de Entrega
                        </label>
                        {deadlineDate && (
                            <span className="text-xs font-bold text-primary bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                                {formatDateToDeadline(deadlineDate)}
                            </span>
                        )}
                    </div>

                    {/* Selector de Fecha Nativo */}
                    <input 
                        type="date" 
                        min={todayISO}
                        max={maxDateISO}
                        value={deadlineDate} 
                        onChange={(e) => handleDateSelect(e.target.value)} 
                        className={`block w-full bg-white border ${errors.deadline ? 'border-red-400' : 'border-gray-300'} rounded-xl shadow-xs py-2.5 px-3.5 text-sm font-medium focus:ring-primary focus:border-primary`} 
                        required 
                    />

                    {/* Accesos rápidos de fecha */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-gray-500 mr-1">Atajos rápidos:</span>
                        <button
                            type="button"
                            onClick={() => handlePresetDays(0)}
                            className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                            Hoy (Urgente)
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDays(1)}
                            className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                            Mañana
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDays(3)}
                            className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                            En 3 días
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDays(7)}
                            className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                            En 1 semana
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDays(15)}
                            className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                            En 15 días
                        </button>
                    </div>

                    <p className="text-[11px] text-gray-500 pt-1 leading-tight">
                        ⏳ <strong>Plazo de urgencia:</strong> hasta 30 días a contar de hoy. (Para búsquedas o contratos estables de mayor duración, publica una <em>Oportunidad Laboral</em>).
                    </p>

                    {errors.deadline && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.deadline}
                        </p>
                    )}
                </div>

                {/* 3. PRESUPUESTO OFRECIDO */}
                <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1.5" />
                            Presupuesto Estimado (CLP)
                        </label>
                        {budgetStatus.valid && (
                            <span className="text-xs font-serif font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                                {budgetStatus.formatted}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold text-sm">$</span>
                        <input 
                            type="text" 
                            disabled={isBudgetNegotiable}
                            value={rawBudget} 
                            onChange={(e) => handleBudgetChange(e.target.value)} 
                            placeholder={isBudgetNegotiable ? 'Monto a convenir con el colega' : 'Ej: 150000 o 280.000'} 
                            className={`block w-full bg-white border ${errors.budget ? 'border-red-400' : 'border-gray-300'} rounded-xl shadow-xs py-2.5 pl-8 pr-14 text-sm font-medium focus:ring-primary focus:border-primary ${isBudgetNegotiable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} 
                        />
                        <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 font-bold text-xs">CLP</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center space-x-2 text-gray-600 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={isBudgetNegotiable} 
                                onChange={(e) => handleNegotiableToggle(e.target.checked)} 
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            />
                            <span>Presupuesto a convenir según experiencia</span>
                        </label>
                        <span className="text-[11px] text-gray-400">Sin centavos decimales</span>
                    </div>

                    {errors.budget && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.budget}
                        </p>
                    )}
                </div>

                {/* 4. CONTACTO DE WHATSAPP */}
                <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-gray-700 flex items-center">
                            <DevicePhoneMobileIcon className="h-4 w-4 text-[#25D366] mr-1.5" />
                            Contacto de WhatsApp para Coordinación
                        </label>
                        {waStatus.valid && (
                            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center">
                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                +{waStatus.cleanPhone}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-mono text-xs font-bold">+</span>
                        <input 
                            type="text" 
                            name="whatsappContact" 
                            value={rawWhatsApp} 
                            onChange={(e) => handleWhatsAppChange(e.target.value)} 
                            placeholder="56912345678 o 912345678" 
                            maxLength={13}
                            className={`block w-full bg-white border ${errors.whatsapp ? 'border-red-400' : 'border-gray-300'} rounded-xl shadow-xs py-2.5 pl-8 pr-3 text-sm font-mono focus:ring-primary focus:border-primary`} 
                            required 
                        />
                    </div>
                    <p className="text-[11px] text-gray-500">
                        Los postulantes y sugerencias de la IA usarán este número para enviarte mensajes directos vía WhatsApp.
                    </p>

                    {errors.whatsapp && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.whatsapp}
                        </p>
                    )}
                </div>

                {/* CAMPOS DE AUTOR (Solo si hideAuthorFields es false) */}
                {!hideAuthorFields && (
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Autor (Nombre visible)</label>
                            <input 
                                type="text" 
                                name="author" 
                                value={formData.author} 
                                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))} 
                                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 text-sm focus:ring-primary focus:border-primary" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL de Avatar del Autor</label>
                            <input 
                                type="text" 
                                name="authorAvatarUrl" 
                                value={formData.authorAvatarUrl} 
                                onChange={(e) => setFormData(prev => ({ ...prev, authorAvatarUrl: e.target.value }))} 
                                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 text-sm focus:ring-primary focus:border-primary" 
                            />
                        </div>
                    </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                        {collaboration ? 'Guardar Cambios' : 'Publicar Colaboración Urgente'}
                    </button>
                </div>
            </form>

            {/* Modal de diálogo institucional según AGENTS.md */}
            <CiPressModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                {formContent}
            </div>
        );
    }

    return formContent;
};

export default ShortCollaborationForm;
