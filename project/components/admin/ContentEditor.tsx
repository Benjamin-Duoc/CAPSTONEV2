import React, { useState } from 'react';
import type { ReportContentItem } from '../../types';
import { DragHandleIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../icons';

interface ContentEditorProps {
    content: ReportContentItem[];
    onChange: (newContent: ReportContentItem[]) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onChange }) => {
    const [bulkText, setBulkText] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleReportContentChange = (index: number, field: string, value: string) => {
        const newContent = [...content];
        const updatedItem = { ...newContent[index], [field]: value };
        newContent[index] = updatedItem as ReportContentItem;
        onChange(newContent);
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
        onChange([...content, newItem]);
    };

    const handleDeleteItem = (index: number) => {
        onChange(content.filter((_, i) => i !== index));
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const newContent = [...content];
        if (direction === 'up' && index > 0) {
            [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
        }
        if (direction === 'down' && index < newContent.length - 1) {
            [newContent[index + 1], newContent[index]] = [newContent[index], newContent[index + 1]];
        }
        onChange(newContent);
    };

    const handleAddBulkParagraphs = () => {
        if (!bulkText.trim()) return;

        const paragraphs = bulkText.split(/\n+/).filter(p => p.trim() !== '');
        const newItems: ReportContentItem[] = paragraphs.map(p => ({ type: 'paragraph', text: p }));

        onChange([...content, ...newItems]);
        setBulkText('');
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set a drag image customized if needed, usage of browser default is fine
        // e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        // Optionally, we could reorder on hover, but for now we'll stick to reorder on drop as it's more stable
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newContent = [...content];
        const [movedItem] = newContent.splice(draggedIndex, 1);
        newContent.splice(index, 0, movedItem);

        onChange(newContent);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const renderReportItem = (item: ReportContentItem, index: number) => {
        const isDragging = draggedIndex === index;

        const commonControls = (
            <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-100">
                <div className="flex-grow flex items-center text-xs text-gray-400">
                    <span className="mr-2 cursor-grab active:cursor-grabbing" title="Arrastrar para mover">
                        <DragHandleIcon className="h-4 w-4" />
                    </span>
                    <span>Arrastra desde el icono para mover</span>
                </div>
                <button type="button" onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-primary disabled:opacity-30 p-1" title="Subir">
                    <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleMoveItem(index, 'down')} disabled={index === content.length - 1} className="text-gray-500 hover:text-primary disabled:opacity-30 p-1" title="Bajar">
                    <ArrowDownIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 p-1 ml-2" title="Eliminar">
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        );

        let itemContent;
        switch (item.type) {
            case 'paragraph':
                itemContent = (
                    <>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Párrafo #{index + 1}</label>
                        <textarea
                            value={item.text}
                            onChange={(e) => handleReportContentChange(index, 'text', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary"
                            rows={3}
                        />
                    </>
                );
                break;
            case 'image':
                itemContent = (
                    <>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Imagen</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-1/3 bg-gray-100 rounded-md flex items-center justify-center p-2 border border-gray-200">
                                <img src={item.src} alt={item.alt} className="max-h-32 object-contain" />
                            </div>
                            <div className="w-full sm:w-2/3 space-y-2">
                                <input type="text" placeholder="URL de la imagen" value={item.src} onChange={(e) => handleReportContentChange(index, 'src', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm" />
                                <button type="button" onClick={() => handleImageUpload(index)} className="text-xs px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200">
                                    Subir imagen...
                                </button>
                                <input type="text" placeholder="Texto alternativo (alt)" value={item.alt} onChange={(e) => handleReportContentChange(index, 'alt', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm mt-1" />
                            </div>
                        </div>
                    </>
                );
                break;
            case 'quote':
                itemContent = (
                    <>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cita</label>
                        <textarea value={item.text} onChange={(e) => handleReportContentChange(index, 'text', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm italic" rows={2} placeholder="Texto de la cita" />
                        <input type="text" placeholder="Autor (opcional)" value={item.author || ''} onChange={(e) => handleReportContentChange(index, 'author', e.target.value)} className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm" />
                    </>
                );
                break;
            default:
                return null;
        }

        return (
            <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 border rounded-md mb-3 transition-colors duration-200 ${isDragging ? 'opacity-50 border-dashed border-primary bg-blue-50' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
            >
                {itemContent}
                {commonControls}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-100">
                <label htmlFor="bulkText" className="block text-sm font-medium text-blue-900 mb-1">Añadir texto masivo (automáticamente crea parrafos)</label>
                <textarea
                    id="bulkText"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="block w-full border border-blue-200 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    rows={4}
                    placeholder="Pega tu texto completo aquí..."
                />
                <button type="button" onClick={handleAddBulkParagraphs} className="mt-2 text-sm px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors">
                    Generar Párrafos
                </button>
            </div>

            <div className="space-y-2">
                {!Array.isArray(content) || content.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        No hay contenido. Añade párrafos, imágenes o citas.
                    </p>
                ) : (
                    content.map(renderReportItem)
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700 mr-2">Añadir bloque:</span>
                <button type="button" onClick={() => handleAddBulkParagraphs()} className="hidden" /> {/* Hidden trigger mostly for logic consistency if needed */}
                <button type="button" onClick={() => handleAddItem('image')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 flex items-center">
                    + Imagen
                </button>
                <button type="button" onClick={() => handleAddItem('quote')} className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 flex items-center">
                    + Cita
                </button>
                <button type="button" onClick={() => onChange([...content, { type: 'paragraph', text: '' }])} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 flex items-center">
                    + Párrafo vacío
                </button>
            </div>
        </div>
    );
};

export default ContentEditor;
