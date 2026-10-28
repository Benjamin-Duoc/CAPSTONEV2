import React, { useState, useMemo } from 'react';
import type { Course } from '../types';
import { StarIcon, ChevronDownIcon } from './icons';

interface CoursesModuleProps {
    courses: Course[];
    onSelectCourse: (course: Course) => void;
    onBack: () => void;
}

export const CourseCard: React.FC<{ course: Course; onSelect: () => void; }> = ({ course, onSelect }) => {
  return (
    <button onClick={onSelect} className="w-full text-left bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col border border-gray-200 hover:border-primary">
      <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-primary tracking-wide">{course.category}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${course.cost === 'Gratis' ? 'bg-green-100 text-green-800' : 'bg-highlight/20 text-yellow-800'}`}>{course.cost}</span>
        </div>
        <h3 className="font-bold font-serif text-lg text-text-primary mt-2 group-hover:text-primary transition-colors flex-grow">{course.title}</h3>
        <div className="flex items-center mt-4 text-sm text-text-secondary">
            <span className={`px-2 py-1 text-xs rounded ${course.level === 'Básico' ? 'bg-secondary/10 text-secondary' : course.level === 'Intermedio' ? 'bg-accent/20 text-green-800' : 'bg-primary/10 text-primary'}`}>{course.level}</span>
            <span className="mx-2">|</span>
            <span>{course.format}</span>
        </div>
        <div className="flex items-center mt-4 text-sm">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(course.rating) ? 'text-highlight' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="ml-2 text-text-secondary">({course.reviewCount} reseñas)</span>
        </div>
      </div>
    </button>
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
                <option value="">Todo {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
        </div>
    );
};


const CoursesModule: React.FC<CoursesModuleProps> = ({ courses, onSelectCourse, onBack }) => {
    const [filters, setFilters] = useState({
        category: '',
        level: '',
        format: '',
        cost: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const courseCategories = [...new Set(courses.map(c => c.category))];
    const courseLevels = ['Básico', 'Intermedio', 'Avanzado', 'Experto'];
    const courseFormats = ['Online', 'Presencial', 'Híbrido'];
    const courseCosts = ['Gratis', '1 a 10.000', '10.000 – 25000', '25000 – 50000', '50000+'];

    const parseCost = (costStr: string): number => {
        if (!costStr) return 0;
        if (costStr.toLowerCase().includes('gratis')) return 0;
        // Extract numbers from string like "$45.000 CLP"
        const cleanStr = costStr.replace(/[^\d]/g, '');
        return parseInt(cleanStr, 10) || 0;
    };

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesCategory = filters.category ? course.category === filters.category : true;
            const matchesLevel = filters.level ? course.level === filters.level : true;
            const matchesFormat = filters.format ? course.format === filters.format : true;
            
            let matchesCost = true;
            if (filters.cost) {
                const costVal = parseCost(course.cost);
                if (filters.cost === 'Gratis') {
                    matchesCost = costVal === 0;
                } else if (filters.cost === '1 a 10.000') {
                    matchesCost = costVal >= 1 && costVal <= 10000;
                } else if (filters.cost === '10.000 – 25000') {
                    matchesCost = costVal > 10000 && costVal <= 25000;
                } else if (filters.cost === '25000 – 50000') {
                    matchesCost = costVal > 25000 && costVal <= 50000;
                } else if (filters.cost === '50000+') {
                    matchesCost = costVal > 50000;
                }
            }

            return matchesCategory && matchesLevel && matchesFormat && matchesCost;
        });
    }, [filters, courses]);


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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Capacitación para Innovar</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Adquiere las herramientas y conocimientos para liderar en la nueva era de las comunicaciones.</p>
                </div>

                <div className="bg-surface p-4 rounded-lg shadow-lg mb-8 sticky top-24 z-40 border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FilterDropdown label="Categoría" options={courseCategories} selected={filters.category} onChange={(v) => handleFilterChange('category', v)} />
                        <FilterDropdown label="Nivel" options={courseLevels} selected={filters.level} onChange={(v) => handleFilterChange('level', v)} />
                        <FilterDropdown label="Formato" options={courseFormats} selected={filters.format} onChange={(v) => handleFilterChange('format', v)} />
                        <FilterDropdown label="Costo" options={courseCosts} selected={filters.cost} onChange={(v) => handleFilterChange('cost', v)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(course => (
                            <CourseCard key={course.id} course={course} onSelect={() => onSelectCourse(course)} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-surface rounded-xl border-2 border-dashed border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-text-primary">No se encontraron cursos</h3>
                            <p className="text-text-secondary mt-2">Intenta ajustar los filtros para encontrar lo que buscas.</p>
                            <button 
                                onClick={() => setFilters({ category: '', level: '', format: '', cost: '' })}
                                className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Limpiar todos los filtros
                            </button>
                        </div>
                    )}
                </div>

                {filteredCourses.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center space-x-4 mt-12">
                        <button
                            onClick={() => {
                                setCurrentPage(prev => prev - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-text-secondary">
                            Página {currentPage} de {Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            onClick={() => {
                                setCurrentPage(prev => prev + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
                {filteredCourses.length === 0 && (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-text-primary">No se encontraron cursos</h3>
                        <p className="text-text-secondary mt-2">Intenta ajustar tus filtros para encontrar lo que buscas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesModule;