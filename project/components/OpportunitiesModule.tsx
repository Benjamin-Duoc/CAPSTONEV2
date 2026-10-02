import React, { useState, useMemo, useEffect } from 'react';
import type { Page, User, Job, TalentProfile, FreelanceService } from '../types';
import { BriefcaseIcon, MapPinIcon, LightBulbIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { LinkedInIcon, EnvelopeIcon } from './icons';
import { getTalentProfiles, getFreelanceServices } from '../utils/db';
import FreelanceServicesModule from './FreelanceServicesModule';

interface OpportunitiesModuleProps {
    jobs: Job[];
    onSelectJob: (job: Job) => void;
    initialTab?: string;
    currentUser: User | null;
    onNavigate: (page: Page, subPage?: string) => void;
    rotationInterval: number;
    onSelectTalent: (profile: TalentProfile) => void;
    onBack: () => void;
}

type Tab = 'jobs' | 'talents' | 'freelance';

interface LoginGuardModalProps {
    onClose: () => void;
    onNavigate: (page: Page) => void;
}

const LoginGuardModal: React.FC<LoginGuardModalProps> = ({ onClose, onNavigate }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100] p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-4">
                    <StarIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Destaca tu talento en CiPress! 🚀</h3>
                <p className="text-gray-600 mb-8">Para aparecer en nuestra base de talentos y que las empresas te contacten, necesitas una cuenta de Colaborador. ¡Es gratis!</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => onNavigate('register')}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                    >
                        Crear mi cuenta gratis
                    </button>
                    <button 
                        onClick={() => onNavigate('login')}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Ya tengo cuenta (Ingresar)
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const JobCard: React.FC<{ job: Job; onSelect: () => void }> = ({ job, onSelect }) => (
    <button onClick={onSelect} className="w-full text-left bg-surface p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-200 group">
        <img src={job.logoUrl} alt={`${job.company} logo`} className="w-16 h-16 rounded-full flex-shrink-0 object-cover border-2 border-gray-200" />
        <div className="flex-grow">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <h3 className="font-bold font-serif text-xl text-text-primary group-hover:text-primary transition-colors">{job.title}</h3>
                <span className="text-sm text-highlight font-semibold mt-1 sm:mt-0">{job.date}</span>
            </div>
            <p className="text-md text-text-secondary">{job.company}</p>
            <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                <div className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1" /><span>{job.location}</span></div>
                <div className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1" /><span>{job.type}</span></div>
            </div>
        </div>
        <div className="self-start sm:self-center flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md group-hover:bg-orange-600 transition-colors">
            Ver Detalles
        </div>
    </button>
);

