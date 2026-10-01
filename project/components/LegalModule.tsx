import React from 'react';
import { ScaleIcon } from './icons';

const LegalModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Asesoría Legal y Ética</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Navega con seguridad los desafíos legales y éticos del periodismo moderno. Un recurso exclusivo y gratuito para suscriptores.</p>
                </div>

                <div className="bg-gradient-to-r from-secondary to-blue-900 rounded-lg p-12 text-center text-white shadow-2xl max-w-4xl mx-auto">
                    <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-6">
                        <ScaleIcon className="h-10 w-10 text-highlight" />
                    </div>
                    <h2 className="text-3xl font-bold font-serif leading-tight">¿Problemas con tópicos de protección de fuente, derecho a la imagen, injurias o deudas personales?</h2>
                    <p className="mt-4 text-blue-200 max-w-2xl mx-auto">
                        Nuestro equipo de asesores legales está disponible para orientar a los suscriptores gratuitos del Círculo. No enfrentes estos desafíos solo.
                    </p>
                    <a 
                        href="#" 
                        className="mt-8 inline-block px-8 py-4 text-lg font-bold text-secondary bg-highlight rounded-md hover:bg-yellow-300 transition-colors duration-200 shadow-lg"
                    >
                        Contactar Asesor Legal
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LegalModule;