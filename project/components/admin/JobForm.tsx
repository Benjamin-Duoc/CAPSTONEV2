import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';

interface JobFormProps {
    job: Job | null;
    onSave: (job: Job | Omit<Job, 'id'>) => void;
    onClose: () => void;
}

const initialJobState: Omit<Job, 'id'> = {
    title: '',
    company: '',
    location: '',
    type: 'Completo',
    area: 'Prensa',
    date: 'Ahora',
    logoUrl: 'https://picsum.photos/seed/newjob/100/100',
    description: '',
    applyEmail: '',
};

const JobForm: React.FC<JobFormProps> = ({ job, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialJobState);

    useEffect(() => {
        if (job) {
            setFormData(job);
        } else {
            setFormData(initialJobState);
        }
    }, [job]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
                <h2 className="text-2xl font-bold mb-4">{job ? 'Editar Oportunidad' : 'Añadir Nueva Oportunidad'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título del Cargo</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Empresa</label>
                        <input type="text" name="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción del Cargo</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email para Postulaciones</label>
                        <input type="email" name="applyEmail" value={formData.applyEmail} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Contrato</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                                <option>Completo</option>
                                <option>Parcial</option>
                                <option>Freelance</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Área</label>
                        <select name="area" value={formData.area} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                            <option>Prensa</option>
                            <option>TV</option>
                            <option>Radio</option>
                            <option>Digital</option>
                        </select>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Logo de la Empresa</label>
                        {formData.logoUrl && <img src={formData.logoUrl} alt="Previsualización del logo" className="my-2 rounded-full h-24 w-24 object-cover bg-gray-100 border" />}
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

export default JobForm;