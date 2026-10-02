import React, { useState, useMemo } from 'react';
import type { Specialist } from '../types';
import { WhatsAppIcon } from './icons';

interface SpecialistsModuleProps {
    specialists: Specialist[];
    onBack: () => void;
    onSelectSpecialist: (specialist: Specialist) => void;
}

// Reusable card component defined within this module
const SpecialistCard: React.FC<{ specialist: Specialist; onSelect: () => void }> = ({ specialist, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full overflow-hidden group cursor-pointer"
        >
            <div className="relative h-56">
                <img src={specialist.imageUrl} alt={specialist.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-2xl font-bold font-serif" style={{ color: specialist.textColor }}>{specialist.name}</h3>
                    <p className="text-base font-bold" style={{ color: specialist.textColor, opacity: 0.9 }}>{specialist.title}</p>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-text-secondary flex-grow break-words">
                    {specialist.specialtyDescription.length > 130 
                        ? `${specialist.specialtyDescription.substring(0, 130)}...` 
                        : specialist.specialtyDescription}
                </p>
                <a 
                    href={`https://wa.me/${specialist.whatsappContact}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full mt-4 px-4 py-2 text-sm font-bold text-white bg-[#25D366] rounded-md hover:bg-[#1DAE51] transition-colors flex items-center justify-center space-x-2"
                >
                    <WhatsAppIcon className="h-5 w-5" />
                    <span>Contactar</span>
                </a>
            </div>
        </div>
    );
};


const SpecialistsModule: React.FC<SpecialistsModuleProps> = ({ specialists, onBack, onSelectSpecialist }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const sortedSpecialists = useMemo(() => {
        return [...specialists].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }, [specialists]);

    const totalPages = Math.ceil(sortedSpecialists.length / ITEMS_PER_PAGE);

    const currentSpecialists = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedSpecialists.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedSpecialists]);

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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Repositorio de Fuentes Especializadas</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Conecta con expertos y expertas en una amplia gama de temas para enriquecer tus reportajes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentSpecialists.map(specialist => (
                        <SpecialistCard 
                            key={specialist.id} 
                            specialist={specialist} 
                            onSelect={() => onSelectSpecialist(specialist)} 
                        />
                    ))}
                </div>

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

export default SpecialistsModule;