const TalentProfileCard: React.FC<{ profile: TalentProfile; onSelect: () => void }> = ({ profile, onSelect }) => (
    <div className="bg-surface rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col items-center relative group hover:border-primary/30 overflow-hidden">
        {/* Clickable Area for Detail */}
        <div 
            onClick={onSelect}
            className="w-full p-5 flex flex-col items-center text-center cursor-pointer"
        >
            {profile.isPremium && (
                <div className="absolute top-2 right-2">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center">
                        <StarIcon className="h-3 w-3 mr-1" />
                        PREMIUM
                    </span>
                </div>
            )}
            <img src={profile.avatarUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            <h3 className="font-bold text-lg text-text-primary mt-3">{profile.name}</h3>
            <p className="text-sm text-primary font-semibold text-center h-10">{profile.title}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {(Array.isArray(profile.skills) 
                    ? profile.skills 
                    : (typeof profile.skills === 'string' ? JSON.parse(profile.skills) : [])
                ).map((skill: string, index: number) => (
                    <span key={index} className="text-[10px] font-bold bg-secondary/5 text-secondary border border-secondary/10 px-2 py-0.5 rounded-md">{skill}</span>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 w-full text-xs text-text-secondary space-y-1">
                <div className="flex justify-between px-1">
                    <span>Disponibilidad:</span>
                    <span className="font-semibold text-text-primary">{profile.availability}</span>
                </div>
                {profile.isPremium ? (
                    <div className="flex justify-between px-1">
                        <span>Experiencia:</span>
                        <span className="font-semibold text-text-primary">{profile.experienceYears} años</span>
                    </div>
                ) : (
                    <div className="text-center py-1 bg-gray-50 rounded mt-2 text-[10px] italic text-gray-400">
                        Info. adicional solo para Premium
                    </div>
                )}
            </div>
        </div>

        {/* Buttons Area (Separate from Detail Click) */}
        <div className="w-full px-5 pb-5 flex flex-col space-y-2">
            <a 
                href={profile.linkedinUrl || "https://www.linkedin.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full px-4 py-2 text-xs font-bold text-white bg-[#0077B5] rounded-md hover:bg-[#005E92] transition-colors flex items-center justify-center space-x-2 shadow-sm z-10"
            >
                <LinkedInIcon className="h-4 w-4" />
                <span>LinkedIn</span>
            </a>
            
            <a 
                href={`mailto:${profile.email || 'contacto@cipress.cl'}`} 
                className="w-full px-4 py-2 text-xs font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 shadow-sm z-10"
            >
                <EnvelopeIcon className="h-4 w-4" />
                <span>Email</span>
            </a>
        </div>
    </div>
);

const OpportunitiesModule: React.FC<OpportunitiesModuleProps> = ({ 
    jobs, onSelectJob, initialTab, currentUser, onNavigate, rotationInterval, onSelectTalent, onBack 
}) => {
    const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'jobs');
    const [isLoginGuardOpen, setIsLoginGuardOpen] = useState(false);
    const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
    const [freelanceServices, setFreelanceServices] = useState<FreelanceService[]>([]);
    const [loading, setLoading] = useState(false);

    // Load talent profiles locally to avoid prop drilling and ensure data is fresh
    useEffect(() => {
        const loadTalents = async () => {
            setLoading(true);
            try {
                const refreshed = await getTalentProfiles();
                setTalentProfiles(refreshed);
                const services = await getFreelanceServices();
                setFreelanceServices(services);
            } catch (error) {
                console.error("Error fetching data for opportunities:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTalents();
    }, []);

    // Talent Pagination
    const [talentCurrentPage, setTalentCurrentPage] = useState(1);
    const TALENTS_PER_PAGE = 12;

    const shuffledTalentProfiles = useMemo(() => {
        const intervalMilliseconds = (rotationInterval || 1) * 60 * 60 * 1000;
        const timeSeed = Math.floor(Date.now() / intervalMilliseconds);

        const seededShuffle = (array: TalentProfile[], currentSeed: number) => {
            let s = currentSeed;
            const seededRandom = () => {
                const x = Math.sin(s++) * 10000;
                return x - Math.floor(x);
            };

            const shuffled = [...array];
            let currentIndex = shuffled.length;
            let randomIndex;

            while (currentIndex !== 0) {
                randomIndex = Math.floor(seededRandom() * currentIndex);
                currentIndex--;
                [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
            }
            return shuffled;
        };

        const premiumProfiles = talentProfiles.filter(p => p.isPremium);
        const standardProfiles = talentProfiles.filter(p => !p.isPremium);

        return [
            ...seededShuffle(premiumProfiles, timeSeed),
            ...seededShuffle(standardProfiles, timeSeed)
        ];
    }, [talentProfiles, rotationInterval]);

    const totalTalentPages = Math.ceil(shuffledTalentProfiles.length / TALENTS_PER_PAGE);

    const currentTalentProfiles = useMemo(() => {
        const startIndex = (talentCurrentPage - 1) * TALENTS_PER_PAGE;
        return shuffledTalentProfiles.slice(startIndex, startIndex + TALENTS_PER_PAGE);
    }, [talentCurrentPage, shuffledTalentProfiles]);

    const handleTalentPageChange = (page: number) => {
        if (page > 0 && page <= totalTalentPages) {
            setTalentCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCreateProfileClick = () => {
        if (!currentUser) {
            setIsLoginGuardOpen(true);
        } else {
            // Redirect to dashboard, specifically to the talent section
            onNavigate('dashboard', 'talent');
        }
    };



    const renderContent = () => {
        switch (activeTab) {
            case 'jobs':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif text-text-primary">Oportunidades Laborales</h2>
                            <p className="text-text-secondary mt-1">Encuentra tu próximo desafío profesional en el sector.</p>
                        </div>
                        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 rounded-2xl text-center border-2 border-primary/20 shadow-inner group">
                            <p className="text-lg text-text-primary flex flex-col sm:flex-row items-center justify-center gap-2">
                                <span className="font-medium">¿Quieres publicar una vacante?</span>
                                <span>Envía tu aviso a </span>
                                <a 
                                    href="mailto:contacto@cipress.cl" 
                                    className="font-black text-primary hover:text-orange-600 transition-colors underline decoration-2 underline-offset-4 decoration-primary/30"
                                >
                                    contacto@cipress.cl
                                </a>
                            </p>
                        </div>
                        {jobs.map(job => <JobCard key={job.id} job={job} onSelect={() => onSelectJob(job)} />)}
                    </div>
                );
            case 'talents':
                return (
                    <div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif text-text-primary">Base de Datos de Talentos</h2>
                            <p className="text-text-secondary mt-1">Crea tu perfil y deja que los reclutadores te encuentren.</p>
                        </div>
                        <div className="bg-secondary/10 border-l-4 border-secondary text-secondary p-4 rounded-r-lg my-8 flex items-start" role="alert">
                            <div className="flex-shrink-0">
                                <LightBulbIcon className="h-6 w-6 text-secondary" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-base font-bold text-secondary">¡Mantén tu perfil visible!</h3>
                                <p className="text-sm mt-1 text-blue-900">
                                    Para que nuestro algoritmo te considere activamente en las búsquedas, es importante que actualices tus antecedentes al menos cada 3 meses.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-secondary to-blue-900 rounded-lg p-6 my-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-white shadow-lg">
                            <div>
                                <h3 className="font-bold font-serif text-xl text-highlight">¿Buscas tu próxima oportunidad?</h3>
                                <p className="mt-1 text-sm text-blue-300">Crea tu perfil en nuestra base de talentos. Es un beneficio gratuito para suscriptores.</p>
                            </div>
                            <button onClick={handleCreateProfileClick} className="mt-4 sm:mt-0 flex-shrink-0 px-5 py-2 font-bold text-secondary bg-highlight rounded-md hover:bg-yellow-300 transition-colors duration-200 shadow-md">
                                Crear mi Perfil
                            </button>
                        </div>
                        {loading && (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        )}
                        {!loading && currentTalentProfiles.length === 0 && (
                            <p className="text-center py-12 text-gray-500 italic">No hay perfiles disponibles en el banco de talentos.</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentTalentProfiles.map(profile => (
                                <TalentProfileCard 
                                    key={profile.id} 
                                    profile={profile} 
                                    onSelect={() => onSelectTalent(profile)} 
                                />
                            ))}
                        </div>
                        {totalTalentPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-12">
                                <button
                                    onClick={() => handleTalentPageChange(talentCurrentPage - 1)}
                                    disabled={talentCurrentPage === 1}
                                    className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <span className="text-sm text-text-secondary">
                                    Página {talentCurrentPage} de {totalTalentPages}
                                </span>
                                <button
                                    onClick={() => handleTalentPageChange(talentCurrentPage + 1)}
                                    disabled={talentCurrentPage === totalTalentPages}
                                    className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'freelance':
                return (
                    <div>
                        <FreelanceServicesModule freelanceServices={freelanceServices} rotationInterval={rotationInterval} onBack={onBack} isTabMode={true} />
                    </div>
                );
        }
    };

    const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary hover:bg-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-neutral min-h-screen">
            <div className="container mx-auto px-4 md:px-8 py-10">
                
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Oportunidades y Conexiones</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">El núcleo para conectar la oferta y la demanda de talento periodístico innovador.</p>
                </div>

                <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-8">
                    <TabButton tabName="jobs" label="Oportunidades Laborales" />
                    <TabButton tabName="talents" label="Base de Talentos" />
                    <TabButton tabName="freelance" label="Servicios Freelance" />
                </div>

                <div>
                    {renderContent()}
                </div>
            </div>
            {isLoginGuardOpen && <LoginGuardModal onClose={() => setIsLoginGuardOpen(false)} onNavigate={onNavigate} />}
        </div>
    );
};

export default OpportunitiesModule;