import React from 'react';
import type { FundingOpportunity } from '../types';
import { TrophyIcon } from './icons';

interface FundingModuleProps {
    fundingOpportunities: FundingOpportunity[];
    onBack: () => void;
    onSelectFunding: (funding: FundingOpportunity) => void;
}

const FundingCard: React.FC<{ item: FundingOpportunity; onSelect: () => void }> = ({ item, onSelect }) => (
    <div 
        onClick={onSelect}
        className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-200 cursor-pointer group hover:border-primary/30"
    >
        <div className="flex-shrink-0 bg-primary/10 p-4 rounded-full">
            <TrophyIcon className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-grow">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <h3 className="font-bold font-serif text-xl text-text-primary">{item.title}</h3>
                <span className={`text-sm font-semibold mt-1 sm:mt-0 px-2.5 py-1 rounded-full ${item.type === 'Fondo' ? 'bg-accent/20 text-green-800' : item.type === 'Beca' ? 'bg-secondary/10 text-secondary' : 'bg-highlight/20 text-yellow-800'}`}>{item.type}</span>
            </div>
            <p className="text-md text-text-secondary">{item.organization}</p>
            <div className="text-sm text-gray-500 mt-2">
                <span className="font-semibold text-primary">Cierra:</span> {item.deadline}
            </div>
        </div>
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors self-start sm:self-center">
            Ver bases
        </a>
    </div>
);


const FundingModule: React.FC<FundingModuleProps> = ({ fundingOpportunities, onBack, onSelectFunding }) => {
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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Fondos y Concursos</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">El listado de becas, premios y fondos para impulsar tu próximo proyecto periodístico.</p>
                </div>

                <div className="bg-gradient-to-r from-secondary to-blue-900 rounded-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-white shadow-lg">
                    <div>
                        <h3 className="font-bold font-serif text-xl text-highlight">¿Conoces otra oportunidad?</h3>
                        <p className="mt-1 text-sm text-blue-300">Ayuda a la comunidad a crecer. Envíanos el dato y lo publicaremos.</p>
                    </div>
                    <a href="#" className="mt-4 sm:mt-0 flex-shrink-0 px-5 py-2 font-bold text-secondary bg-highlight rounded-md hover:bg-yellow-300 transition-colors duration-200 shadow-md">
                        Enviar Oportunidad
                    </a>
                </div>

                <div className="space-y-6">
                    {fundingOpportunities.map(item => (
                        <FundingCard 
                            key={item.id} 
                            item={item} 
                            onSelect={() => onSelectFunding(item)} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FundingModule;