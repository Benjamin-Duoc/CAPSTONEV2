import React, { useState, useEffect } from 'react';
import type { PressRelease } from '../../types';
import ContentEditor from './ContentEditor';

interface PressReleaseFormProps {
    pressRelease: PressRelease | null;
    onSave: (pressRelease: PressRelease | Omit<PressRelease, 'id'>) => void;
    onClose: () => void;
    isModal?: boolean;
    isLimitReached?: boolean;
}

const initialPressReleaseState: Omit<PressRelease, 'id'> = {
    title: '',
    institution: '',
    author: '',
    date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
    imageUrl: 'https://picsum.photos/seed/new-pr/400/225',
    summary: '',
    reportContent: [],
    reportAuthor: '',
    reportDate: '',
};

const PressReleaseForm: React.FC<PressReleaseFormProps> = ({ pressRelease, onSave, onClose, isModal = true, isLimitReached = false }) => {
    const [formData, setFormData] = useState<Omit<PressRelease, 'id'> | PressRelease>(initialPressReleaseState);

    useEffect(() => {
        if (pressRelease) {
            setFormData({
                ...initialPressReleaseState,
                ...pressRelease,
                reportContent: pressRelease.reportContent || [],
                reportAuthor: pressRelease.reportAuthor || '',
                reportDate: pressRelease.reportDate || '',
            });
        } else {
            setFormData(initialPressReleaseState);
        }
    }, [pressRelease]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMainImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const base64String = readerEvent.target?.result as string;
                    setFormData(prev => ({ ...prev, imageUrl: base64String }));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as PressRelease | Omit<PressRelease, 'id'>);
    };

    const formContent = (
        <div className={`bg-white rounded-lg shadow-2xl p-6 w-full ${isModal ? 'max-w-2xl max-h-[90vh] overflow-y-auto' : 'max-w-4xl'}`}>
            <h2 className="text-2xl font-bold mb-4 font-serif text-primary">{pressRelease ? 'Editar Comunicado' : 'Añadir Nuevo Comunicado'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Información Básica</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Institución</label>
                        <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                    </div>

                    {/* Campo de Autor Principal (Contacto) */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Autor / Contacto</label>
                        <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Resumen</label>
                        <textarea name="summary" value={formData.summary} onChange={handleChange} maxLength={100} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                        <p className="text-xs text-gray-500 mt-1">{formData.summary?.length || 0}/100 caracteres</p>
                    </div>

                    <div className="mt-4 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Imagen Principal</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización" className="my-2 rounded max-h-40 object-contain bg-gray-200 border" />}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
                            <input
                                type="text"
                                name="imageUrl"
                                placeholder="Pegar URL de la imagen"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <hr className="flex-grow border-gray-300" />
                            <span className="text-sm text-gray-500">o</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <button
                            type="button"
                            onClick={handleMainImageUpload}
                            className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Buscar archivo en el equipo...
                        </button>
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-6 text-gray-700">Cuerpo del Comunicado</h3>

                    {/* Editor Rico (Integración del HEAD) */}
                    <ContentEditor
                        content={formData.reportContent || []}
                        onChange={(newContent) => setFormData(prev => ({ ...prev, reportContent: newContent }))}
                    />
                </div>

                <div className="flex justify-end items-center space-x-4 pt-4">
                    {isLimitReached && !pressRelease && (
                        <div className="flex-1 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center">
                            <span>🚫 Límite diario alcanzado (3/3). Pásate a Premium para publicar sin límites.</span>
                        </div>
                    )}
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button 
                        type="submit" 
                        disabled={isLimitReached && !pressRelease}
                        className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-colors ${
                            (isLimitReached && !pressRelease) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-primary hover:bg-orange-600'
                        }`}
                    >
                        {pressRelease ? 'Guardar Cambios' : 'Subir Comunicado'}
                    </button>
                </div>
            </form>
        </div>
    );

    if (!isModal) return formContent;

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            {formContent}
        </div>
    );
};

export default PressReleaseForm;