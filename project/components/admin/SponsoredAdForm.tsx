import React, { useState, useEffect } from 'react';
import type { SponsoredAd } from '../../types';

interface SponsoredAdFormProps {
    ad: SponsoredAd | null;
    onSave: (ad: SponsoredAd | Omit<SponsoredAd, 'id'>) => void;
    onClose: () => void;
}

const initialAdState: Omit<SponsoredAd, 'id'> = {
    imageUrl: 'https://picsum.photos/seed/new-ad/300/200',
    title: '',
    advertiser: '',
    ctaText: '',
    ctaLink: '#',
};

const SponsoredAdForm: React.FC<SponsoredAdFormProps> = ({ ad, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialAdState);

    useEffect(() => {
        if (ad) {
            setFormData(ad);
        } else {
            setFormData(initialAdState);
        }
    }, [ad]);

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
                <h2 className="text-2xl font-bold mb-4">{ad ? 'Editar Anuncio' : 'Añadir Nuevo Anuncio'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título del Anuncio</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Anunciante</label>
                        <input type="text" name="advertiser" value={formData.advertiser} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Texto del Botón (CTA)</label>
                            <input type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enlace del Botón (CTA Link)</label>
                            <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Imagen del Anuncio</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización" className="my-2 rounded max-h-40 object-contain bg-gray-100 border" />}
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
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SponsoredAdForm;