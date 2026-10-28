import React from 'react';
import type { Course } from '../types';
import { AcademicCapIcon, CalendarIcon, StarIcon, TwitterIcon, FacebookIcon, LinkedInIcon } from './icons';

interface CourseDetailPageProps {
    course: Course;
    onBack: () => void;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ course, onBack }) => {

    const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-primary">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-text-secondary">{label}</p>
                <p className="font-bold text-text-primary">{value}</p>
            </div>
        </div>
    );

    const getActionButton = () => {
        const now = new Date();
        const enrollmentEnd = new Date(course.enrollmentEndDate);
        const courseStart = new Date(course.courseStartDate);
        
        if (now > enrollmentEnd && now < courseStart) {
            return (
                 <button disabled className="w-full mt-6 px-6 py-4 text-base font-bold text-white bg-gray-400 rounded-md cursor-not-allowed">
                    Inscripciones Cerradas
                </button>
            )
        }
        
        if (now > courseStart) {
            return (
                 <a href={course.accessLink} target="_blank" rel="noopener noreferrer" className="block text-center w-full mt-6 px-6 py-4 text-base font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-lg">
                    Acceder al Curso
                </a>
            )
        }
        
        return (
            <a href="#" className="block text-center w-full mt-6 px-6 py-4 text-base font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-primary/20">
                Inscribirse Ahora
            </a>
        )
    };

    return (
        <div className="bg-background animate-fade-in">
            {/* Hero Section */}
            <div className="relative h-96 bg-gray-800">
                <img src={course.imageUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
                    <button 
                        onClick={onBack} 
                        className="absolute top-8 flex items-center text-white font-bold bg-black/30 px-4 py-2 rounded-full hover:bg-black/50 hover:translate-x-[-4px] transition-all group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                    <span className="text-base font-bold uppercase tracking-wider text-accent">{course.category}</span>
                    <h1 className="text-4xl md:text-6xl font-black font-serif text-white mt-2 shadow-text">{course.title}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold font-serif text-text-primary mb-4 border-b-2 border-primary pb-2">Sobre este curso</h2>
                            <p className="text-lg text-text-secondary leading-relaxed">{course.description}</p>
                        </section>
                        
                        <section className="mb-10">
                            <h2 className="text-3xl font-bold font-serif text-text-primary mb-4 border-b-2 border-primary pb-2">¿Qué aprenderás?</h2>
                            <ul className="space-y-3">
                                {Array.isArray(course.topics) && course.topics.map((topic, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-lg text-text-secondary">{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                         <section>
                            <h2 className="text-3xl font-bold font-serif text-text-primary mb-4 border-b-2 border-primary pb-2">Instructor</h2>
                             <div className="bg-surface p-6 rounded-lg flex items-center space-x-6 border border-gray-200">
                                <img src={course.instructorAvatarUrl} alt={course.instructorName} className="w-24 h-24 rounded-full object-cover" />
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary">{course.instructorName}</h3>
                                    <p className="text-md font-semibold text-primary">{course.instructorTitle}</p>
                                </div>
                            </div>
                        </section>

                    </div>
                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-24 bg-surface p-6 rounded-lg shadow-lg border border-gray-200">
                            <h3 className="text-4xl font-black font-serif text-text-primary text-center">{course.cost}</h3>
                            <p className="text-sm text-text-secondary text-center mb-6">Un solo pago, acceso para siempre.</p>
                            
                            {getActionButton()}

                            <div className="space-y-5 mt-6 pt-6 border-t border-gray-200">
                                <InfoItem icon={<CalendarIcon className="h-6 w-6" />} label="Duración" value={course.duration} />
                                <InfoItem icon={<AcademicCapIcon className="h-6 w-6" />} label="Nivel" value={course.level} />
                                <InfoItem icon={<StarIcon className="h-6 w-6" />} label="Modalidad" value={course.format} />
                                <InfoItem icon={<CalendarIcon className="h-6 w-6" />} label="Inscripciones" value={`Hasta el ${new Date(course.enrollmentEndDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`} />
                                <InfoItem icon={<CalendarIcon className="h-6 w-6" />} label="Inicio de Clases" value={new Date(course.courseStartDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 text-center">Comparte este curso</h4>
                                <div className="flex justify-center space-x-4 mt-3">
                                    <a href="#" aria-label="Compartir en Twitter" className="text-gray-400 hover:text-gray-800 transition-colors"><TwitterIcon className="h-6 w-6" /></a>
                                    <a href="#" aria-label="Compartir en Facebook" className="text-gray-400 hover:text-blue-600 transition-colors"><FacebookIcon className="h-6 w-6" /></a>
                                    <a href="#" aria-label="Compartir en LinkedIn" className="text-gray-400 hover:text-blue-700 transition-colors"><LinkedInIcon className="h-6 w-6" /></a>
                                </div>
                            </div>
                        </div>
                    </aside>
                 </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;