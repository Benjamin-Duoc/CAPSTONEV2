
import React from 'react';
import type { Page } from '../types';
import Logo from './Logo';

interface AboutPageProps {
    onNavigate: (page: Page, subPage?: string) => void;
}


const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-background min-h-screen animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="prose prose-xl max-w-none text-text-secondary">
                        <h1 className="text-3xl lg:text-4xl font-extrabold font-serif text-primary mb-8">Círculo de Periodistas Emprendedores e Innovadores de Chile</h1>
                        
                        <p className="text-justify">
                            El ejercicio del periodismo está cambiando en el mundo. Hoy, las nuevas tecnologías y la cantidad de profesionales disponibles en el mercado -tanto en Chile como en el mundo- han desestabilizado el campo laboral, desafiando a nuestros colegas a mantenerse alerta, competitivos y en permanente formación.
                        </p>
                        
                        <p className="text-justify">
                            El Círculo de Periodistas Emprendedores e Innovadores de Chile (CiPress) propone un cambio de paradigma, en que cada vez menos periodistas dependan exclusivamente de ser contratados por un medio o agencia tradicional, para empezar a ser los gestores de sus propias oportunidades, apalancados en sus múltiples capacidades y confiados en el apoyo que las nuevas tecnologías pueden llegar a ser en sus proyectos.
                        </p>
                        
                        <p className="font-semibold text-text-primary text-justify">
                            El periodismo chileno está emprendiendo. No estás solo en este desafío. Únete al Círculo.
                        </p>
                    </div>

                    <div className="flex justify-center items-center p-8 bg-surface rounded-lg shadow-xl border border-gray-200">
                        <div className="text-center">
                            <Logo onNavigate={onNavigate} className="justify-center" />
                             <div className="mt-8 p-6 border-l-4 border-primary bg-background rounded-r-lg">
                                <p className="text-xl font-serif font-bold text-text-primary leading-tight">Nuestra visión es lograr un cambio de paradigma, en que los periodistas puedan ser gestores de sus propias oportunidades.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center bg-gradient-to-r from-secondary to-blue-900 rounded-lg p-12 text-white shadow-2xl">
                    <h2 className="text-3xl font-bold font-serif">¿Listo para ser parte del cambio?</h2>
                    <p className="mt-2 text-blue-200 max-w-xl mx-auto">Únete a nuestra comunidad de innovadores y empieza a construir el futuro del periodismo hoy.</p>
                     <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); onNavigate('register'); }}
                        className="mt-8 inline-block px-8 py-4 text-lg font-bold text-secondary bg-highlight rounded-md hover:bg-yellow-300 transition-colors duration-200 shadow-lg"
                    >
                        Registrarme
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;