import React from 'react';
import type { Specialist } from '../types';
import { WhatsAppIcon } from './icons';

interface SpecialistDetailPageProps {
    specialist: Specialist;
    onBack: () => void;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const SpecialistDetailPage: React.FC<SpecialistDetailPageProps> = ({ specialist, onBack }) => {
    return (
        <div className="bg-background min-h-screen animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header with Back Button - Standardized to Orange Arrow + Volver */}
                <button 
                    onClick={onBack} 
                    className="flex items-center text-[#F5A623] font-bold mb-8 hover:translate-x-[-4px] transition-all group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-xl">Volver</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Side */}
                        <div className="relative h-96 lg:h-auto overflow-hidden bg-gray-100">
                            <img 
                                src={specialist.imageUrl || DEFAULT_IMAGE} 
                                alt={specialist.name} 
                                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 text-white">
                                <h1 className="text-4xl md:text-5xl font-black font-serif uppercase tracking-tight" style={{ color: specialist.textColor }}>
                                    {specialist.name}
                                </h1>
                                <p className="text-xl font-bold mt-2 opacity-90" style={{ color: specialist.textColor }}>
                                    {specialist.title}
                                </p>
                            </div>
                        </div>

                        {/* Info Side */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            <div className="flex-grow">
                                <div className="flex items-center space-x-2 mb-6">
                                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase rounded-full tracking-wider">
                                        Fuente Destacada
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        Actualizado: {new Date(specialist.dateAdded).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Sobre esta fuente:</h2>
                                <div className="prose prose-lg text-text-secondary leading-relaxed mb-8">
                                    <p className="whitespace-pre-wrap">{specialist.specialtyDescription}</p>
                                </div>

                                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                                    <h3 className="font-bold text-text-primary">¿Por qué es una fuente recomendada?</h3>
                                    <ul className="space-y-2 text-sm text-text-secondary">
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Información verificada por la comunidad CiPress.
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Alta disponibilidad para entrevistas y consultas rápidas.
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            Experiencia comprobable en {specialist.title}.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Contact Action */}
                            <div className="mt-auto pt-8 border-t border-gray-100 flex items-center">
                                <a 
                                    href={`https://wa.me/${specialist.whatsappContact}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full py-4 px-6 bg-[#25D366] text-white font-black rounded-2xl hover:bg-[#1DAE51] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center space-x-3 text-center uppercase tracking-widest text-sm"
                                >
                                    <WhatsAppIcon className="h-6 w-6 text-white" />
                                    <span>CONTACTAR AHORA</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section Placeholder */}
                <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-surface p-8 rounded-3xl border border-gray-100">
                        <h4 className="font-bold text-lg text-text-primary mb-4">Temas de Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Análisis Político', 'Políticas Públicas', 'Legislación', 'Economía'].map(tag => (
                                <span key={tag} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-secondary">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                     <div className="bg-secondary/5 p-8 rounded-3xl border border-secondary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                             <svg className="w-20 h-20 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <h4 className="font-bold text-lg text-secondary mb-2">Se parte de CiPress</h4>
                        <p className="text-blue-900 text-sm mb-4">Promueve tu experiencia o la de tu institución ante los periodistas más influyentes de la región.</p>
                        <button className="px-6 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-blue-900 transition-colors">
                            Sube tu Fuente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialistDetailPage;
