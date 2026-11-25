import React, { useState } from 'react';
import type { Job, User } from '../types';
import { BriefcaseIcon, MapPinIcon } from './icons';
import { SparklesIcon } from '@heroicons/react/24/solid';
import JobMatchmakingModal from './JobMatchmakingModal';
import { isAdminUser } from '../utils/roleUtils';

interface JobDetailPageProps {
    job: Job;
    currentUser?: User | null;
    onBack: () => void;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, currentUser, onBack }) => {
    const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);

    // Solo el creador de la vacante o administradores pueden ver los candidatos compatibles con IA
    const isJobOwnerOrAdmin = Boolean(
        currentUser && (
            isAdminUser(currentUser) || 
            (job.userId && currentUser.id === job.userId) || 
            (job.authorUserId && currentUser.id === job.authorUserId) ||
            (job.applyEmail && currentUser.email?.toLowerCase() === job.applyEmail?.toLowerCase())
        )
    );

    return (
        <div className="bg-background animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <button 
                        onClick={onBack} 
                        className="flex items-center text-primary font-bold hover:translate-x-[-4px] transition-transform group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>

                    {isJobOwnerOrAdmin && (
                        <button
                            onClick={() => setIsMatchmakingOpen(true)}
                            className="self-start sm:self-auto px-4 py-2.5 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                            title="Evaluar base de talentos para este cargo"
                        >
                            <SparklesIcon className="w-4 h-4 text-white" />
                            <span>Matchmaking de Candidatos con IA</span>
                        </button>
                    )}
                </div>

                <div className="bg-surface p-8 rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row items-start md:space-x-8">
                        <img src={job.logoUrl} alt={`${job.company} logo`} className="w-24 h-24 rounded-full flex-shrink-0 object-cover border-4 border-background mb-4 md:mb-0 shadow-sm" />
                        <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                <div>
                                    <span className="text-sm font-bold uppercase text-accent tracking-wide">{job.area}</span>
                                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-text-primary mt-1">{job.title}</h1>
                                </div>
                                <p className="text-sm text-highlight font-semibold mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">Publicado {job.date}</p>
                            </div>
                            <p className="text-xl text-text-secondary mt-1">{job.company}</p>
                            <div className="flex items-center flex-wrap text-text-secondary mt-3 text-sm">
                                <div className="flex items-center mr-4"><MapPinIcon className="h-4 w-4 mr-1.5" /> {job.location}</div>
                                <div className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1.5" /> {job.type}</div>
                            </div>
                        </div>
                    </div>
                    
                    <hr className="my-8 border-gray-200" />
                    
                    <div>
                        <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Descripción del Cargo</h2>
                        <div className="prose lg:prose-lg max-w-none text-text-secondary">
                            <p className="whitespace-pre-wrap">{job.description}</p>
                        </div>
                    </div>
                     <hr className="my-8 border-gray-200" />
                    <div className="bg-background p-6 rounded-2xl text-center border border-gray-100">
                        <h3 className="font-semibold text-text-primary">¿Interesado/a en esta oportunidad?</h3>
                        <p className="text-text-secondary text-sm mt-1">Envía tu currículum y portafolio a:</p>
                        <a href={`mailto:${job.applyEmail}`} className="text-primary font-bold text-lg hover:underline mt-2 inline-block">{job.applyEmail}</a>
                    </div>
                </div>
            </div>

            <JobMatchmakingModal
                isOpen={isMatchmakingOpen}
                job={job}
                onClose={() => setIsMatchmakingOpen(false)}
            />
        </div>
    );
};

export default JobDetailPage;