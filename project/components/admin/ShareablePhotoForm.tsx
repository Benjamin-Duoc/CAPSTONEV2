import React, { useState, useEffect } from 'react';
import type { ShareablePhoto } from '../../types';
import AIWritingAssistant from '../ai/AIWritingAssistant';

interface ShareablePhotoFormProps {
    photo: ShareablePhoto | null;
    onSave: (photo: ShareablePhoto | Omit<ShareablePhoto, 'id' | 'dateAdded'>) => void;
    onClose: () => void;
}

const initialPhotoState: Omit<ShareablePhoto, 'id' | 'dateAdded'> = {
    imageUrl: 'https://picsum.photos/seed/new-gallery/600/400',
    caption: '',
    photographerName: '',
    photographerAvatarUrl: 'https://i.pravatar.cc/40',
    whatsappContact: '',
    keywords: [],
    textColor: '#FFFFFF',
};

const ShareablePhotoForm: React.FC<ShareablePhotoFormProps> = ({ photo, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialPhotoState);
    const [keywordsInput, setKeywordsInput] = useState('');

    useEffect(() => {
        if (photo) {
            setFormData(photo);
            setKeywordsInput(photo.keywords.join(', '));
        } else {
            setFormData(initialPhotoState);
            setKeywordsInput('');
        }
    }, [photo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeywordsInput(e.target.value);
        const keywordsArray = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
        setFormData(prev => ({...prev, keywords: keywordsArray}));
    }

    const handleImageUpload = (field: 'imageUrl' | 'photographerAvatarUrl') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const base64String = readerEvent.target?.result as string;
                    setFormData(prev => ({ ...prev, [field]: base64String }));
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
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{photo ? 'Editar Foto' : 'Añadir Nueva Foto'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Fotógrafo(a)</label>
                        <input type="text" name="photographerName" value={formData.photographerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Avatar del Fotógrafo(a)</label>
                        {formData.photographerAvatarUrl && <img src={formData.photographerAvatarUrl} alt="Previsualización del avatar" className="my-2 rounded-full h-24 w-24 object-cover bg-gray-100 border" />}
                        <div>
                            <label className="block text-xs font-medium text-gray-600">URL del Avatar</label>
                            <input 
                                type="text" 
                                name="photographerAvatarUrl"
                                placeholder="Pegar URL de la imagen" 
                                value={formData.photographerAvatarUrl} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" 
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <hr className="flex-grow border-gray-300" />
                            <span className="text-sm text-gray-500">o</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => handleImageUpload('photographerAvatarUrl')} 
                            className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Buscar archivo en el equipo...
                        </button>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Foto para la Galería</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización de la foto" className="my-2 rounded max-h-40 object-contain bg-gray-100 border" />}
                        <div>
                            <label className="block text-xs font-medium text-gray-600">URL de la Foto</label>
                            <input 
                                type="text" 
                                name="imageUrl"
                                placeholder="Pegar URL de la imagen" 
                                value={formData.imageUrl} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" 
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <hr className="flex-grow border-gray-300" />
                            <span className="text-sm text-gray-500">o</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => handleImageUpload('imageUrl')} 
                            className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Buscar archivo en el equipo...
                        </button>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Descripción (Caption)</label>
                            <AIWritingAssistant
                                currentText={formData.caption}
                                context="caption"
                                buttonLabel="Asistir Epígrafe"
                                onApplyText={(newText) => setFormData(prev => ({ ...prev, caption: newText }))}
                            />
                        </div>
                        <textarea name="caption" value={formData.caption} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Palabras Clave (separadas por coma)</label>
                        <input type="text" name="keywords" value={keywordsInput} onChange={handleKeywordsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto de WhatsApp (sin +)</label>
                        <input type="text" name="whatsappContact" placeholder="Ej: 56987654321" value={formData.whatsappContact} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color del Texto del Fotógrafo</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input 
                                type="color" 
                                name="textColor" 
                                value={formData.textColor} 
                                onChange={handleChange} 
                                className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer" 
                            />
                            <input
                                type="text"
                                name="textColor"
                                value={formData.textColor}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareablePhotoForm;