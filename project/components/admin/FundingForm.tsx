import React, { useState, useEffect } from 'react';
import type { FundingOpportunity } from '../../types';

interface FundingFormProps {
    fundingOpportunity: FundingOpportunity | null;
    onSave: (funding: FundingOpportunity | Omit<FundingOpportunity, 'id'>) => void;
    onClose: () => void;
}

const initialFundingState: Omit<FundingOpportunity, 'id'> = {
    title: '',
    organization: '',
    deadline: '',
    type: 'Fondo',
    link: '#',
};

const FundingForm: React.FC<FundingFormProps> = ({ fundingOpportunity, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialFundingState);

    useEffect(() => {
        if (fundingOpportunity) {
            setFormData(fundingOpportunity);
        } else {
            setFormData(initialFundingState);
        }
    }, [fundingOpportunity]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{fundingOpportunity ? 'Editar Oportunidad' : 'Añadir Oportunidad'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organización</label>
                        <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha Límite</label>
                            <input type="text" name="deadline" placeholder="Ej: 31 de Agosto, 2024" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>Fondo</option>
                                <option>Beca</option>
                                <option>Premio</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Enlace (URL)</label>
                        <input type="text" name="link" value={formData.link} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
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

export default FundingForm;
