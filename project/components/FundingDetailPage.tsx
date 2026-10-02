import React from 'react';
import type { FundingOpportunity } from '../types';
import { TrophyIcon, CalendarIcon, ArrowUpRightIcon } from './icons';

interface FundingDetailPageProps {
    funding: FundingOpportunity;
    onBack: () => void;
}

const FundingDetailPage: React.FC<FundingDetailPageProps> = ({ funding, onBack }) => {
    // Helper to determine badge color based on type
    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'Fondo': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Beca': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Premio': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-background min-h-screen animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Standardized Back Button */}
                <button 
                    onClick={onBack} 
                    className="flex items-center text-[#F5A623] font-bold mb-8 hover:translate-x-[-4px] transition-all group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-xl">Volver</span>
                </button>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-secondary to-blue-900 p-8 md:p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <TrophyIcon className="w-32 h-32" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className={`inline-block px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${getTypeStyles(funding.type)}`}>
                                    {funding.type}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black font-serif leading-tight">
                                    {funding.title}
                                </h1>
                                <p className="text-xl md:text-2xl mt-4 text-blue-100 font-light italic">
                                    Organizado por: <span className="font-bold text-white uppercase tracking-wide">{funding.organization}</span>
                                </p>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Column: Main Info */}
                                <div className="md:col-span-2">
                                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Descripción de la oportunidad</h2>
                                    <div className="prose prose-lg text-text-secondary leading-relaxed mb-8">
                                        <p>
                                            Esta es una oportunidad destacada para periodistas y comunicadores de la región. 
                                            El programa desarrollado por <span className="font-semibold text-primary">{funding.organization}</span> busca fomentar la excelencia en la investigación y la cobertura de temas de interés público.
                                        </p>
                                        <p>
                                            Aunque la descripción detallada varía según la convocatoria, los fondos suelen cubrir costes de producción periodística, estancias formativas o reconocimiento a trabajos ya publicados de alta calidad.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <h3 className="font-bold text-text-primary mb-4 flex items-center">
                                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm">💡</span>
                                            Tips para postular con éxito:
                                        </h3>
                                        <ul className="space-y-3 text-sm text-text-secondary">
                                            <li className="flex items-start">
                                                <span className="text-primary mr-2">•</span>
                                                Lee detenidamente las bases oficiales del concurso.
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-primary mr-2">•</span>
                                                Asegúrate de que tu proyecto esté alineado con los objetivos de la organización.
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-primary mr-2">•</span>
                                                Adjunta muestras de trabajos anteriores que demuestren tu capacidad.
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Column: Sidebar Action */}
                                <div className="space-y-6">
                                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center">
                                        <div className="flex justify-center mb-3">
                                            <div className="p-3 bg-primary/10 rounded-full">
                                                <CalendarIcon className="w-8 h-8 text-primary" />
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Fecha Límite</p>
                                        <p className="text-2xl font-black text-secondary">{funding.deadline}</p>
                                        <p className="text-xs text-text-secondary mt-2">¡No dejes pasar esta oportunidad!</p>
                                    </div>

                                    <a 
                                        href={funding.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-5 px-6 bg-primary text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/30 flex items-center justify-center space-x-3 text-center uppercase tracking-widest"
                                    >
                                        <span>VER BASES</span>
                                        <ArrowUpRightIcon className="w-5 h-5" />
                                    </a>

                                    <div className="p-4 text-center">
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            Serás redirigido externamente al sitio oficial de la convocatoria.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundingDetailPage;
