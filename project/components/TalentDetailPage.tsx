import React from 'react';
import type { TalentProfile } from '../types';
import { LinkedInIcon, EnvelopeIcon, MapPinIcon, BriefcaseIcon, StarIcon, AcademicCapIcon, UserIcon } from './icons';

interface TalentDetailPageProps {
    profile: TalentProfile;
    onBack: () => void;
}

const TalentDetailPage: React.FC<TalentDetailPageProps> = ({ profile, onBack }) => {
    // Helper to normalize skills array
    const skills = Array.isArray(profile.skills) 
        ? profile.skills 
        : (typeof profile.skills === 'string' ? JSON.parse(profile.skills) : []);

    return (
        <div className="bg-background min-h-screen animate-fade-in pb-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Standardized Back Button */}
                <button 
                    onClick={onBack} 
                    className="flex items-center text-[#F5A623] font-bold mb-8 hover:translate-x-[-4px] transition-all group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-xl">Volver</span>
                </button>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                        
                        {/* Profile Sidebar (Left on MD+) */}
                        <div className="md:w-1/3 bg-gray-50 p-8 text-center border-r border-gray-100">
                            <div className="relative inline-block">
                                <img 
                                    src={profile.avatarUrl} 
                                    alt={profile.name} 
                                    className="w-48 h-48 rounded-full object-cover border-8 border-white shadow-xl mx-auto"
                                />
                                {profile.isPremium && (
                                    <div className="absolute bottom-4 right-4 bg-orange-500 text-white p-2 rounded-full shadow-lg">
                                        <StarIcon className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                            
                            <h1 className="mt-6 text-3xl font-black text-text-primary leading-tight uppercase font-serif">{profile.name}</h1>
                            <p className="mt-2 text-primary font-bold text-lg">{profile.title}</p>
                            
                            <div className="mt-8 space-y-4">
                                <a 
                                    href={profile.linkedinUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-full py-4 px-6 bg-[#0077B5] text-white font-bold rounded-2xl hover:bg-[#005E92] transition-all shadow-lg shadow-[#0077B5]/20 flex items-center justify-center space-x-3"
                                >
                                    <LinkedInIcon className="h-5 w-5" />
                                    <span>LINKEDIN</span>
                                </a>
                                
                                <a 
                                    href={`mailto:${profile.email || 'contacto@cipress.cl'}`} 
                                    className="w-full py-4 px-6 bg-white border-2 border-primary text-primary font-bold rounded-2xl hover:bg-orange-50 transition-all flex items-center justify-center space-x-3"
                                >
                                    <EnvelopeIcon className="h-5 w-5" />
                                    <span>CONTACTO DIRECTO</span>
                                </a>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-200 text-left space-y-6">
                                <div className="flex items-center text-text-secondary">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-black text-gray-400">Región</p>
                                        <p className="font-bold text-text-primary">{profile.region}</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-text-secondary">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-4">
                                        <BriefcaseIcon className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-black text-gray-400">Disponibilidad</p>
                                        <p className="font-bold text-text-primary">{profile.availability}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content (Right on MD+) */}
                        <div className="md:w-2/3 p-8 md:p-12">
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-text-primary font-serif uppercase tracking-tight flex items-center">
                                    <UserIcon className="h-7 w-7 mr-3 text-primary" />
                                    Sobre el Talento
                                </h2>
                                <div className="mt-4 h-1 w-20 bg-primary rounded-full"></div>
                                <p className="mt-6 text-text-secondary text-lg leading-relaxed italic">
                                    "Apasionado por la innovación en medios y el periodismo de datos. Con {profile.experienceYears} años de experiencia, busco transformar la narrativa tradicional en experiencias digitales memorables."
                                </p>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-text-primary font-serif uppercase tracking-tight flex items-center">
                                    <StarIcon className="h-7 w-7 mr-3 text-secondary" />
                                    Habilidades Destacadas
                                </h2>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {skills.map((skill: string, index: number) => (
                                        <span 
                                            key={index}
                                            className="px-5 py-2 bg-secondary/10 text-secondary border-2 border-secondary/20 font-black rounded-xl text-sm"
                                        >
                                            {skill.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center mb-2">
                                        <AcademicCapIcon className="h-6 w-6 text-primary mr-2" />
                                        <h3 className="font-black text-text-primary uppercase text-sm">Experiencia</h3>
                                    </div>
                                    <p className="text-3xl font-black text-secondary">{profile.experienceYears} Años</p>
                                    <p className="text-xs text-text-secondary uppercase font-bold mt-1 tracking-widest">En el área</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center mb-2">
                                        <span className="text-primary text-xl font-black mr-2">$</span>
                                        <h3 className="font-black text-text-primary uppercase text-sm">Expectativa Salarial</h3>
                                    </div>
                                    <p className="text-3xl font-black text-secondary whitespace-nowrap">{profile.expectedSalary}</p>
                                    <p className="text-xs text-text-secondary uppercase font-bold mt-1 tracking-widest">Mensual aproximado</p>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-3xl border-2 border-dashed border-primary/20">
                                <p className="text-center text-text-secondary">
                                    <span className="font-black text-primary uppercase text-xs block mb-2 tracking-widest">¡Ojo!</span>
                                    Al contratar a este profesional, estás apoyando al ecosistema de medios independientes en Chile.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TalentDetailPage;
