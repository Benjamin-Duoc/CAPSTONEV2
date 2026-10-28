import React, { useState, useMemo } from 'react';
import type { Resource } from '../types';
import { BookmarkIcon, ChevronDownIcon } from './icons';

interface ResourcesModuleProps {
    resources: Resource[];
    onBack: () => void;
}

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    return (
        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group flex flex-col border border-gray-200 hover:border-primary">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase text-primary tracking-wide">{resource.category}</span>
                <BookmarkIcon className="h-6 w-6 text-gray-300 group-hover:text-accent transition-colors" />
            </div>
            <h3 className="font-bold font-serif text-lg text-text-primary mt-2 group-hover:text-primary transition-colors">{resource.name}</h3>
            <p className="text-sm text-text-secondary mt-2 flex-grow">{resource.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-accent group-hover:underline">Visitar recurso &rarr;</p>
            </div>
        </a>
    );
};

const FilterDropdown: React.FC<{ label: string; options: string[]; selected: string; onChange: (value: string) => void }> = ({ label, options, selected, onChange }) => {
    return (
        <div className="relative">
            <select
                className="appearance-none w-full bg-surface border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={selected}
                onChange={(e) => onChange(e.target.value)}
                aria-label={`Filtrar por ${label}`}
            >
                <option value="">Toda {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
        </div>
    );
};

const ResourcesModule: React.FC<ResourcesModuleProps> = ({ resources, onBack }) => {
    const [filters, setFilters] = useState({ category: '', type: '' });

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            return (filters.category ? resource.category === filters.category : true) &&
                   (filters.type ? resource.type === filters.type : true);
        });
    }, [filters, resources]);

    const resourceCategories = [...new Set(resources.map(r => r.category))];
    const resourceTypes = [...new Set(resources.map(r => r.type))];

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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Recursos y Herramientas</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Una selección curada de las mejores herramientas, guías y software para potenciar tu trabajo periodístico.</p>
                </div>

                <div className="bg-surface p-4 rounded-lg shadow-lg mb-8 sticky top-24 z-40 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FilterDropdown label="Categoría" options={resourceCategories} selected={filters.category} onChange={(v) => handleFilterChange('category', v)} />
                        <FilterDropdown label="Tipo" options={resourceTypes} selected={filters.type} onChange={(v) => handleFilterChange('type', v)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResources.map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
                {filteredResources.length === 0 && (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-text-primary">No se encontraron recursos</h3>
                        <p className="text-text-secondary mt-2">Intenta ajustar tus filtros para encontrar lo que buscas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcesModule;