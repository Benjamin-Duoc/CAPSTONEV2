import React, { useEffect, useState } from 'react';
import type { Job, JobTalentMatchCandidate, JobTalentMatchResult } from '../types';
import { runJobToTalentsMatchmaking } from '../utils/db';
import {
    SparklesIcon,
    XMarkIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    MapPinIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import { LinkedInIcon } from './icons';

interface JobMatchmakingModalProps {
    isOpen: boolean;
    job: Job | null;
    onClose: () => void;
}

export const JobMatchmakingModal: React.FC<JobMatchmakingModalProps> = ({ isOpen, job, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<JobTalentMatchResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !job) {
            setResult(null);
            setErrorMessage(null);
            return;
        }

        const fetchMatches = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const res = await runJobToTalentsMatchmaking(job);
                if (res && res.matches) {
                    setResult(res);
                } else {
                    setErrorMessage('No se encontraron candidatos disponibles en el Banco de Talentos en este momento.');
                }
            } catch (err) {
                console.error('Error fetching job matches:', err);
                setErrorMessage('Hubo un problema al conectar con el motor de emparejamiento con IA.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, [isOpen, job]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !job) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex justify-center items-center p-4 overflow-y-auto animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 md:p-8">
                {/* Botón Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Cerrar modal"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Cabecera */}
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                        <SparklesIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            CiPress • Matchmaking Editorial con IA
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900 leading-tight">
                            Candidatos Compatibles
                        </h2>
                    </div>
                </div>

                {/* Resumen de la Oferta Laboral */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                            <h3 className="font-bold text-gray-900 font-serif text-base">{job.title}</h3>
                            <p className="text-xs text-primary font-semibold">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                                <BriefcaseIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                {job.area}
                            </span>
                            <span className="inline-flex items-center bg-white px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                                <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                {job.location}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Estado: Cargando */}
                {isLoading && (
                    <div className="py-16 text-center space-y-4">
                        <div className="inline-flex p-4 rounded-full bg-orange-50 text-primary animate-pulse">
                            <SparklesIcon className="w-8 h-8 animate-spin" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Analizando la Base de Talentos...</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            CiPress IA está evaluando habilidades, experiencia, ubicación y afinidad temática con la vacante.
                        </p>
                    </div>
                )}

                {/* Estado: Error o Vacío */}
                {!isLoading && errorMessage && (
                    <div className="py-10 text-center space-y-3">
                        <p className="text-gray-600 text-sm">{errorMessage}</p>
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {/* Estado: Resultados */}
                {!isLoading && result && (
                    <div className="space-y-6">
                        {/* Resumen del Algoritmo */}
                        <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex items-start space-x-3">
                            <SparklesIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                                {result.summary}
                            </p>
                        </div>

                        {/* Lista de Candidatos */}
                        <div className="space-y-4">
                            {result.matches.map((candidate: JobTalentMatchCandidate) => {
                                const emailSubject = encodeURIComponent(`CiPress - Oportunidad Laboral: ${job.title} en ${job.company}`);
                                const emailBody = encodeURIComponent(
                                    `Hola ${candidate.name},\n\nTe contacto desde CiPress con respecto a la oportunidad laboral de "${job.title}" en "${job.company}".\n\nTu perfil en el Banco de Talentos fue seleccionado con un ${candidate.matchPercentage}% de afinidad para este cargo.\n\n¿Tienes disponibilidad para conversar más detalles?\n\nSaludos cordiales,\n${job.company}`
                                );
                                const mailtoUrl = `mailto:${candidate.email || job.applyEmail}?subject=${emailSubject}&body=${emailBody}`;

                                return (
                                    <div 
                                        key={candidate.talentId}
                                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={candidate.avatarUrl || `https://i.pravatar.cc/150?u=${candidate.talentId}`}
                                                    alt={candidate.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-base">{candidate.name}</h4>
                                                        {candidate.isPremium && (
                                                            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                                                <StarIcon className="w-3 h-3 mr-1 text-primary" />
                                                                VIP
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-primary font-medium">{candidate.title}</p>
                                                </div>
                                            </div>

                                            {/* Badge de Afinidad */}
                                            <div className="self-start sm:self-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                                                    candidate.matchPercentage >= 85
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    {candidate.matchPercentage}% de Afinidad
                                                </span>
                                            </div>
                                        </div>

                                        {/* Datos Rápidos */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            {candidate.region && (
                                                <span className="flex items-center">
                                                    <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                    {candidate.region}
                                                </span>
                                            )}
                                            {candidate.experienceYears !== undefined && candidate.experienceYears > 0 && (
                                                <span className="flex items-center">
                                                    <AcademicCapIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                    {candidate.experienceYears} años de exp.
                                                </span>
                                            )}
                                            {candidate.availability && (
                                                <span className="flex items-center">
                                                    <BriefcaseIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                    {candidate.availability}
                                                </span>
                                            )}
                                        </div>

                                        {/* Motivos de Afinidad */}
                                        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Por qué calza con la vacante:
                                            </span>
                                            {candidate.matchReasons.map((reason, idx) => (
                                                <div key={idx} className="flex items-start text-xs text-gray-700">
                                                    <span className="text-primary mr-1.5 font-bold">•</span>
                                                    <span>{reason}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Botones de Contacto */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <a
                                                href={mailtoUrl}
                                                className="flex-1 min-w-[140px] px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <EnvelopeIcon className="w-4 h-4" />
                                                <span>Contactar por Email</span>
                                            </a>
                                            {candidate.linkedinUrl && (
                                                <a
                                                    href={candidate.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-[#0077B5] hover:bg-[#005E92] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    <LinkedInIcon className="w-4 h-4" />
                                                    <span>LinkedIn</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer informativo */}
                        <div className="pt-2 text-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobMatchmakingModal;

