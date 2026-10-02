import React, { useState, useEffect } from 'react';
import type { PressRelease } from '../types';
import ContentEditor from './admin/ContentEditor';

interface UserPressReleaseFormProps {
    onSave: (pressRelease: Omit<PressRelease, 'id'>) => void;
    onClose: () => void;
    isLimitReached?: boolean;
}

const initialPressReleaseState: Omit<PressRelease, 'id'> = {
    title: '',
    institution: '',
    author: '',
    date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
    imageUrl: '',
    summary: '',
    reportContent: [],
    reportAuthor: '',
    reportDate: new Date().toISOString().split('T')[0],
};

const UserPressReleaseForm: React.FC<UserPressReleaseFormProps> = ({ onSave, onClose, isLimitReached = false }) => {
    const [formData, setFormData] = useState<Omit<PressRelease, 'id'>>(initialPressReleaseState);
    const [step, setStep] = useState(1); // 1: Info, 2: Content
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (formData.imageUrl) {
            setPreviewUrl(formData.imageUrl);
        }
    }, [formData.imageUrl]);

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
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-up max-w-5xl mx-auto border border-gray-100">
            {/* Header / Progress */}
            <div className="bg-primary/5 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black font-serif text-primary">Redactar Comunicado</h2>
                    <p className="text-sm text-text-secondary mt-1">Comparte tus noticias con el mundo periodístico.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                {step === 1 ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Title & Basics */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black uppercase text-text-primary mb-2">Título del Comunicado</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        placeholder="Ej: Lanzamiento de nueva tecnología X"
                                        value={formData.title} 
                                        onChange={handleChange} 
                                        className="w-full text-xl font-bold py-3 px-4 border-b-4 border-gray-100 focus:border-primary focus:outline-none transition-colors placeholder:text-gray-300" 
                                        required 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black uppercase text-text-primary mb-2">Institución</label>
                                        <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase text-text-primary mb-2">Autor / Contacto</label>
                                        <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-black uppercase text-text-primary mb-2">Breve Resumen (máx 130 carac.)</label>
                                    <textarea 
                                        name="summary" 
                                        value={formData.summary} 
                                        onChange={handleChange} 
                                        maxLength={130} 
                                        rows={3} 
                                        className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50 italic" 
                                        placeholder="Un resumen impactante para captar la atención..."
                                        required 
                                    />
                                    <div className="flex justify-between mt-1 px-1">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{formData.summary.length}/130</span>
                                        <span className="text-xs text-primary font-bold">Resumen de Home</span>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Area */}
                            <div className="space-y-4">
                                <label className="block text-sm font-black uppercase text-text-primary">Imagen de Portada</label>
                                <div 
                                    onClick={handleImageUpload}
                                    className="group relative cursor-pointer aspect-video rounded-3xl border-4 border-dashed border-gray-100 hover:border-primary/30 bg-gray-50 flex flex-col items-center justify-center transition-all overflow-hidden"
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white font-bold bg-primary/80 px-4 py-2 rounded-lg">Cambiar Imagen</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-text-secondary font-bold">Haz clic o arrastra una imagen</p>
                                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">JPG, PNG (Máx 2MB)</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-orange-800 leading-normal">
                                        <strong>Tip:</strong> Recomendamos imágenes horizontales de alta resolución (1200x800px) para que tu noticia luzca profesional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-8">
                            <button 
                                type="button" 
                                onClick={() => setStep(2)}
                                className="px-8 py-3 bg-secondary text-white font-black rounded-xl hover:bg-blue-900 transition-all shadow-lg flex items-center space-x-2"
                            >
                                <span>SIGUIENTE: CUERPO DEL COMUNICADO</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-inner bg-background p-6">
                            <h3 className="block text-sm font-black uppercase text-text-primary mb-6 flex items-center">
                                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 text-xs">2</span>
                                Redacción Detallada
                            </h3>
                            <ContentEditor 
                                content={formData.reportContent || []}
                                onChange={(newContent) => setFormData(prev => ({ ...prev, reportContent: newContent }))}
                            />
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                             <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                className="px-6 py-3 text-text-secondary font-bold hover:text-text-primary transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>VOLVER A INFO BÁSICA</span>
                            </button>

                            <div className="flex items-center space-x-4">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isLimitReached}
                                    className={`px-10 py-4 text-white font-black rounded-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                                        isLimitReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600'
                                    }`}
                                >
                                    ¡PUBLICAR AHORA!
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default UserPressReleaseForm;
