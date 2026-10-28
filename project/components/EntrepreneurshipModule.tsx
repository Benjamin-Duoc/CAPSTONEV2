import React from 'react';
import { Entrepreneurship } from '../types';
import { EntrepreneurshipCard } from './EntrepreneurshipCard';
import { ChevronLeftIcon } from './icons';

interface Props {
    entrepreneurships: Entrepreneurship[];
    onBack?: () => void;
}

const EntrepreneurshipModule: React.FC<Props> = ({ entrepreneurships, onBack }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 12;
    const totalPages = Math.ceil(entrepreneurships.length / ITEMS_PER_PAGE);

    const currentItems = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return entrepreneurships.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, entrepreneurships]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl md:text-5xl font-bold font-serif text-slate-800">
                        Pymes Hechas por Periodistas
                    </h1>
                </div>

                {entrepreneurships.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {currentItems.map(ent => (
                                <EntrepreneurshipCard
                                    key={ent.id}
                                    entrepreneurship={ent}
                                    onPortfolioClick={(url) => window.open(url, '_blank')}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-12 mb-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>
                                <span className="text-sm text-slate-500 font-medium">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">Aún no hay emprendimientos registrados en esta categoría.</p>
                    </div>
                )}

                <div className="bg-emerald-50 p-6 rounded-xl mt-12 border border-emerald-100 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-6 relative overflow-hidden shadow-sm">
                    <div className="z-10">
                        <h3 className="font-bold text-xl text-emerald-900 mb-1">¿Tienes un medio, agencia o empresa establecida?</h3>
                        <p className="text-emerald-700">Conecta con clientes y potencia tu emprendimiento dentro de la comunidad de CiPress.</p>
                    </div>
                    <button
                        onClick={() => window.location.hash = '#/dashboard/pyme'}
                        className="z-10 flex-shrink-0 px-8 py-3 font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                    >
                        Sube tu emprendimiento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EntrepreneurshipModule;