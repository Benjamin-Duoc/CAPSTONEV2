import React from 'react';
import { ArrowUpRightIcon } from './icons';
import type { DestacadoArticle } from '../types';

interface DestacadosModuleProps {
    destacados: DestacadoArticle[];
    onSelectDestacado: (destacado: DestacadoArticle) => void;
    onBack: () => void;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

const DestacadosModule: React.FC<DestacadosModuleProps> = ({ destacados, onSelectDestacado, onBack }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = DEFAULT_IMAGE;
    };

    return (
        <div className="bg-background min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <div className="mb-12 border-b-2 border-primary pb-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary">
                        Noticias Destacadas
                    </h1>
                    <p className="text-lg text-text-secondary mt-4">
                        Explora los reportajes, entrevistas y artículos más relevantes seleccionados por nuestro equipo editorial.
                    </p>
                </div>

                {destacados.length === 0 ? (
                    <p className="text-text-secondary text-lg text-center py-16 bg-surface rounded-lg shadow-sm">
                        No hay noticias destacadas publicadas en este momento.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {destacados.map(destacado => (
                            <button
                                key={destacado.id}
                                onClick={() => onSelectDestacado(destacado)}
                                className="bg-surface rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 text-left group flex flex-col h-full border border-gray-100"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={destacado.imageUrl || DEFAULT_IMAGE}
                                        alt={destacado.title}
                                        onError={handleImageError}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-primary text-white text-xs font-bold uppercase py-1 px-3 rounded-full shadow-sm">
                                            {destacado.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <span className="text-sm text-text-secondary mb-3 font-medium">
                                        {destacado.date}
                                    </span>
                                    <h3 className="text-xl font-bold font-serif text-text-primary mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {destacado.title}
                                    </h3>
                                    <p className="text-text-secondary mb-6 line-clamp-3 flex-grow">
                                        {destacado.summary}
                                    </p>
                                    <div className="font-semibold text-primary mt-auto flex items-center group-hover:underline">
                                        Leer artículo <ArrowUpRightIcon className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DestacadosModule;
