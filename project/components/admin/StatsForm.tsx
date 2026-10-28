import React, { useState, useEffect } from 'react';
import type { SiteStat } from '../../types';

interface StatsFormProps {
    stat: SiteStat | null;
    onSave: (stat: SiteStat) => void;
    onClose: () => void;
}

const StatsForm: React.FC<StatsFormProps> = ({ stat, onSave, onClose }) => {
    const [formData, setFormData] = useState<SiteStat | null>(stat);

    useEffect(() => {
        setFormData(stat);
    }, [stat]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { 
            ...prev, 
            [name]: name === 'endValue' ? parseInt(value, 10) || 0 : value 
        } : null);
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
                <h2 className="text-2xl font-bold mb-4">Editar Estadística: {formData.id}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Etiqueta (Label)</label>
                        <input 
                            type="text" 
                            name="label" 
                            value={formData.label} 
                            onChange={handleChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100" 
                            readOnly
                        />
                         <p className="mt-1 text-xs text-gray-500">La etiqueta no se puede editar.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor</label>
                        <input 
                            type="number" 
                            name="endValue" 
                            value={formData.endValue} 
                            onChange={handleChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prefijo (opcional)</label>
                        <input 
                            type="text" 
                            name="prefix" 
                            value={formData.prefix || ''} 
                            onChange={handleChange} 
                            placeholder="Ej: + de"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" 
                        />
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

export default StatsForm;
