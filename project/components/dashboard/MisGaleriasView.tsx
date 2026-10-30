import React, { useState, useCallback, useEffect } from 'react';
import { User, PhotojournalismPost, ShareablePhoto } from '../../types';
import {
    PhotoIcon, XMarkIcon, MagnifyingGlassIcon, CalendarIcon,
    ArrowUpTrayIcon, CurrencyDollarIcon, TagIcon, TrashIcon, SparklesIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import AIWritingAssistant from '../ai/AIWritingAssistant';
import { ENV } from '../../src/config/env';
import { requestImageHashtags } from '../../utils/aiClient';



const API_BASE = ENV.isDevelopment ? '/api' : ENV.apiUrl;

const getMediaUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Remove '/api' from API_BASE to get the root domain, then append url
    const baseUrl = API_BASE.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

interface MisGaleriasViewProps {
    user: User;
    onGalleriesUpdated?: () => void;
}

export const MisGaleriasView: React.FC<MisGaleriasViewProps> = ({ user, onGalleriesUpdated }) => {
    const [activeTab, setActiveTab] = useState<'periodismo' | 'galeria'>('periodismo');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Estado para subida múltiple
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
    const [uploadStatusText, setUploadStatusText] = useState('');

    // Metadatos comunes a aplicar a todo el lote
    const [batchTitle, setBatchTitle] = useState('');
    const [batchCaption, setBatchCaption] = useState('');
    const [batchPrice, setBatchPrice] = useState('');
    // Estados para Hashtags con IA
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [customTagInput, setCustomTagInput] = useState('');
    const handleAddCustomTag = () => {
        const clean = customTagInput.trim();
        if (!clean) return;
        const formatted = clean.startsWith('#') ? clean : `#${clean}`;
        if (!hashtags.includes(formatted)) {
            setHashtags(prev => [...prev, formatted]);
        }
        setCustomTagInput('');
    };
    const handleRemoveTag = (tagToRemove: string) => {
        setHashtags(prev => prev.filter(t => t !== tagToRemove));
    };

    // Listas locales (en una app real vendrían del backend)
    const [photoPosts, setPhotoPosts] = useState<PhotojournalismPost[]>([]);
    const [shareablePhotos, setShareablePhotos] = useState<ShareablePhoto[]>([]);

    useEffect(() => {
        // Fetch local definitions (mock)
        const fetchGalleries = async () => {
            try {
                const resPhoto = await fetch(`${API_BASE}/photojournalism-posts`);
                if (resPhoto.ok) {
                    const data = await resPhoto.json();
                    setPhotoPosts(data.filter((p: any) => p.user_id === user.id || p.userId === user.id));
                }
                const resShare = await fetch(`${API_BASE}/shareable-photos?author_id=${user.id}`);
                if (resShare.ok) {
                    const data = await resShare.json();
                    setShareablePhotos(data);
                }
            } catch (e) {
                console.error("Error fetching galleries", e);
            }
        };
        fetchGalleries();
    }, [user.id]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray: File[] = Array.from(e.target.files);

            if (activeTab === 'periodismo') {
                // Solo 1 foto para Foto-Periodismo
                setSelectedFiles([filesArray[0]]);
            } else {
                // Hasta 20 fotos para Galería Fotográfica
                if (selectedFiles.length + filesArray.length > 20) {
                    alert('Puedes subir un máximo de 20 imágenes por lote.');
                    return;
                }
                setSelectedFiles(prev => [...prev, ...filesArray]);
            }

            // Escaneo automático con IA de la foto seleccionada
            if (filesArray.length > 0) {
                const fileToScan: File = filesArray[0];
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64Data = reader.result as string;
                    setIsAnalyzingImage(true);
                    try {
                        const suggested = await requestImageHashtags(base64Data, fileToScan.type);
                        if (suggested && suggested.length > 0) {
                            setHashtags(prev => {
                                const merged = [...prev];
                                suggested.forEach(tag => {
                                    if (!merged.includes(tag)) merged.push(tag);
                                });
                                return merged;
                            });
                        }
                    } catch (err) {
                        console.error("Error analizando imagen:", err);
                    } finally {
                        setIsAnalyzingImage(false);
                    }
                };
                reader.readAsDataURL(fileToScan);
            }
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleBatchUpload = async () => {
        if (selectedFiles.length === 0) return;

        // Validaciones según el tipo de galería
        if (activeTab === 'periodismo') {
            if (!batchTitle.trim() || !batchCaption.trim()) {
                alert('Tanto el Título del Reportaje como la Descripción Común son obligatorios para Foto-Periodismo.');
                return;
            }
        } else {
            if (!batchTitle.trim() || !batchPrice.trim()) {
                alert('El Nombre (Colección/Tema) y el Precio son obligatorios para la Galería Fotográfica.');
                return;
            }
        }

        setIsUploading(true);
        setUploadProgress(0);

        let successCount = 0;
        const total = selectedFiles.length;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setUploadStatusText(`Subiendo foto ${i + 1} de ${total}...`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'images/galleries');

            if (activeTab === 'galeria') {
                formData.append('watermark', 'true');
            }

            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();

                    const newEntry = activeTab === 'periodismo' ? {
                        title: batchTitle,
                        caption: hashtags.length > 0 ? `${batchCaption}\n\n${hashtags.join(' ')}` : batchCaption,
                        image_url: uploadData.url.replace('/media/', '/backendcipress/media/'),
                        date_taken: new Date().toISOString().split('T')[0],
                        date_added: new Date().toISOString(),
                        photographer_name: `${user.firstName} ${user.lastName}`,
                        user_id: user.id
                    } : {
                        caption: batchTitle + (batchCaption ? ` - ${batchCaption}` : ''),
                        image_url: uploadData.url.replace('/media/', '/backendcipress/media/'),
                        original_image_url: uploadData.url.replace('/media/', '/backendcipress/media/'),
                        watermarked_image_url: uploadData.watermarked_url ? uploadData.watermarked_url.replace('/media/', '/backendcipress/media/') : null,
                        price: batchPrice,
                        keywords: JSON.stringify(hashtags.length > 0 ? hashtags : [batchTitle]),
                        date_added: new Date().toISOString(),
                        photographer_name: `${user.firstName} ${user.lastName}`,
                        user_id: user.id
                    };

                    const endpoint = activeTab === 'periodismo' ? `${API_BASE}/photojournalism-posts` : `${API_BASE}/shareable-photos`;
                    const saveRes = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newEntry)
                    });

                    if (saveRes.ok) {
                        successCount++;
                        // Actualizar UI locale
                        const savedData = await saveRes.json();
                        if (activeTab === 'periodismo') {
                            setPhotoPosts(prev => [savedData, ...prev]);
                        } else {
                            setShareablePhotos(prev => [savedData, ...prev]);
                        }
                    } else if (saveRes.status === 403) {
                        const errData = await saveRes.json();
                        alert(errData.message || 'Límite de cuota alcanzado.');
                        break; // Stop batch upload
                    }
                }
            } catch (err) {
                console.error("Error subiendo el archivo", file.name, err);
            }

            setUploadProgress(Math.round(((i + 1) / total) * 100));
        }

        setIsUploading(false);
        setUploadStatusText('');
        setSelectedFiles([]);
        setBatchTitle('');
        setBatchCaption('');
        setBatchPrice('');

        if (onGalleriesUpdated) onGalleriesUpdated();

        alert(`¡Subida completada! Se guardaron ${successCount} de ${total} fotos.`);
    };

    const handleDeletePhoto = async (id: number, type: 'periodismo' | 'galeria') => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta foto?')) return;
        const endpoint = type === 'periodismo' ? `${API_BASE}/photojournalism-posts/${id}` : `${API_BASE}/shareable-photos/${id}`;
        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (res.ok || res.status === 204) {
                if (type === 'periodismo') {
                    setPhotoPosts(prev => prev.filter(p => p.id !== id));
                } else {
                    setShareablePhotos(prev => prev.filter(p => p.id !== id));
                }
                if (onGalleriesUpdated) onGalleriesUpdated();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Error al eliminar la foto.');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Error al intentar eliminar la foto.');
        }
    };

    const renderPhotoList = () => {
        if (activeTab === 'periodismo') {
            const filtered = photoPosts.filter((p: any) =>
                (p.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) &&
                (!dateFilter || p.date_added?.startsWith(dateFilter) || p.date_taken?.startsWith(dateFilter))
            );
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                    {filtered.map((p: any) => (
                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                            <div className="relative h-48">
                                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-4 relative">
                                <button
                                    onClick={() => handleDeletePhoto(p.id, 'periodismo')}
                                    className="absolute bottom-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar foto"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                                <h4 className="font-bold text-gray-900 mb-1 line-clamp-1 pr-6">{p.title}</h4>
                                <p className="text-xs text-gray-500 mb-3">{new Date(p.date_added || p.date_taken).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600 line-clamp-2 pr-6">{p.caption}</p>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-gray-500 col-span-full py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">No tienes fotos de periodismo que coincidan con tu búsqueda.</p>}
                </div>
            );
        } else {
            const filtered = shareablePhotos.filter((p: any) =>
                (p.caption?.toLowerCase() || '').includes(searchQuery.toLowerCase()) &&
                (!dateFilter || p.date_added?.startsWith(dateFilter))
            );
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                    {filtered.map((p: any) => (
                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                            <div className="relative h-48 bg-gray-100">
                                <img src={getMediaUrl(p.watermarked_image_url || p.image_url)} alt={p.caption} className="w-full h-full object-contain" />
                                {p.is_sold && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        VENDIDA
                                    </div>
                                )}
                            </div>
                            <div className="p-4 relative">
                                <button
                                    onClick={() => handleDeletePhoto(p.id, 'galeria')}
                                    className="absolute bottom-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar foto"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                                <div className="flex justify-between items-start mb-2 pr-6">
                                    <h4 className="font-bold text-primary">{p.price || 'Sin Precio'}</h4>
                                    <span className="text-xs text-gray-400">{new Date(p.date_added).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 pr-6">{p.caption}</p>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-gray-500 col-span-full py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">No tienes fotos comerciales que coincidan con tu búsqueda.</p>}
                </div>
            );
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Mis Galerías</h1>
                <p className="text-gray-600">Sube tus coberturas fotográficas o administra tu catálogo de venta de imágenes.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8 flex space-x-8">
                <button
                    onClick={() => {
                        if (activeTab === 'periodismo') return;
                        if (selectedFiles.length > 0) {
                            if (!window.confirm('Tienes fotos pendientes por subir. ¿Deseas descartarlas y cambiar de sección?')) return;
                        }
                        setSelectedFiles([]);
                        setBatchTitle('');
                        setBatchCaption('');
                        setBatchPrice('');
                        setActiveTab('periodismo');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`pb-4 text-lg font-bold transition-colors whitespace-nowrap ${activeTab === 'periodismo'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Foto-Periodismo
                </button>
                <button
                    onClick={() => {
                        if (activeTab === 'galeria') return;
                        if (selectedFiles.length > 0) {
                            if (!window.confirm('Tienes fotos pendientes por subir. ¿Deseas descartarlas y cambiar de sección?')) return;
                        }
                        setSelectedFiles([]);
                        setBatchTitle('');
                        setBatchCaption('');
                        setBatchPrice('');
                        setActiveTab('galeria');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`pb-4 text-lg font-bold transition-colors whitespace-nowrap ${activeTab === 'galeria'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Galería Fotográfica (Ventas)
                </button>
            </div>

            {/* Subida Masiva (Dropzone UI) */}
            <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 mb-12">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-primary" />
                    Subir Nuevas Fotografías
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Área de archivos */}
                    <div>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-white hover:border-primary transition-colors text-center">
                            <input
                                type="file"
                                multiple={activeTab === 'galeria'}
                                accept="image/jpeg,image/png,image/jfif"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-medium font-serif mb-1">Haz clic o arrastra tus fotos aquí</p>
                            <p className="text-sm text-gray-500">
                                {activeTab === 'periodismo' ? '1 foto por reportaje (JPG, PNG, JFIF)' : 'Máximo 20 fotos por subida (JPG, PNG, JFIF)'}
                            </p>
                                                    {/* Módulo de Hashtags Inteligentes con IA */}
                        <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200/70 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wide">
                                    <TagIcon className="w-4 h-4 mr-1.5 text-primary" />
                                    Hashtags y Etiquetas Temáticas
                                </label>
                                {isAnalyzingImage && (
                                    <span className="flex items-center text-xs font-semibold text-primary animate-pulse">
                                        <SparklesIcon className="w-4 h-4 mr-1 animate-spin" />
                                        Escaneando imagen con IA...
                                    </span>
                                )}
                            </div>

                            {/* Lista de Hashtags en formato Chips/Pills */}
                            <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                                {hashtags.length === 0 && !isAnalyzingImage && (
                                    <span className="text-xs text-gray-500 italic">
                                        Selecciona una foto arriba para que la IA sugiera hashtags automáticamente o escribe los tuyos abajo.
                                    </span>
                                )}

                                {hashtags.map((tag, idx) => (
                                    <span 
                                        key={idx} 
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white text-orange-900 border border-orange-200 shadow-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Eliminar etiqueta"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Input para que el usuario agregue sus propios hashtags */}
                            <div className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    value={customTagInput}
                                    onChange={e => setCustomTagInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomTag();
                                        }
                                    }}
                                    placeholder="Escribe tu propio hashtag (ej: #Valparaíso) y presiona Enter..."
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomTag}
                                    className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all shadow-sm"
                                >
                                    <PlusIcon className="w-3.5 h-3.5 mr-1" />
                                    Añadir
                                </button>
                            </div>
                        </div>

                        {activeTab === 'galeria' && (
                                <p className="mt-4 text-xs font-bold text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-full">
                                    Se aplicará marca de agua CiPress automáticamente
                                </p>
                            )}
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Imágenes Seleccionadas ({selectedFiles.length}{activeTab === 'galeria' ? '/20' : '/1'})</h4>
                                <ul className="space-y-3">
                                    {selectedFiles.map((f, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2 rounded-lg shell">
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                                    <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="truncate text-sm text-gray-600 font-medium">{f.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700 bg-white p-1.5 rounded-full shadow-sm" disabled={isUploading}>
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Formulario de Metadatos del Lote */}
                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                            <h4 className="text-sm font-bold text-gray-900">Metadatos del Lote</h4>
                            <span className="flex items-center text-xs font-semibold text-primary bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                                <SparklesIcon className="w-3.5 h-3.5 mr-1 text-primary" />
                                Asistido por IA CiPress
                            </span>
                        </div>

                        {/* Banner Asistente IA y Preview Fase Visual */}
                        <div className="p-3.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 rounded-xl border border-orange-200/80 text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center space-x-1.5 font-bold text-orange-950">
                                    <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
                                    <span>Asistente de Redacción Fotoperiodística</span>
                                </div>
                                <span className="px-2 py-0.5 bg-orange-200/70 text-orange-900 rounded-full font-bold text-[10px] uppercase tracking-wider">
                                    Fase 1: Redacción
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                Apóyate en la IA para redactar pies de fotos informativos, titular tus reportajes, ajustar el tono periodístico o traducir descripciones.
                            </p>
                            <div className="flex items-center space-x-2 text-[11px] text-gray-500 pt-1.5 border-t border-orange-200/60">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/90 border border-orange-200 text-primary font-bold text-[10px] uppercase">
                                    Próximamente
                                </span>
                                <span className="text-gray-600">Análisis visual directo de fotos y sugerencia de etiquetas temáticas automáticas.</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                                    {activeTab === 'periodismo' ? 'Título del Reportaje' : 'Colección / Tema'}
                                </label>
                                <AIWritingAssistant
                                    currentText={batchTitle}
                                    context="title"
                                    buttonLabel="Sugerir Título"
                                    onApplyText={(newText) => setBatchTitle(newText)}
                                />
                            </div>
                            <input
                                type="text" value={batchTitle} onChange={e => setBatchTitle(e.target.value)} disabled={isUploading}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-2 px-3 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                placeholder={activeTab === 'periodismo' ? 'Ej. Marcha Estudiantil Santiago' : 'Ej. Paisajes de la Patagonia'}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                                    Descripción Común / Pie de Foto
                                </label>
                                <AIWritingAssistant
                                    currentText={batchCaption}
                                    context="caption"
                                    buttonLabel="Asistir Pie de Foto"
                                    onApplyText={(newText) => setBatchCaption(newText)}
                                />
                            </div>
                            <textarea
                                value={batchCaption} onChange={e => setBatchCaption(e.target.value)} disabled={isUploading} rows={3}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-2 px-3 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                placeholder="Texto o pie de foto descriptivo que acompañará a las fotos de esta subida..."
                            />
                        </div>

                                                {/* Módulo de Hashtags Inteligentes con IA */}
                        <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200/70 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-wide">
                                    <TagIcon className="w-4 h-4 mr-1.5 text-primary" />
                                    Hashtags y Etiquetas Temáticas
                                </label>
                                {isAnalyzingImage && (
                                    <span className="flex items-center text-xs font-semibold text-primary animate-pulse">
                                        <SparklesIcon className="w-4 h-4 mr-1 animate-spin" />
                                        Escaneando imagen con IA...
                                    </span>
                                )}
                            </div>

                            {/* Lista de Hashtags en formato Chips/Pills */}
                            <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                                {hashtags.length === 0 && !isAnalyzingImage && (
                                    <span className="text-xs text-gray-500 italic">
                                        Selecciona una foto arriba para que la IA sugiera hashtags automáticamente o escribe los tuyos abajo.
                                    </span>
                                )}

                                {hashtags.map((tag, idx) => (
                                    <span 
                                        key={idx} 
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white text-orange-900 border border-orange-200 shadow-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Eliminar etiqueta"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Input para que el usuario agregue sus propios hashtags */}
                            <div className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    value={customTagInput}
                                    onChange={e => setCustomTagInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomTag();
                                        }
                                    }}
                                    placeholder="Escribe tu propio hashtag (ej: #Valparaíso) y presiona Enter..."
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomTag}
                                    className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all shadow-sm"
                                >
                                    <PlusIcon className="w-3.5 h-3.5 mr-1" />
                                    Añadir
                                </button>
                            </div>
                        </div>

                        {activeTab === 'galeria' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Precio Unitario Promedio</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text" value={batchPrice} onChange={e => setBatchPrice(e.target.value)} disabled={isUploading}
                                        className="w-full pl-10 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-2 px-3 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                        placeholder="Ej. $15.000 CLP"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            {!isUploading ? (
                                <button
                                    onClick={handleBatchUpload}
                                    disabled={selectedFiles.length === 0}
                                    className="w-full flex justify-center items-center px-4 py-3 bg-primary text-white font-bold rounded-lg shadow hover:bg-orange-600 transition-all disabled:opacity-50"
                                >
                                    <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                                    Iniciar Subida Secuencial
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-center font-bold text-primary">{uploadStatusText}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros Buscador */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                        placeholder="Buscar por título o descripción..."
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    />
                </div>
            </div>

            {/* Listado de Fotos */}
            {renderPhotoList()}

        </div>
    );
};

export default MisGaleriasView;
