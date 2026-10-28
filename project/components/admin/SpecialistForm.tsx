import React, { useState, useEffect } from 'react';
import type { Specialist } from '../../types';

interface SpecialistFormProps {
    specialist: Specialist | null;
    onSave: (specialist: Specialist | Omit<Specialist, 'id' | 'dateAdded'>) => void;
    onClose: () => void;
}

const initialSpecialistState: Omit<Specialist, 'id' | 'dateAdded'> = {
    name: '',
    title: '',
    imageUrl: 'https://picsum.photos/seed/new-spec/400/400',
    specialtyDescription: '',
    whatsappContact: '',
    textColor: '#FFFFFF',
};

const SpecialistForm: React.FC<SpecialistFormProps> = ({ specialist, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialSpecialistState);

    useEffect(() => {
        if (specialist) {
            setFormData(specialist);
        } else {
            setFormData(initialSpecialistState);
        }
    }, [specialist]);

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
                <h2 className="text-2xl font-bold mb-4">{specialist ? 'Editar Especialista' : 'Añadir Nuevo Especialista'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Título / Cargo</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción de la Especialidad</label>
                        <textarea name="specialtyDescription" value={formData.specialtyDescription} onChange={handleChange} maxLength={130} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        <p className="text-xs text-gray-500 mt-1">{formData.specialtyDescription?.length || 0}/130 caracteres</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto de WhatsApp (sin +)</label>
                        <input type="text" name="whatsappContact" placeholder="Ej: 56987654321" value={formData.whatsappContact} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                     <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Imagen de Perfil</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización de imagen" className="my-2 rounded-full h-24 w-24 object-cover bg-gray-100 border" />}
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
                            onClick={handleImageUpload} 
                            className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Buscar archivo en el equipo...
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color del Texto Sobre la Foto</label>
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
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SpecialistForm;