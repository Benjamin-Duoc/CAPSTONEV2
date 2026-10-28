import React, { useState, useEffect } from 'react';
import type { SpecialAd } from '../../types';

interface SpecialAdFormProps {
    ad: SpecialAd | null;
    onSave: (ad: SpecialAd) => void;
    onClose: () => void;
}

const SpecialAdForm: React.FC<SpecialAdFormProps> = ({ ad, onSave, onClose }) => {
    const [formData, setFormData] = useState<SpecialAd | null>(ad);

    useEffect(() => {
        setFormData(ad);
    }, [ad]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Editar Anuncio Especial: {formData.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} maxLength={80} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        <p className="text-xs text-gray-500 mt-1">{formData.description?.length || 0}/80 caracteres</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Texto del Botón (CTA)</label>
                        <input type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
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

export default SpecialAdForm;