import React, { useState, useEffect } from 'react';
import type { PhotojournalismPost } from '../../types';
import AIWritingAssistant from '../ai/AIWritingAssistant';

interface PhotojournalismFormProps {
    post: PhotojournalismPost | null;
    onSave: (post: PhotojournalismPost | Omit<PhotojournalismPost, 'id'>) => void;
    onClose: () => void;
}

const initialPostState: Omit<PhotojournalismPost, 'id' | 'dateAdded'> = {
    title: '',
    imageUrl: 'https://picsum.photos/seed/new-photo/800/450',
    caption: '',
    photographerName: '',
    photographerAvatarUrl: 'https://i.pravatar.cc/40',
    dateTaken: '',
    whatsappContact: '',
};

const PhotojournalismForm: React.FC<PhotojournalismFormProps> = ({ post, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialPostState);

    useEffect(() => {
        if (post) {
            setFormData(post);
        } else {
            setFormData(initialPostState);
        }
    }, [post]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
        onSave(formData as PhotojournalismPost | Omit<PhotojournalismPost, 'id'>);
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{post ? 'Editar Publicación' : 'Añadir Nueva Publicación'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Fotógrafo(a)</label>
                        <input type="text" name="photographerName" value={formData.photographerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                     <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Título de la Fotografía</label>
                            <AIWritingAssistant
                                currentText={formData.title}
                                context="title"
                                buttonLabel="Sugerir Título"
                                onApplyText={(newText) => setFormData(prev => ({ ...prev, title: newText }))}
                            />
                        </div>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
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
                        <label className="block text-sm font-medium text-gray-700">Foto-Noticia</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización de la foto-noticia" className="my-2 rounded max-h-40 object-contain bg-gray-100 border" />}
                        <div>
                            <label className="block text-xs font-medium text-gray-600">URL de la Imagen</label>
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
                        <textarea name="caption" value={formData.caption} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de la Fotografía</label>
                        <input type="text" name="dateTaken" placeholder="Ej: 15 de Julio, 2024" value={formData.dateTaken} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto de WhatsApp (sin +)</label>
                        <input type="text" name="whatsappContact" placeholder="Ej: 56987654321" value={formData.whatsappContact} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
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

export default PhotojournalismForm;