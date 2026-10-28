import React, { useState, useEffect } from 'react';
import type { DestacadoArticle } from '../../types';
import ContentEditor from './ContentEditor';

interface DestacadoArticleFormProps {
    article: DestacadoArticle | null;
    onSave: (article: DestacadoArticle | Omit<DestacadoArticle, 'id'>) => void;
    onClose: () => void;
}

const initialArticleState: Omit<DestacadoArticle, 'id'> = {
    title: '',
    category: 'Industria',
    author: '',
    date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
    imageUrl: 'https://picsum.photos/seed/new-news/400/225',
    summary: '',
    reportContent: [],
};

const DestacadoArticleForm: React.FC<DestacadoArticleFormProps> = ({ article, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialArticleState);

    useEffect(() => {
        if (article) {
            setFormData({
                ...initialArticleState,
                ...article,
                reportContent: article.reportContent || [],
            });
        } else {
            setFormData(initialArticleState);
        }
    }, [article]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Función rescatada del MAIN (útil para subir fotos locales)
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
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{article ? 'Editar Artículo' : 'Añadir Nuevo Artículo'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Sección 1: Información Básica */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Información Básica</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Título</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Autor</label>
                                <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                                    <option>Industria</option>
                                    <option>Tecnología</option>
                                    <option>Legislación</option>
                                    <option>Tendencias</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Resumen</label>
                            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                        </div>

                        {/* Sección de Imagen mejorada (Fusión HEAD + MAIN) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Imagen Principal</label>
                            {formData.imageUrl && (
                                <img src={formData.imageUrl} alt="Previsualización" className="my-2 rounded max-h-40 object-contain bg-gray-100 border w-full" />
                            )}
                            <div>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="URL de la imagen (o subir archivo abajo)"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex items-center space-x-2 my-2">
                                <hr className="flex-grow border-gray-300" />
                                <span className="text-xs text-gray-500">O SUBIR DESDE EL EQUIPO</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>
                            <button
                                type="button"
                                onClick={handleImageUpload}
                                className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Buscar archivo...
                            </button>
                        </div>
                    </div>

                    {/* Sección 2: Editor de Contenido Rico */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Contenido Detallado del Artículo</h3>
                        <ContentEditor
                            content={formData.reportContent || []}
                            onChange={(newContent) => setFormData(prev => ({ ...prev, reportContent: newContent }))}
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

export default DestacadoArticleForm;