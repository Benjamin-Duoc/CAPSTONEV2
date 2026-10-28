import React, { useState, useEffect, useRef } from 'react';
import type { FreelanceService } from '../../types';
import { ENV } from '../../src/config/env';

interface FreelanceServiceFormProps {
    freelanceService: FreelanceService | null;
    onSave: (service: FreelanceService | Omit<FreelanceService, 'id'>) => void;
    onClose: () => void;
}

const initialServiceState: Omit<FreelanceService, 'id'> = {
    service: '',
    provider: '',
    category: 'Redacción',
    imageUrl: '',
    description: '',
    linkedinUrl: ''
};

const FreelanceServiceForm: React.FC<FreelanceServiceFormProps> = ({ freelanceService, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<FreelanceService, 'id'> | FreelanceService>(initialServiceState);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (freelanceService) {
            setFormData(freelanceService);
        } else {
            setFormData(initialServiceState);
        }
    }, [freelanceService]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUploadAsync = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'images/freelance-services');

        const API_BASE = ENV.isDevelopment ? '/api' : ENV.apiUrl;

        try {
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: uploadData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            if (data.success && data.url) {
                const fullUrl = data.url;
                setFormData(prev => ({ ...prev, imageUrl: fullUrl }));
            } else {
                alert('No se pudo subir la imagen: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al conectar con el servidor para la subida.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleMainImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as FreelanceService | Omit<FreelanceService, 'id'>);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative my-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                    {freelanceService ? 'Editar Servicio Freelance' : 'Añadir Nuevo Servicio Freelance'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">1</span>
                            Información Principal
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor (Tu Nombre)</label>
                                <input type="text" name="provider" value={formData.provider} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Ej: Juan Pérez" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Servicio</label>
                                <input type="text" name="service" value={formData.service} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Ej: Redactor SEO Especializado" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                                <option value="Redacción">Redacción</option>
                                <option value="Corrección">Corrección</option>
                                <option value="Fotografía">Fotografía</option>
                                <option value="Community Management">Community Management</option>
                                <option value="Locución">Locución</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Cuenta brevemente tu experiencia y lo que ofreces..." />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mr-2">2</span>
                            Enlace y Contacto
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace a Perfil de LinkedIn</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    https://
                                </span>
                                <input type="text" name="linkedinUrl" value={formData.linkedinUrl?.replace('https://', '')} onChange={(e) => handleChange({ target: { name: 'linkedinUrl', value: `https://${e.target.value}` } } as any)} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300" placeholder="linkedin.com/in/tu-perfil" />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm mr-2">3</span>
                            Foto de Perfil o Imagen
                        </h3>
                        <div className="space-y-4">
                            {formData.imageUrl && (
                                <div className="rounded-md border p-2 bg-white flex justify-center">
                                    <img src={formData.imageUrl} alt="Previsualización" className="max-h-48 object-contain rounded" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen (Automático o manual)</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    placeholder="Pegar URL de la imagen si es externa"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <hr className="flex-grow border-gray-300" />
                                <span className="text-xs uppercase font-medium">o subir archivo</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUploadAsync}
                            />

                            <button
                                type="button"
                                onClick={handleMainImageUploadClick}
                                disabled={isUploading}
                                className={`w-full flex justify-center items-center px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <span className="flex items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Subiendo...</span>
                                ) : (
                                    <span className="flex items-center"><svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Seleccionar archivo desde el equipo...</span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t font-sans">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
                        <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50">Guardar Servicio Freelance</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FreelanceServiceForm;
