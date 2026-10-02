
import React, { useState, useMemo } from 'react';
import type { ShareablePhoto } from '../types';
import { WhatsAppIcon, SearchIcon } from './icons';

interface PhotoGalleryModuleProps {
    shareablePhotos: ShareablePhoto[];
    onBack: () => void;
}

const ShareablePhotoCard: React.FC<{ photo: ShareablePhoto }> = ({ photo }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col h-full overflow-hidden group">
        <div className="relative">
            <img src={photo.imageUrl} alt={photo.caption} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute top-2 left-2 flex items-center bg-black/50 p-2 rounded-lg text-base font-bold">
                <img src={photo.photographerAvatarUrl} alt={photo.photographerName} className="w-6 h-6 rounded-full mr-2 border-2 border-white" />
                <span style={{ color: photo.textColor }}>{photo.photographerName}</span>
            </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <p className="text-sm text-text-secondary flex-grow italic">"{photo.caption}"</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-text-primary text-center mb-2">¿Necesitas más fotos como esta?</p>
                <a href={`https://wa.me/${photo.whatsappContact}`} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2 text-sm font-bold text-white bg-[#25D366] rounded-md hover:bg-[#1DAE51] transition-colors flex items-center justify-center space-x-2">
                    <WhatsAppIcon className="h-5 w-5" />
                    <span>Contactar al autor</span>
                </a>
            </div>
        </div>
    </div>
);


const PhotoGalleryModule: React.FC<PhotoGalleryModuleProps> = ({ shareablePhotos, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const sortedPhotos = useMemo(() => {
        return [...shareablePhotos].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }, [shareablePhotos]);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 on new search
    };

    const filteredPhotos = useMemo(() => {
        if (!searchTerm.trim()) {
            return sortedPhotos;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return sortedPhotos.filter(photo =>
            photo.caption.toLowerCase().includes(lowercasedFilter) ||
            photo.photographerName.toLowerCase().includes(lowercasedFilter) ||
            photo.keywords.some(keyword => keyword.toLowerCase().includes(lowercasedFilter))
        );
    }, [searchTerm, sortedPhotos]);
    
    const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);

    const currentPhotos = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPhotos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredPhotos]);
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };


    return (
        <div className="bg-gray-50 min-h-screen">
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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Galería Fotográfica CiPress</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Un banco de imágenes colaborativo, libre de derechos para uso periodístico (con crédito al autor).</p>
                </div>
                
                <div className="mb-8 sticky top-24 z-40">
                     <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por palabra clave (ej: protesta, valparaíso, naturaleza...)"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full shadow-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            aria-label="Buscar fotos en la galería"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {currentPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentPhotos.map(photo => (
                            <ShareablePhotoCard key={photo.id} photo={photo} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-text-primary">No se encontraron fotos</h3>
                        <p className="text-text-secondary mt-2">Prueba con otra palabra clave o explora la galería completa.</p>
                    </div>
                )}
                
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-12">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-text-secondary">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoGalleryModule;
