import React, { useState, useEffect } from 'react';
import type { ShortCollaboration } from '../../types';

interface ShortCollaborationFormProps {
    collaboration: ShortCollaboration | null;
    onSave: (collaboration: ShortCollaboration | Omit<ShortCollaboration, 'id'>) => void;
    onClose: () => void;
    isModal?: boolean;
    hideAuthorFields?: boolean;
}

// FIX: Add missing 'whatsappContact' property to resolve compilation error.
const initialCollaborationState: Omit<ShortCollaboration, 'id'> = {
    title: '',
    deadline: '',
    budget: '',
    author: '',
    authorAvatarUrl: 'https://i.pravatar.cc/40',
    whatsappContact: '',
};

const ShortCollaborationForm: React.FC<ShortCollaborationFormProps> = ({ collaboration, onSave, onClose, isModal = true, hideAuthorFields = false }) => {
    const [formData, setFormData] = useState(initialCollaborationState);

    useEffect(() => {
        if (collaboration) {
            setFormData({
                ...initialCollaborationState,
                ...collaboration
            });
        } else {
            setFormData(initialCollaborationState);
        }
    }, [collaboration]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const formContent = (
        <div className={`bg-white p-6 w-full ${isModal ? 'rounded-lg shadow-2xl max-w-lg max-h-full overflow-y-auto' : 'rounded-xl border border-gray-100 shadow-sm'}`}>
            <h2 className="text-2xl font-bold mb-4 text-text-primary">{collaboration ? 'Editar Colaboración' : 'Añadir Colaboración'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plazo</label>
                        <input type="text" name="deadline" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Presupuesto</label>
                        <input type="text" name="budget" value={formData.budget} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                    </div>
                </div>
                {!hideAuthorFields && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Autor (Nombre visible)</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL de Avatar del Autor</label>
                            <input type="text" name="authorAvatarUrl" value={formData.authorAvatarUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
                        </div>
                    </>
                )}
                {/* FIX: Add input field for 'whatsappContact'. */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contacto de WhatsApp (sin +)</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">+</span>
                        <input type="text" name="whatsappContact" value={formData.whatsappContact} onChange={handleChange} placeholder="Ej: 56912345678" className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-7 pr-3 focus:ring-primary focus:border-primary" required />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button type="submit" className="px-5 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-colors">Guardar Cambios</button>
                </div>
            </form>
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                {formContent}
            </div>
        );
    }

    return formContent;
};

export default ShortCollaborationForm;