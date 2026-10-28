import React, { useState, useEffect, useRef } from 'react';
import type { Entrepreneurship } from '../../types';
import { ENV } from '../../src/config/env';

interface EntrepreneurFormProps {
    entrepreneur: Entrepreneurship | null;
    onSave: (entrepreneur: Entrepreneurship | Omit<Entrepreneurship, 'id'>) => void;
    onClose: () => void;
}

const initialEntrepreneurState: Omit<Entrepreneurship, 'id'> = {
    name: '',
    type: 'Agencia',
    founder: '',
    location: '',
    specialty: 'Investigación',
    imageUrl: '',
    description: '',
    portfolioUrl: '',
    rating: 5,
    reviewCount: 0
};

const EntrepreneurForm: React.FC<EntrepreneurFormProps> = ({ entrepreneur, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Entrepreneurship, 'id'> | Entrepreneurship>(initialEntrepreneurState);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (entrepreneur) {
            setFormData(entrepreneur);
        } else {
            setFormData(initialEntrepreneurState);
        }
    }, [entrepreneur]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: string | number = value;
        if (type === 'number') {
            parsedValue = value === '' ? 0 : Number(value);
        }

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleImageUploadAsync = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'images/entrepreneurships');

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
                // The backend returns a path like '/backendcipress/media/...'.
                // Both the Vite proxy (dev) and the web server (prod) resolve this correctly.
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
        onSave(formData as Entrepreneurship | Omit<Entrepreneurship, 'id'>);
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
                    {entrepreneur ? 'Editar Emprendimiento Periodístico' : 'Añadir Nuevo Emprendimiento'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">1</span>
                            Información Principal
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Emprendimiento</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Ej: Redacción de Artículos SEO" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fundador(a) / Agencia</label>
                                <input type="text" name="founder" value={formData.founder} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Ej: Equipo Central" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Ej: Santiago o Remoto" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Micromedio">Micromedio</option>
                                    <option value="Agencia">Agencia</option>
                                    <option value="Productora">Productora</option>
                                    <option value="Corrección">Corrección</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                                <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Investigación">Investigación</option>
                                    <option value="Cultura">Cultura</option>
                                    <option value="Deportes">Deportes</option>
                                    <option value="Local">Local</option>
                                    <option value="Redacción">Redacción</option>
                                    <option value="Edición">Edición</option>
                                    <option value="Fotografía">Fotografía</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required placeholder="Descripción de los servicios ofrecidos..." />
                        </div>
                    </div>

                    {/* Metadata & Portfolio */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mr-2">2</span>
                            Portafolio y Calificaciones
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace a Portafolio o Web</label>
                            <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" placeholder="https://..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Calificación Promedio (1-5)</label>
                                <input type="number" step="0.1" min="1" max="5" name="rating" value={formData.rating} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Reseñas</label>
                                <input type="number" step="1" min="0" name="reviewCount" value={formData.reviewCount} onChange={handleChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm mr-2">3</span>
                            Medios
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
                        <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50">Guardar Emprendimiento</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntrepreneurForm;