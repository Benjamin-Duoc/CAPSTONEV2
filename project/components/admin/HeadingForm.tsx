import React, { useState, useEffect } from 'react';
import type { HeroHeading } from '../../types';
import { uploadImage } from '../../utils/db';

interface HeadingFormProps {
    currentHeading: HeroHeading;
    onSave: (heading: HeroHeading) => void;
    onClose: () => void;
}

const HeadingForm: React.FC<HeadingFormProps> = ({ currentHeading, onSave, onClose }) => {
    const [formData, setFormData] = useState<HeroHeading>(currentHeading);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setFormData(currentHeading);
    }, [currentHeading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const res = await uploadImage(file, 'images/hero');
                if (res.success && res.url) {
                    setFormData(prev => ({ ...prev, imageUrl: res.url }));
                } else {
                    alert(res.message || 'Error al subir la imagen');
                }
            } catch (err) {
                console.error("Upload failed", err);
                alert("Error al conectar con el servidor de subida");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure we only send valid fields matching the backend model
        const dataToSave: HeroHeading = {
            id: formData.id || 1,
            mainText: formData.mainText,
            highlightedText: formData.highlightedText,
            featuredTitle: formData.featuredTitle,
            featuredDescription: formData.featuredDescription,
            featuredLabel: formData.featuredLabel || 'DESTACADO',
            textColor: formData.textColor,
            imageUrl: formData.imageUrl
        };

        onSave(dataToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4 font-sans text-text-primary">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-text-primary">Editar Título Principal</h2>
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Texto Principal */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Texto Principal</label>
                        <input
                            type="text"
                            name="mainText"
                            value={formData.mainText || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ej: Periodistas que"
                            required
                        />
                    </div>

                    {/* Texto Destacado */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Texto Destacado</label>
                        <input
                            type="text"
                            name="highlightedText"
                            value={formData.highlightedText || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ej: emprenden"
                            required
                        />
                    </div>

                    {/* Subtítulo (Opcional) -> featuredTitle */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo (opcional)</label>
                        <input
                            type="text"
                            name="featuredTitle"
                            value={formData.featuredTitle || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ej: La Pública"
                        />
                    </div>

                    {/* Etiqueta del Emprendimiento Destacado -> featuredDescription */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Etiqueta del Emprendimiento Destacado</label>
                        <input
                            type="text"
                            name="featuredDescription"
                            value={formData.featuredDescription || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Ej: Medio digital enfocado en investigación..."
                            required
                        />
                    </div>

                    {/* Imagen Hero */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Imagen de Fondo (Hero)</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl || ''}
                                onChange={handleChange}
                                className="flex-1 border border-gray-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                                placeholder="URL de la imagen..."
                            />
                            <label className={`cursor-pointer px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center justify-center whitespace-nowrap ${isUploading ? 'bg-gray-400' : 'bg-secondary hover:bg-blue-700'}`}>
                                {isUploading ? '...' : 'Subir imagen'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={isUploading} />
                            </label>
                        </div>
                    </div>

                    {/* Color del Texto */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Color del Texto Sobre la Foto</label>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded border border-gray-300 overflow-hidden relative">
                                <input
                                    type="color"
                                    name="textColor"
                                    value={formData.textColor || '#FFFFFF'}
                                    onChange={handleChange}
                                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                name="textColor"
                                value={formData.textColor || '#FFFFFF'}
                                onChange={handleChange}
                                placeholder="#FFFFFF"
                                className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:bg-orange-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HeadingForm;