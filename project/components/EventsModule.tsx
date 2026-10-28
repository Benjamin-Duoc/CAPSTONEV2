import React from 'react';
import type { Event } from '../types';
import { CalendarIcon, MapPinIcon } from './icons';

interface EventsModuleProps {
    events: Event[];
    onBack: () => void;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6 border border-gray-200">
        <div className="flex-shrink-0 text-center bg-gray-50 rounded-lg p-4 w-24">
            <p className="text-4xl font-black font-serif text-primary">{event.date.split(' ')[0]}</p>
            <p className="text-lg font-semibold text-text-secondary -mt-1">{event.date.split(' ')[1]}</p>
        </div>
        <div className="flex-grow">
            <span className="text-xs font-bold uppercase text-accent tracking-wide">{event.type}</span>
            <h3 className="font-bold font-serif text-xl text-text-primary mt-1">{event.title}</h3>
            <div className="text-sm text-text-secondary mt-2 space-y-1">
                <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{event.fullDate}</span>
                </div>
                <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                </div>
            </div>
        </div>
        <a href={event.link} target="_blank" rel="noopener noreferrer" className="self-center px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors">
            Inscribirse
        </a>
    </div>
);


const EventsModule: React.FC<EventsModuleProps> = ({ events, onBack }) => {
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
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Agenda de Eventos</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Participa en los webinars, talleres y conferencias que están marcando la pauta en la industria.</p>
                </div>
                
                 <div className="bg-surface rounded-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left shadow-sm border border-gray-200">
                    <div>
                        <h3 className="font-bold font-serif text-xl text-primary">¿Organizas un evento?</h3>
                        <p className="mt-1 text-sm text-text-secondary">Si eres suscriptor gratuito, puedes publicarlo aquí y llegar a toda nuestra comunidad.</p>
                    </div>
                    <a href="#" className="mt-4 sm:mt-0 flex-shrink-0 px-5 py-2 font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors duration-200 shadow-md">
                        Publicar Evento
                    </a>
                </div>

                <div className="space-y-6">
                    {events.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            </div>
        </div>
    );
};

export default EventsModule;