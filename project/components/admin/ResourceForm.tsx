import React, { useState, useEffect } from 'react';
import type { Resource } from '../../types';

interface ResourceFormProps {
    resource: Resource | null;
    onSave: (resource: Resource | Omit<Resource, 'id'>) => void;
    onClose: () => void;
}

const initialResourceState: Omit<Resource, 'id'> = {
    name: '',
    category: 'IA Generativa',
    description: '',
    link: '#',
    type: 'Herramienta',
};

const ResourceForm: React.FC<ResourceFormProps> = ({ resource, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialResourceState);

    useEffect(() => {
        if (resource) {
            setFormData(resource);
        } else {
            setFormData(initialResourceState);
        }
    }, [resource]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
                <h2 className="text-2xl font-bold mb-4">{resource ? 'Editar Recurso' : 'Añadir Nuevo Recurso'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Recurso</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>IA Generativa</option>
                                <option>Visualización</option>
                                <option>Fact-Checking</option>
                                <option>Productividad</option>
                                <option>Transcripción</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                             <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>Herramienta</option>
                                <option>Guía</option>
                                <option>Software</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
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

export default ResourceForm;
