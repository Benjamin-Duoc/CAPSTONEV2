import React, { useState } from 'react';
import type { User, PremiumSponsor, ReportContentItem } from '../../types';
import { PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import ContentEditor from '../admin/ContentEditor';

interface ConfianEnCipressViewProps {
    currentUser: User;
    premiumSponsors: PremiumSponsor[];
    onSave: (data: Partial<PremiumSponsor>) => Promise<void>;
}

const DEFAULT_IMAGE = "https://picsum.photos/seed/sponsor/400/300";

const ConfianEnCipressView: React.FC<ConfianEnCipressViewProps> = ({ currentUser, premiumSponsors, onSave }) => {
    const existingSponsor = premiumSponsors.find(s => s.userId === currentUser.id);

    const [formData, setFormData] = useState({
        name: existingSponsor?.name || currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '',
        tagline: existingSponsor?.tagline || '',
        ctaLink: existingSponsor?.ctaLink || '',
        imageUrl: existingSponsor?.imageUrl || '',
        ctaText: existingSponsor?.ctaText || 'Visitar Sitio',
        reportAuthor: existingSponsor?.reportAuthor || currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '',
        reportContent: existingSponsor?.reportContent || ([] as ReportContentItem[]),
    });

    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'exterior' | 'interior'>('exterior');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    setFormData(prev => ({ ...prev, imageUrl: base64String }));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            alert('¡Tu tarjeta de presentacion ha sido guardada con éxito en "Confían en CiPress"!');
        } catch (error) {
            alert('Hubo un error al guardar la tarjeta.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-8 animate-fade-in relative bg-white md:rounded-2xl mt-8 shadow-sm border border-gray-100">
            {/* Header / Intro section */}
            <div className="px-8 py-8 md:px-12 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Tu Tarjeta Comercial</h2>
                <p className="text-gray-500 mt-2 text-sm">Destaca en nuestra portada principal. Completa la información a continuación para que miles de usuarios puedan conocer más sobre tu empresa o servicios.</p>
            </div>

            <div className="px-8 py-6 md:px-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                
                    {/* Header & Tabs Row */}
                    <div className="border-b border-gray-200 mb-6 flex space-x-8">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('exterior');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`pb-4 text-lg font-bold transition-colors whitespace-nowrap ${
                                activeTab === 'exterior'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Exterior de la Tarjeta
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('interior');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`pb-4 text-lg font-bold transition-colors whitespace-nowrap ${
                                activeTab === 'interior'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Artículo Interior
                        </button>
                    </div>

                    {/* Live Preview Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        
                        <div className="flex-1 w-full">
                            
                            {/* Exterior Tab */}
                            {activeTab === 'exterior' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Nombre de la Empresa o Marca</label>
                                <input 
                                    type="text" name="name" value={formData.name} onChange={handleChange} required maxLength={50}
                                    className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                                    placeholder="Ej. Mi Empresa SPA"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Eslogan o Descripción Corta</label>
                                    <span className="text-xs font-medium text-gray-400">{formData.tagline.length}/100</span>
                                </div>
                                <textarea 
                                    name="tagline" value={formData.tagline} onChange={handleChange} required maxLength={100} rows={2}
                                    className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none font-medium" 
                                    placeholder="Ej. Liderando la innovación en el mundo digital."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Texto del Botón</label>
                                    <input 
                                        type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} required maxLength={30}
                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                                        placeholder="Ej. Visitar Sitio, Contáctanos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Enlace del Botón</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500">
                                            <LinkIcon className="w-5 h-5" />
                                        </span>
                                        <input 
                                            type="url" name="ctaLink" value={formData.ctaLink} onChange={handleChange} required
                                            className="flex-1 block w-full rounded-none rounded-r-lg bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                                            placeholder="https://tu-sitio.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Imagen de Portada</label>
                                <button 
                                    type="button" onClick={handleImageUpload}
                                    className="w-full flex justify-center items-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-primary hover:border-primary hover:bg-orange-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <PhotoIcon className="w-6 h-6 mr-2" />
                                    <span className="font-medium">Subir o actualizar imagen</span>
                                </button>
                                <p className="mt-2 text-xs text-gray-500">Recomendado: 800x600 px. Formatos válidos: JPG, PNG.</p>
                            </div>
                                </div>
                            )}
                            
                            {/* Interior Article Tab */}
                            {activeTab === 'interior' && (
                                <div className="animate-fade-in">
                                    <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">Artículo Interior</h3>
                                    <p className="text-sm text-gray-500 mb-6">Redacta el contenido detallado o noticia que los usuarios verán al hacer clic en tu tarjeta comercial.</p>
                                    
                                    <div className="mb-6">
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Autor del Artículo</label>
                                        <input 
                                            type="text" name="reportAuthor" value={formData.reportAuthor} onChange={handleChange} required maxLength={60}
                                            className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                                            placeholder="Ej. Equipo de Comunicaciones"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Cuerpo del Artículo</label>
                                        <ContentEditor 
                                            content={formData.reportContent} 
                                            onChange={(newContent) => setFormData(prev => ({ ...prev, reportContent: newContent }))} 
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Vista Previa de la Tarjeta */}
                        {activeTab === 'exterior' && (
                            <div className="w-full md:w-72 bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-24 animate-fade-in">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Vista Previa Real</h3>
                                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-transform duration-300">
                                    <img src={formData.imageUrl || DEFAULT_IMAGE} alt="Sponsor" className="w-full h-32 object-cover" />
                                    <div className="p-4 flex flex-col items-center">
                                        <h3 className="text-xl font-bold font-serif text-center" style={{ color: existingSponsor?.nameColor || '#232536' }}>
                                            {formData.name || 'Tu Empresa'}
                                        </h3>
                                        <p className="text-gray-600 mt-2 text-sm text-center line-clamp-2">
                                            {formData.tagline || 'Escribe una descripción.'}
                                        </p>
                                        <div 
                                            className="mt-4 px-6 py-2 rounded-full text-white font-medium text-sm transition-all shadow-sm"
                                            style={{ backgroundColor: existingSponsor?.ctaColor || '#FF6B00' }}
                                        >
                                            {formData.ctaText || 'Visitar sitio'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <hr className="border-gray-100" />
                    
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar y Publicar Tarjeta'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ConfianEnCipressView;
