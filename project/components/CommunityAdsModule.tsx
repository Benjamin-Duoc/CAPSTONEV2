
import React, { useState, useMemo } from 'react';

import type { CommunityAd } from '../types';
import { WhatsAppIcon } from './icons';

const CommunityAdCard: React.FC<{ ad: CommunityAd }> = ({ ad }) => {
    const categoryColors: { [key in CommunityAd['category']]: string } = {
        'Venta': 'bg-secondary/10 text-secondary',
        'Búsqueda': 'bg-highlight/20 text-yellow-800',
        'Colaboración': 'bg-accent/20 text-green-800',
    };

    return (
        <div className="bg-surface p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <img src={ad.authorAvatarUrl} alt={ad.authorName} className="w-10 h-10 rounded-full object-cover" />
                    <p className="font-semibold text-text-primary">{ad.authorName}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${categoryColors[ad.category]}`}>{ad.category}</span>
            </div>
            <h3 className="font-bold font-serif text-lg text-text-primary mt-1 flex-grow">{ad.title}</h3>
            <p className="text-sm text-text-secondary my-3">{ad.description}</p>
            <a href={`https://wa.me/${ad.whatsappContact}`} target="_blank" rel="noopener noreferrer" className="w-full mt-auto px-4 py-2 text-sm font-bold text-white bg-[#25D366] rounded-md hover:bg-[#1DAE51] transition-colors flex items-center justify-center space-x-2">
                <WhatsAppIcon className="h-5 w-5" />
                <span>Contactar por WhatsApp</span>
            </a>
        </div>
    );
};


interface CommunityAdsModuleProps {
    ads: CommunityAd[];
    onBack: () => void;
}

const CommunityAdsModule: React.FC<CommunityAdsModuleProps> = ({ ads, onBack }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;
    const [isCommunityAdModalOpen, setIsCommunityAdModalOpen] = useState(false);

    const sortedAds = useMemo(() => {
        return [...ads].sort((a, b) => b.id - a.id);
    }, []);

    const totalPages = Math.ceil(sortedAds.length / ITEMS_PER_PAGE);

    const currentAds = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedAds]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const CommunityAdPublicationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title-ad">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-3xl font-bold" aria-label="Cerrar modal">&times;</button>
                <h3 id="modal-title-ad" className="text-2xl font-bold font-serif text-secondary">Beneficio para Suscriptores Gratuitos</h3>
                <p className="mt-4 text-text-secondary">Para publicar un aviso clasificado, necesitas una suscripción gratuita activa en CiPress.</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#" className="px-6 py-3 text-base font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors">
                        Registrarme
                    </a>
                    <a href="#" className="px-6 py-3 text-base font-bold text-secondary bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                        Ingresar
                    </a>
                </div>
            </div>
        </div>
    );


    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Avisos a la Comunidad</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Un espacio para comprar, vender, buscar y colaborar entre pares.</p>
                </div>

                <div className="bg-gradient-to-r from-secondary to-blue-900 rounded-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-white shadow-lg">
                    <div>
                        <h3 className="font-bold font-serif text-xl text-highlight">Publica tu aviso. ¡Es un beneficio gratuito para suscriptores!</h3>
                        <p className="mt-1 text-sm text-blue-300">¿Necesitas vender un equipo o buscar un colaborador? Este es tu espacio.</p>
                    </div>
                    <button onClick={() => setIsCommunityAdModalOpen(true)} className="mt-4 sm:mt-0 flex-shrink-0 px-5 py-2 font-bold text-secondary bg-highlight rounded-md hover:bg-yellow-300 transition-colors duration-200 shadow-md">
                        Sube tu aviso
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentAds.map(ad => <CommunityAdCard key={ad.id} ad={ad} />)}
                </div>

                {currentAds.length === 0 && (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-text-primary">No hay avisos por el momento</h3>
                        <p className="text-text-secondary mt-2">¡Vuelve pronto o sé el primero en publicar!</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-12">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-text-secondary">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
            {isCommunityAdModalOpen && <CommunityAdPublicationModal onClose={() => setIsCommunityAdModalOpen(false)} />}
        </div>
    );
};

export default CommunityAdsModule;