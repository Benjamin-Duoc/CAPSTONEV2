import React, { useState, useEffect } from 'react';
import type { PremiumSponsor, ReportContentItem } from '../../types';

interface SponsorFormProps {
    sponsor: PremiumSponsor | null;
    onSave: (sponsor: PremiumSponsor | Omit<PremiumSponsor, 'id'>) => void;
    onClose: () => void;
}

const initialSponsorState: Omit<PremiumSponsor, 'id'> = {
    name: '',
    tagline: '',
    imageUrl: 'https://picsum.photos/seed/new-sponsor/500/300',
    ctaText: '',
    ctaLink: '#',
    nameColor: '#FFFFFF',
    ctaColor: '#FBBF24',
    reportContent: [],
    reportAuthor: '',
    reportDate: '',
};

const SponsorForm: React.FC<SponsorFormProps> = ({ sponsor, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<PremiumSponsor, 'id'> | PremiumSponsor>(initialSponsorState);
    const [bulkText, setBulkText] = useState('');

    useEffect(() => {
        if (sponsor) {
            setFormData({
                ...initialSponsorState,
                ...sponsor,
                reportContent: sponsor.reportContent || [],
                reportAuthor: sponsor.reportAuthor || '',
                reportDate: sponsor.reportDate || '',
            });
        } else {
            setFormData(initialSponsorState);
        }
    }, [sponsor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMainImageUpload = () => {
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

    const handleReportContentChange = (index: number, field: string, value: string) => {
        const newContent = [...(formData.reportContent || [])];
        const updatedItem = { ...newContent[index], [field]: value };
        newContent[index] = updatedItem as ReportContentItem;
        setFormData(prev => ({ ...prev, reportContent: newContent }));
    };

    const handleImageUpload = (index: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const base64String = readerEvent.target?.result as string;
                    handleReportContentChange(index, 'src', base64String);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleAddItem = (type: 'image' | 'quote') => {
        let newItem: ReportContentItem;
        if (type === 'image') {
            newItem = { type: 'image', src: 'https://picsum.photos/seed/new-image/800/500', alt: '' };
        } else { // quote
            newItem = { type: 'quote', text: '', author: '' };
        }
        setFormData(prev => ({ ...prev, reportContent: [...(prev.reportContent || []), newItem] }));
    };

    const handleDeleteItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            reportContent: (prev.reportContent || []).filter((_, i) => i !== index),
        }));
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const newContent = [...(formData.reportContent || [])];
        if (direction === 'up' && index > 0) {
            [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
        }
        if (direction === 'down' && index < newContent.length - 1) {
            [newContent[index + 1], newContent[index]] = [newContent[index], newContent[index + 1]];
        }
        setFormData(prev => ({ ...prev, reportContent: newContent }));
    };

    const handleAddBulkParagraphs = () => {
        if (!bulkText.trim()) return;

        const paragraphs = bulkText.split(/\n+/).filter(p => p.trim() !== '');
        const newItems: ReportContentItem[] = paragraphs.map(p => ({ type: 'paragraph', text: p }));

        setFormData(prev => ({
            ...prev,
            reportContent: [...(prev.reportContent || []), ...newItems]
        }));
        setBulkText('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as PremiumSponsor | Omit<PremiumSponsor, 'id'>);
    };

    const renderReportItem = (item: ReportContentItem, index: number) => {
        const commonControls = (
            <div className="flex items-center space-x-2 mt-2">
                <button type="button" onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className="text-xs px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">↑ Subir</button>
                <button type="button" onClick={() => handleMoveItem(index, 'down')} disabled={index === (formData.reportContent?.length ?? 0) - 1} className="text-xs px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">↓ Bajar</button>
                <button type="button" onClick={() => handleDeleteItem(index)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Eliminar</button>
            </div>
        );

        switch (item.type) {
            case 'paragraph':
                return (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                        <label className="block text-xs font-medium text-gray-500">Párrafo #{index + 1}</label>
                        <p className="mt-1 block w-full border border-gray-200 rounded-md bg-white py-2 px-3 text-sm text-gray-800 whitespace-pre-wrap">{item.text}</p>
                        {commonControls}
                    </div>
                );
            case 'image':
                return (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                        <label className="block text-xs font-medium text-gray-500">Imagen</label>
                        <img src={item.src} alt={item.alt} className="my-2 rounded max-h-40 object-contain bg-gray-200" />
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
                                <input type="text" placeholder="Pegar URL de la imagen" value={item.src} onChange={(e) => handleReportContentChange(index, 'src', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <hr className="flex-grow border-gray-300" />
                                <span className="text-sm text-gray-500">o</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>
                            <button type="button" onClick={() => handleImageUpload(index)} className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                Buscar archivo en el equipo...
                            </button>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mt-2">Texto alternativo (alt)</label>
                                <input type="text" placeholder="Descripción de la imagen" value={item.alt} onChange={(e) => handleReportContentChange(index, 'alt', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                        </div>
                        {commonControls}
                    </div>
                );
            case 'quote':
                return (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                        <label className="block text-xs font-medium text-gray-500">Cita</label>
                        <textarea value={item.text} onChange={(e) => handleReportContentChange(index, 'text', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" rows={3} placeholder="Texto de la cita" />
                        <input type="text" placeholder="Autor (opcional)" value={item.author || ''} onChange={(e) => handleReportContentChange(index, 'author', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        {commonControls}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{sponsor ? 'Editar Sponsor' : 'Añadir Nuevo Sponsor'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Información Básica</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Slogan (Tagline)</label>
                            <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Texto del Botón (CTA Text)</label>
                            <input type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Enlace del Botón (CTA Link)</label>
                            <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div className="mt-4 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Imagen Principal</label>
                            {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización de la imagen principal" className="my-2 rounded max-h-40 object-contain bg-gray-200 border" />}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    placeholder="Pegar URL de la imagen"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <hr className="flex-grow border-gray-300" />
                                <span className="text-sm text-gray-500">o</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>
                            <button
                                type="button"
                                onClick={handleMainImageUpload}
                                className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Buscar archivo en el equipo...
                            </button>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Color del Nombre</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input type="color" name="nameColor" value={formData.nameColor} onChange={handleChange} className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer" />
                                <input type="text" name="nameColor" value={formData.nameColor} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Color del Texto CTA</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input type="color" name="ctaColor" value={formData.ctaColor} onChange={handleChange} className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer" />
                                <input type="text" name="ctaColor" value={formData.ctaColor} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Contenido del Reportaje</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Autor del Reportaje</label>
                                <input type="text" name="reportAuthor" value={formData.reportAuthor || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha del Reportaje</label>
                                <input type="text" name="reportDate" value={formData.reportDate || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                        </div>

                        <div className="p-3 border rounded-md bg-blue-50 my-4">
                            <label htmlFor="bulkText" className="block text-sm font-medium text-blue-800">Caja de texto masivo</label>
                            <p className="text-xs text-blue-600 mb-2">Pega el texto completo aquí. El sistema lo dividirá en párrafos por cada salto de línea.</p>
                            <textarea id="bulkText" value={bulkText} onChange={(e) => setBulkText(e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" rows={6} placeholder="Pega tu texto aquí..." />
                            <button type="button" onClick={handleAddBulkParagraphs} className="mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 text-sm">
                                Generar y Añadir Párrafos
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.reportContent?.map(renderReportItem)}
                        </div>

                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                            <span className="text-sm font-medium text-gray-700">Añadir bloque:</span>
                            <button type="button" onClick={() => handleAddItem('image')} className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200">Imagen</button>
                            <button type="button" onClick={() => handleAddItem('quote')} className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200">Cita</button>
                        </div>
                    </div>


                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SponsorForm;
