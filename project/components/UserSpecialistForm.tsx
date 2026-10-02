import React, { useState } from 'react';
import type { Specialist } from '../types';

interface UserSpecialistFormProps {
    onSave: (specialist: Omit<Specialist, 'id' | 'dateAdded'>) => void;
    onClose: () => void;
}

const initialSpecialistState: Omit<Specialist, 'id' | 'dateAdded'> = {
    name: '',
    title: '',
    imageUrl: '',
    specialtyDescription: '',
    whatsappContact: '',
    textColor: '#FFFFFF',
};

const UserSpecialistForm: React.FC<UserSpecialistFormProps> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState(initialSpecialistState);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = () => {
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
                    setPreviewUrl(base64String);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col transform transition-all animate-scale-in" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-secondary/10 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black font-serif text-secondary">Registrar Fuente Experta</h2>
                        <p className="text-xs text-text-secondary mt-1 uppercase tracking-widest font-bold">Resalte ante la comunidad periodística</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">&times;</button>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto">
                    <form id="source-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        placeholder="Ej: Dr. Francisco Gómez"
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:outline-none transition-all" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Título, Cargo o Representación</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        placeholder="Ej: Especialista en Bioética"
                                        value={formData.title} 
                                        onChange={handleChange} 
                                        className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:outline-none transition-all" 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Avatar Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase text-gray-500 text-center">Foto de Perfil</label>
                                <div 
                                    onClick={handleImageUpload}
                                    className="relative w-32 h-32 mx-auto rounded-full border-4 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-secondary/30 group transition-all"
                                >
                                    {previewUrl || formData.imageUrl ? (
                                        <img src={previewUrl || formData.imageUrl} alt="Preview" className="w-full h-full rounded-full object-cover group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="text-center">
                                            <svg className="w-8 h-8 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-white font-black uppercase">Cambiar</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-gray-400 mt-2">Relación de aspecto 1:1 recomendada</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Descripción de la Especialidad</label>
                            <textarea 
                                name="specialtyDescription" 
                                value={formData.specialtyDescription} 
                                onChange={handleChange} 
                                rows={4} 
                                placeholder="Describa su trayectoria, temas de interés para entrevistas y disponibilidad..."
                                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:outline-none transition-all bg-gray-50" 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">WhatsApp (sin el +)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-bold">+</span>
                                    <input 
                                        type="text" 
                                        name="whatsappContact" 
                                        placeholder="56987654321" 
                                        value={formData.whatsappContact} 
                                        onChange={handleChange} 
                                        className="w-full py-3 px-4 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-secondary focus:outline-none" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Acomodación de Color Texto</label>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData(prev => ({ ...prev, textColor: '#FFFFFF' }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.textColor === '#FFFFFF' ? 'bg-white shadow-sm text-secondary' : 'text-gray-400'}`}
                                    >
                                        Texto Blanco
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData(prev => ({ ...prev, textColor: '#334155' }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.textColor === '#334155' ? 'bg-white shadow-sm text-secondary' : 'text-gray-400'}`}
                                    >
                                        Texto Oscuro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-3 text-text-secondary font-bold hover:text-text-primary transition-colors uppercase tracking-widest text-xs"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="source-form"
                        className="px-10 py-4 bg-secondary text-white font-black rounded-xl shadow-xl shadow-secondary/20 hover:bg-blue-900 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
                    >
                        Guardar Experto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSpecialistForm;
