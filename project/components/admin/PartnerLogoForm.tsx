import React, { useState, useEffect } from 'react';
import type { PartnerLogo } from '../../types';

interface PartnerLogoFormProps {
    logo: PartnerLogo | null;
    onSave: (logo: PartnerLogo | Omit<PartnerLogo, 'id'>) => void;
    onClose: () => void;
}

const initialLogoState: Omit<PartnerLogo, 'id'> = {
    name: '',
    logoUrl: '',
    websiteUrl: '',
};

const PartnerLogoForm: React.FC<PartnerLogoFormProps> = ({ logo, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialLogoState);

    useEffect(() => {
        if (logo) {
            setFormData(logo);
        } else {
            setFormData(initialLogoState);
        }
    }, [logo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    setFormData(prev => ({ ...prev, logoUrl: base64String }));
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
                <h2 className="text-2xl font-bold mb-4">{logo ? 'Editar Logo de Socio' : 'Añadir Nuevo Logo de Socio'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Socio</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Sitio Web del Socio (URL)</label>
                        <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://www.ejemplo.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                        {formData.logoUrl && <img src={formData.logoUrl} alt="Previsualización" className="my-2 rounded max-h-24 object-contain bg-gray-100 border p-2" />}
                        <div>
                            <label className="block text-xs font-medium text-gray-600">URL del Logo</label>
                            <input 
                                type="text" 
                                name="logoUrl"
                                placeholder="Pegar URL de la imagen" 
                                value={formData.logoUrl} 
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
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartnerLogoForm;