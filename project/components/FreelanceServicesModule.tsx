import React, { useMemo, useState } from 'react';
import type { FreelanceService } from '../types';
import { SearchIcon, LinkedInIcon } from './icons';

interface FreelanceServicesModuleProps {
    freelanceServices: FreelanceService[];
    rotationInterval?: number;
    isTabMode?: boolean;
    onBack: () => void;
}

const ServiceCard: React.FC<{ service: FreelanceService }> = ({ service }) => {
    return (
        <div className="bg-surface rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100">
            <div className="relative h-48 overflow-hidden">
                <img src={service.imageUrl} alt={`Imagen de ${service.service}`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm shadow-md">
                    {service.category}
                </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold font-serif text-xl text-text-primary group-hover:text-primary transition-colors line-clamp-2">{service.service}</h3>
                        <p className="text-secondary font-medium mt-1 text-sm">{service.provider}</p>
                    </div>
                </div>
                <p className="text-text-secondary text-base line-clamp-3 mb-6 flex-grow">{service.description}</p>

                <div className="mt-auto space-y-4">
                    <div className="border-t border-gray-100 pt-4"></div>
                    <a
                        href={service.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 bg-[#0077b5] hover:bg-[#005582] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md group/btn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LinkedInIcon className="h-5 w-5 fill-current" />
                        <span>Contactar en LinkedIn</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

const FreelanceServicesModule: React.FC<FreelanceServicesModuleProps> = ({ freelanceServices, rotationInterval, onBack, isTabMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceCurrentPage, setServiceCurrentPage] = useState(1);
    const SERVICES_PER_PAGE = 12;

    const shuffledFreelanceServices = useMemo(() => {
        const intervalMilliseconds = (rotationInterval || 1) * 60 * 60 * 1000;
        const timeSeed = Math.floor(Date.now() / intervalMilliseconds);
        let seed = timeSeed + 1;
        const seededRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        const array = [...freelanceServices];
        let currentIndex = array.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(seededRandom() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }, [freelanceServices, rotationInterval]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) return shuffledFreelanceServices;
        return shuffledFreelanceServices.filter(service =>
            service.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, shuffledFreelanceServices]);

    const totalServicePages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
    const currentServices = useMemo(() => {
        const startIndex = (serviceCurrentPage - 1) * SERVICES_PER_PAGE;
        return filteredServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);
    }, [serviceCurrentPage, filteredServices]);

    const handleServicePageChange = (page: number) => {
        if (page > 0 && page <= totalServicePages) {
            setServiceCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={`${isTabMode ? '' : 'bg-gray-50 min-h-screen'}`}>
            <div className={`${isTabMode ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
                {!isTabMode && (
                    <>
                        <button 
                            onClick={onBack} 
                            className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Directorio de Profesionales</h1>
                            <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Conecta con los mejores freelancers del rubro y potencia tus proyectos.</p>
                        </div>
                    </>
                )}

                <div className="mb-8 relative max-w-3xl mx-auto">
                    <input
                        type="text"
                        placeholder="Buscar por servicio, profesional o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:ring-primary focus:border-primary transition-colors shadow-sm"
                        aria-label="Buscar servicios freelance"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentServices.map(service => <ServiceCard key={service.id} service={service} />)}
                </div>

                {filteredServices.length === 0 && (
                    <div className="text-center py-20 bg-surface rounded-2xl shadow-sm border border-gray-200 mt-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <SearchIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary">No se encontraron profesionales</h3>
                        <p className="text-text-secondary mt-2 text-lg">Intenta con otra palabra clave o categoría.</p>
                    </div>
                )}

                {totalServicePages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-16">
                        <button
                            onClick={() => handleServicePageChange(serviceCurrentPage - 1)}
                            disabled={serviceCurrentPage === 1}
                            className="px-6 py-3 bg-surface border-2 border-gray-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Anterior
                        </button>
                        <span className="text-sm font-semibold text-text-secondary bg-gray-100 px-4 py-2 rounded-lg">
                            Página {serviceCurrentPage} de {totalServicePages}
                        </span>
                        <button
                            onClick={() => handleServicePageChange(serviceCurrentPage + 1)}
                            disabled={serviceCurrentPage === totalServicePages}
                            className="px-6 py-3 bg-surface border-2 border-gray-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreelanceServicesModule;
