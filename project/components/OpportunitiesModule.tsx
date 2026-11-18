import React, { useState, useMemo, useEffect } from 'react';
import type { Page, User, Job, TalentProfile, FreelanceService, TalentJobMatch, ShortCollaboration, MatchCandidate, MatchmakingResult, TalentCollabMatch } from '../types';
import { 
    BriefcaseIcon, 
    MapPinIcon, 
    LightBulbIcon, 
    StarIcon, 
    XMarkIcon, 
    SparklesIcon, 
    CheckCircleIcon,
    BoltIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon
} from '@heroicons/react/24/solid';
import { 
    ClipboardDocumentIcon, 
    ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import { LinkedInIcon, EnvelopeIcon, WhatsAppIcon } from './icons';
import { 
    getTalentProfiles, 
    getFreelanceServices, 
    getMyTalentProfile, 
    runTalentToJobsMatchmaking,
    runTalentToCollaborationsMatchmaking,
    getShortCollaborations,
    runMatchmaking 
} from '../utils/db';
import FreelanceServicesModule from './FreelanceServicesModule';
import JobMatchmakingModal from './JobMatchmakingModal';
import ShortCollaborationForm from './admin/ShortCollaborationForm';
import CiPressModal, { CiPressModalType } from './common/CiPressModal';

interface OpportunitiesModuleProps {
    jobs: Job[];
    shortCollaborations?: ShortCollaboration[];
    onAddShortCollaboration?: (data: Omit<ShortCollaboration, 'id'>) => Promise<ShortCollaboration>;
    onUpdateShortCollaboration?: (data: ShortCollaboration) => Promise<ShortCollaboration>;
    onDeleteShortCollaboration?: (id: number) => Promise<void>;
    onSelectJob: (job: Job) => void;
    initialTab?: string;
    currentUser: User | null;
    onNavigate: (page: Page, subPage?: string) => void;
    rotationInterval: number;
    onSelectTalent: (profile: TalentProfile) => void;
    onBack: () => void;
}

type Tab = 'jobs' | 'urgentes' | 'talents' | 'freelance';

interface LoginGuardModalProps {
    onClose: () => void;
    onNavigate: (page: Page) => void;
}

const LoginGuardModal: React.FC<LoginGuardModalProps> = ({ onClose, onNavigate }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100] p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-4">
                    <StarIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Destaca tu talento en CiPress! 🚀</h3>
                <p className="text-gray-600 mb-8">Para interactuar, publicar colaboraciones o aparecer en nuestra base de talentos, necesitas una cuenta de Colaborador. ¡Es gratis!</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => onNavigate('register')}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                    >
                        Crear mi cuenta gratis
                    </button>
                    <button 
                        onClick={() => onNavigate('login')}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Ya tengo cuenta (Ingresar)
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const JobCard: React.FC<{ 
    job: Job; 
    currentUser: User | null;
    onSelect: () => void;
    onOpenMatchmaking: (job: Job) => void;
    matchInfo?: TalentJobMatch;
}> = ({ job, currentUser, onSelect, onOpenMatchmaking, matchInfo }) => {
    const isJobOwnerOrAdmin = Boolean(
        currentUser && (
            currentUser.role === 'admin' || 
            (job.userId && currentUser.id === job.userId) || 
            (job.authorUserId && currentUser.id === job.authorUserId) ||
            (job.applyEmail && currentUser.email?.toLowerCase() === job.applyEmail?.toLowerCase())
        )
    );

    return (
        <div className="w-full text-left bg-surface p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 group flex flex-col justify-between space-y-4">
            {/* Match IA Badge si existe recomendación para el postulante */}
            {matchInfo && (
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-start sm:items-center space-x-2.5">
                        <span className="p-1 rounded-lg bg-primary text-white flex-shrink-0 mt-0.5 sm:mt-0">
                            <SparklesIcon className="w-4 h-4" />
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900">
                                    Afinidad con tu Perfil: <span className="text-primary font-black">{matchInfo.matchPercentage}%</span>
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    matchInfo.matchPercentage >= 80 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {matchInfo.compatibilityTier}
                                </span>
                            </div>
                            {matchInfo.matchReasons && matchInfo.matchReasons.length > 0 && (
                                <p className="text-[11px] text-gray-600 mt-1 leading-snug">{matchInfo.matchReasons[0]}</p>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-white px-2.5 py-1 rounded-md border border-orange-200 shadow-2xs self-start sm:self-center">
                        Match IA
                    </span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <img src={job.logoUrl} alt={`${job.company} logo`} className="w-16 h-16 rounded-full flex-shrink-0 object-cover border-2 border-gray-200 shadow-2xs" />
                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <h3 
                            onClick={onSelect}
                            className="font-bold font-serif text-xl text-text-primary group-hover:text-primary transition-colors cursor-pointer"
                        >
                            {job.title}
                        </h3>
                        <span className="text-sm text-highlight font-semibold mt-1 sm:mt-0">{job.date}</span>
                    </div>
                    <p className="text-md text-text-secondary">{job.company}</p>
                    <div className="flex items-center flex-wrap text-sm text-gray-500 mt-2 gap-x-4 gap-y-1">
                        <div className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-gray-400" /><span>{job.location}</span></div>
                        <div className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1 text-gray-400" /><span>{job.type} • {job.area}</span></div>
                    </div>
                </div>
            </div>

            {/* Fila de Acciones */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                {isJobOwnerOrAdmin && (
                    <button
                        type="button"
                        onClick={() => onOpenMatchmaking(job)}
                        className="px-4 py-2 text-xs font-bold text-primary bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                        title="Ver candidatos de la Base de Talentos compatibles con esta vacante con IA"
                    >
                        <SparklesIcon className="w-4 h-4 text-primary" />
                        <span>Candidatos con IA</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={onSelect}
                    className="px-5 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-orange-600 transition-colors shadow-sm active:scale-95 cursor-pointer"
                >
                    Ver Detalles
                </button>
            </div>
        </div>
    );
};

const UrgentCollaborationCard: React.FC<{
    collab: ShortCollaboration;
    currentUser: User | null;
    onMatchmaking: (collab: ShortCollaboration) => void;
    onEdit: (collab: ShortCollaboration) => void;
    onDelete: (id: number) => void;
    matchInfo?: TalentCollabMatch;
}> = ({ collab, currentUser, onMatchmaking, onEdit, onDelete, matchInfo }) => {
    const isOwnerOrAdmin = Boolean(currentUser && (currentUser.id === collab.authorUserId || currentUser.role === 'admin'));

    return (
        <div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 group flex flex-col justify-between space-y-4">
            <div>
                {/* Badge de Afinidad IA si el periodista activó recomendaciones */}
                {matchInfo && (
                    <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-xl p-3 mb-3 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center space-x-2">
                            <span className="p-1 rounded-lg bg-primary text-white flex-shrink-0">
                                <SparklesIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-bold text-gray-900">
                                Afinidad con tu Perfil: <span className="text-primary font-black">{matchInfo.matchPercentage}%</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                matchInfo.matchPercentage >= 80 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {matchInfo.compatibilityTier}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-white px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                            Match IA
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={collab.authorAvatarUrl || `https://i.pravatar.cc/150?u=${collab.id}`} 
                            alt={collab.author} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 shadow-2xs" 
                        />
                        <div>
                            <p className="font-bold text-sm text-text-primary leading-none">{collab.author}</p>
                            <span className="text-[11px] font-semibold text-primary">Busca Colaborador / Colega</span>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-orange-50 border border-orange-200 text-primary text-[10px] font-black uppercase rounded-lg tracking-wider">
                        Urgente
                    </span>
                </div>

                <h3 className="font-bold font-serif text-lg text-text-primary group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {collab.title}
                </h3>

                {matchInfo?.matchReasons && matchInfo.matchReasons.length > 0 && (
                    <p className="text-[11px] text-gray-600 mt-2 leading-relaxed bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                        💡 {matchInfo.matchReasons[0]}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs">
                    <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase">Plazo Máximo</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{collab.deadline}</span>
                        </span>
                    </div>
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-emerald-600 font-semibold block text-[10px] uppercase">Presupuesto</span>
                        <span className="font-black font-serif text-emerald-700 flex items-center gap-1 mt-0.5">
                            <CurrencyDollarIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{collab.budget}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
                {/* Botón de Matchmaking IA (SOLO para el autor de la colaboración o administrador) */}
                {isOwnerOrAdmin && (
                    <button
                        type="button"
                        onClick={() => onMatchmaking(collab)}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Ver candidatos recomendados por IA para tu aviso"
                    >
                        <SparklesIcon className="w-4 h-4 text-white" />
                        <span>🎯 Candidatos Compatibles con IA</span>
                    </button>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                        href={`https://wa.me/${collab.whatsappContact?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi tu encargo urgente "${collab.title}" en CiPress y me gustaría colaborar contigo.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 text-center"
                    >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>Postular / Contactar</span>
                    </a>

                    {isOwnerOrAdmin && (
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => onEdit(collab)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                title="Editar colaboración"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(collab.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar colaboración"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
    jobs, 
    shortCollaborations,
    onAddShortCollaboration,
    onUpdateShortCollaboration,
    onDeleteShortCollaboration,
    onSelectJob, 
    initialTab, 
    currentUser, 
    onNavigate, 
    rotationInterval, 
    onSelectTalent, 
    onBack 
}) => {
    const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'jobs');
    const [isLoginGuardOpen, setIsLoginGuardOpen] = useState(false);
    const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
    const [freelanceServices, setFreelanceServices] = useState<FreelanceService[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados para Colaboraciones Urgentes
    const [collaborations, setCollaborations] = useState<ShortCollaboration[]>(shortCollaborations || []);
    const [isPublishCollabOpen, setIsPublishCollabOpen] = useState(false);
    const [editingCollab, setEditingCollab] = useState<ShortCollaboration | null>(null);

    // Estados para Matchmaking IA de Colaboraciones Urgentes
    const [isCollabMatchOpen, setIsCollabMatchOpen] = useState(false);
    const [selectedCollabForMatch, setSelectedCollabForMatch] = useState<ShortCollaboration | null>(null);
    const [isLoadingCollabMatches, setIsLoadingCollabMatches] = useState(false);
    const [collabMatchResult, setCollabMatchResult] = useState<MatchmakingResult | null>(null);
    const [copiedCandidateId, setCopiedCandidateId] = useState<number | null>(null);

    // Estados para Recomendación IA de Colaboraciones al Periodista ("Recomendar Pautas para Mí")
    const [isMatchingTalentToCollabs, setIsMatchingTalentToCollabs] = useState(false);
    const [talentCollabMatches, setTalentCollabMatches] = useState<Record<number, TalentCollabMatch> | null>(null);
    const [talentCollabSummary, setTalentCollabSummary] = useState<string | null>(null);
    const [isCollabFilterActive, setIsCollabFilterActive] = useState(false);

    // Estados para Matchmaking en Vacantes y Perfiles
    const [selectedMatchJob, setSelectedMatchJob] = useState<Job | null>(null);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [myTalentProfile, setMyTalentProfile] = useState<TalentProfile | null>(null);
    const [isMatchingTalentToJobs, setIsMatchingTalentToJobs] = useState(false);
    const [talentJobMatches, setTalentJobMatches] = useState<Record<number, TalentJobMatch> | null>(null);
    const [talentMatchSummary, setTalentMatchSummary] = useState<string | null>(null);
    const [isTalentFilterActive, setIsTalentFilterActive] = useState(false);

    // Modal institucional CiPress según AGENTS.md
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type?: CiPressModalType;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const showCiPressAlert = (title: string, message: string, type: CiPressModalType = 'info') => {
        setModalConfig({
            isOpen: true,
            type,
            title,
            message,
            confirmText: 'Entendido',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    // Sincronizar colaboraciones si el prop cambia
    useEffect(() => {
        if (shortCollaborations) {
            setCollaborations(shortCollaborations);
        }
    }, [shortCollaborations]);

    // Cargar talentos y servicios
    useEffect(() => {
        const loadTalents = async () => {
            setLoading(true);
            try {
                const refreshed = await getTalentProfiles();
                setTalentProfiles(refreshed);
                const services = await getFreelanceServices();
                setFreelanceServices(services);
                if (!shortCollaborations || shortCollaborations.length === 0) {
                    const collabs = await getShortCollaborations();
                    if (collabs && collabs.length > 0) setCollaborations(collabs);
                }
            } catch (error) {
                console.error("Error fetching data for opportunities:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTalents();
    }, []);

    // Cargar perfil de talento del usuario logueado
    useEffect(() => {
        const loadMyProfile = async () => {
            if (currentUser?.id) {
                try {
                    const profile = await getMyTalentProfile(currentUser.id);
                    setMyTalentProfile(profile);
                } catch (e) {
                    console.error("Error cargando perfil de talento del usuario:", e);
                }
            } else {
                setMyTalentProfile(null);
                setTalentJobMatches(null);
                setIsTalentFilterActive(false);
                setTalentCollabMatches(null);
                setIsCollabFilterActive(false);
            }
        };
        loadMyProfile();
    }, [currentUser]);

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
            onNavigate('dashboard', 'talent');
        }
    };

    // Handlers para Vacantes
    const handleOpenJobMatchmaking = (job: Job) => {
        setSelectedMatchJob(job);
        setIsMatchModalOpen(true);
    };

    const handleToggleTalentMatchmaking = async () => {
        if (!currentUser) {
            setIsLoginGuardOpen(true);
            return;
        }
        if (!myTalentProfile || !myTalentProfile.title) {
            onNavigate('dashboard', 'talent');
            return;
        }

        if (isTalentFilterActive) {
            setIsTalentFilterActive(false);
            return;
        }

        if (talentJobMatches) {
            setIsTalentFilterActive(true);
            return;
        }

        setIsMatchingTalentToJobs(true);
        try {
            const res = await runTalentToJobsMatchmaking(myTalentProfile, jobs);
            if (res && res.matches) {
                const map: Record<number, TalentJobMatch> = {};
                res.matches.forEach(m => {
                    map[m.jobId] = m;
                });
                setTalentJobMatches(map);
                setTalentMatchSummary(res.summary || null);
                setIsTalentFilterActive(true);
            }
        } catch (err) {
            console.error("Error al calcular afinidad con ofertas:", err);
        } finally {
            setIsMatchingTalentToJobs(false);
        }
    };

    const displayedJobs = useMemo(() => {
        if (!isTalentFilterActive || !talentJobMatches) {
            return jobs;
        }
        return [...jobs].sort((a, b) => {
            const scoreA = talentJobMatches[a.id]?.matchPercentage ?? 0;
            const scoreB = talentJobMatches[b.id]?.matchPercentage ?? 0;
            return scoreB - scoreA;
        });
    }, [jobs, isTalentFilterActive, talentJobMatches]);

    const handleToggleTalentCollabMatchmaking = async () => {
        if (!currentUser) {
            setIsLoginGuardOpen(true);
            return;
        }
        if (!myTalentProfile || !myTalentProfile.title) {
            onNavigate('dashboard', 'talent');
            return;
        }

        if (isCollabFilterActive) {
            setIsCollabFilterActive(false);
            return;
        }

        if (talentCollabMatches) {
            setIsCollabFilterActive(true);
            return;
        }

        setIsMatchingTalentToCollabs(true);
        try {
            const res = await runTalentToCollaborationsMatchmaking(myTalentProfile, collaborations);
            if (res && res.matches) {
                const map: Record<number, TalentCollabMatch> = {};
                res.matches.forEach(m => {
                    map[m.collabId] = m;
                });
                setTalentCollabMatches(map);
                setTalentCollabSummary(res.summary || null);
                setIsCollabFilterActive(true);
            }
        } catch (err) {
            console.error("Error al calcular afinidad con colaboraciones:", err);
        } finally {
            setIsMatchingTalentToCollabs(false);
        }
    };

    const displayedCollaborations = useMemo(() => {
        if (!isCollabFilterActive || !talentCollabMatches) {
            return collaborations;
        }
        return [...collaborations].sort((a, b) => {
            const scoreA = talentCollabMatches[a.id]?.matchPercentage ?? 0;
            const scoreB = talentCollabMatches[b.id]?.matchPercentage ?? 0;
            return scoreB - scoreA;
        });
    }, [collaborations, isCollabFilterActive, talentCollabMatches]);

    // Handlers para Colaboraciones Urgentes
    const handleSaveCollaboration = async (data: ShortCollaboration | Omit<ShortCollaboration, 'id'>) => {
        const nameFallback = currentUser 
            ? (`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'Usuario CiPress')
            : 'Usuario CiPress';
        const avatarFallback = currentUser?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser?.id || 1}`;

        const finalData = {
            ...data,
            author: nameFallback,
            authorAvatarUrl: avatarFallback,
            authorUserId: currentUser?.id
        };

        try {
            if ('id' in finalData && onUpdateShortCollaboration) {
                const updated = await onUpdateShortCollaboration(finalData as ShortCollaboration);
                setCollaborations(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else if (onAddShortCollaboration) {
                const created = await onAddShortCollaboration(finalData as Omit<ShortCollaboration, 'id'>);
                setCollaborations(prev => [created, ...prev]);
            }
            setIsPublishCollabOpen(false);
            setEditingCollab(null);
            showCiPressAlert('¡Aviso Publicado!', 'Tu pedido de colaboración urgente ha sido publicado exitosamente.', 'success');
        } catch (error) {
            console.error("Error al guardar colaboración urgente:", error);
            showCiPressAlert('Error al Publicar', 'Hubo un error en el servidor al intentar guardar el aviso.', 'danger');
        }
    };

    const handleDeleteCollaboration = (id: number) => {
        setModalConfig({
            isOpen: true,
            type: 'danger',
            title: '¿Eliminar Colaboración Urgente?',
            message: '¿Estás seguro de que deseas eliminar este aviso? Esta acción es definitiva.',
            confirmText: 'Eliminar Definitivamente',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    if (onDeleteShortCollaboration) {
                        await onDeleteShortCollaboration(id);
                    }
                    setCollaborations(prev => prev.filter(c => c.id !== id));
                    showCiPressAlert('Aviso Eliminado', 'La colaboración urgente ha sido eliminada del tablero.', 'success');
                } catch (err) {
                    showCiPressAlert('Error al Eliminar', 'Hubo un error en el servidor al intentar eliminar la colaboración.', 'danger');
                }
            }
        });
    };

    const handleOpenCollabMatchmaking = async (collab: ShortCollaboration) => {
        setSelectedCollabForMatch(collab);
        setIsCollabMatchOpen(true);
        setIsLoadingCollabMatches(true);
        setCollabMatchResult(null);

        try {
            const res = await runMatchmaking(collab);
            if (res && res.matches) {
                setCollabMatchResult(res);
            } else {
                showCiPressAlert('Matchmaking IA', 'No se encontraron coincidencias automáticas en este momento.', 'info');
            }
        } catch (e) {
            showCiPressAlert('Asistente IA', 'Hubo un error al ejecutar el emparejamiento inteligente.', 'warning');
        } finally {
            setIsLoadingCollabMatches(false);
        }
    };

    const handleCopyWhatsAppMsg = (id: number, message: string) => {
        navigator.clipboard.writeText(message);
        setCopiedCandidateId(id);
        setTimeout(() => setCopiedCandidateId(null), 2500);
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

                        {/* Banner de Matchmaking IA para el Periodista */}
                        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2 text-center md:text-left max-w-xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                                        <SparklesIcon className="w-3.5 h-3.5" />
                                        <span>Motor IA de Recomendación Laboral</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-extrabold font-serif">
                                        {currentUser 
                                            ? (myTalentProfile?.title ? `¡Descubre qué vacantes encajan contigo, ${myTalentProfile.name || currentUser.name}!` : 'Completa tu Perfil de Talento')
                                            : '¿Buscas empleo adaptado a tu especialidad?'}
                                    </h3>
                                    <p className="text-sm text-orange-50 leading-relaxed">
                                        {!currentUser && 'Inicia sesión con tu cuenta de periodista para que nuestro algoritmo IA analice tu trayectoria y priorice las ofertas con mayor compatibilidad editorial.'}
                                        {currentUser && !myTalentProfile?.title && 'Aún no has configurado tu perfil de talento. Configura tus áreas y habilidades para que el algoritmo ordene las ofertas a tu medida.'}
                                        {currentUser && myTalentProfile?.title && (
                                            talentMatchSummary && isTalentFilterActive 
                                                ? talentMatchSummary 
                                                : `Nuestro modelo evaluará tus competencias (${Array.isArray(myTalentProfile.skills) ? myTalentProfile.skills.slice(0, 3).join(', ') : 'periodísticas'}) contra todas las vacantes publicadas.`
                                        )}
                                    </p>
                                </div>

                                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
                                    {!currentUser ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsLoginGuardOpen(true)}
                                            className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
                                        >
                                            <SparklesIcon className="w-4 h-4 text-orange-600" />
                                            <span>Activar Matchmaking IA</span>
                                        </button>
                                    ) : !myTalentProfile?.title ? (
                                        <button
                                            type="button"
                                            onClick={() => onNavigate('dashboard', 'talent')}
                                            className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
                                        >
                                            <span>Configurar Perfil de Talento</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleToggleTalentMatchmaking}
                                            disabled={isMatchingTalentToJobs}
                                            className={`px-6 py-3 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer ${
                                                isTalentFilterActive
                                                    ? 'bg-gray-900 text-white hover:bg-black'
                                                    : 'bg-white text-orange-600 hover:bg-orange-50'
                                            }`}
                                        >
                                            {isMatchingTalentToJobs ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Analizando afinidad...</span>
                                                </>
                                            ) : isTalentFilterActive ? (
                                                <>
                                                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                                    <span>Recomendaciones Activas (Restablecer)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-4 h-4 text-orange-600" />
                                                    <span>Recomendar Empleos para Mí</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
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
                        {displayedJobs.map(job => (
                            <JobCard 
                                key={job.id} 
                                job={job} 
                                currentUser={currentUser}
                                onSelect={() => onSelectJob(job)} 
                                onOpenMatchmaking={handleOpenJobMatchmaking}
                                matchInfo={talentJobMatches?.[job.id]}
                            />
                        ))}
                    </div>
                );

            case 'urgentes':
                return (
                    <div className="space-y-6">
                        {/* Banner de Recomendación IA de Pautas Urgentes para el Periodista */}
                        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2 text-center md:text-left max-w-xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                                        <BoltIcon className="w-3.5 h-3.5 text-yellow-300" />
                                        <span>Despachos y Pautas de Terreno</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-extrabold font-serif">Colaboraciones Urgentes</h2>
                                    <p className="text-sm text-orange-50 leading-relaxed">
                                        {!currentUser && 'Conecta al instante con colegas para asignaciones de última hora. Inicia sesión con tu perfil periodístico para que la IA priorice las pautas afines a tus áreas.'}
                                        {currentUser && !myTalentProfile?.title && 'Configura tu Perfil de Talento para que nuestro algoritmo IA ordene las coberturas según tus áreas y disponibilidad.'}
                                        {currentUser && myTalentProfile?.title && (
                                            talentCollabSummary && isCollabFilterActive
                                                ? talentCollabSummary
                                                : 'Nuestro motor IA evalúa tus competencias para sugerirte las pautas de terreno que mejor encajan con tu perfil.'
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
                                    {/* Botón de Recomendaciones IA para el Periodista */}
                                    {!currentUser ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsLoginGuardOpen(true)}
                                            className="px-5 py-3 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
                                        >
                                            <SparklesIcon className="w-4 h-4 text-orange-600" />
                                            <span>Recomendar Pautas con IA</span>
                                        </button>
                                    ) : !myTalentProfile?.title ? (
                                        <button
                                            type="button"
                                            onClick={() => onNavigate('dashboard', 'talent')}
                                            className="px-5 py-3 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
                                        >
                                            <span>Configurar Perfil de Talento</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleToggleTalentCollabMatchmaking}
                                            disabled={isMatchingTalentToCollabs}
                                            className={`px-5 py-3 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer ${
                                                isCollabFilterActive
                                                    ? 'bg-gray-900 text-white hover:bg-black'
                                                    : 'bg-white text-orange-600 hover:bg-orange-50'
                                            }`}
                                        >
                                            {isMatchingTalentToCollabs ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Analizando afinidad...</span>
                                                </>
                                            ) : isCollabFilterActive ? (
                                                <>
                                                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                                    <span>Recomendaciones Activas (Restablecer)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-4 h-4 text-orange-600" />
                                                    <span>Recomendar Pautas para Mí</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Botón para Publicar Colaboración Urgente */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!currentUser) {
                                                setIsLoginGuardOpen(true);
                                            } else {
                                                setEditingCollab(null);
                                                setIsPublishCollabOpen(true);
                                            }
                                        }}
                                        className="px-5 py-3 bg-orange-700/80 hover:bg-orange-800 text-white border border-white/20 font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
                                    >
                                        <PlusIcon className="w-5 h-5 text-white" />
                                        <span>Publicar Aviso</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {displayedCollaborations.length === 0 ? (
                            <div className="bg-surface border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                                <div className="w-16 h-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BoltIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold font-serif text-gray-800">No hay avisos urgentes activos</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                    ¿Tienes una pauta imprevista o necesitas fotos urgentes de un evento? Publica tu aviso para que los talentos de CiPress te contacten.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!currentUser) setIsLoginGuardOpen(true);
                                        else {
                                            setEditingCollab(null);
                                            setIsPublishCollabOpen(true);
                                        }
                                    }}
                                    className="mt-5 px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                                >
                                    Publicar el primer aviso
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedCollaborations.map(collab => (
                                    <UrgentCollaborationCard
                                        key={collab.id}
                                        collab={collab}
                                        currentUser={currentUser}
                                        onMatchmaking={handleOpenCollabMatchmaking}
                                        onEdit={(collabToEdit) => {
                                            setEditingCollab(collabToEdit);
                                            setIsPublishCollabOpen(true);
                                        }}
                                        onDelete={handleDeleteCollaboration}
                                        matchInfo={talentCollabMatches?.[collab.id]}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'talents':
                return (
                    <div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold font-serif text-text-primary">Base de Datos de Talentos</h2>
                            <p className="text-text-secondary mt-1">Crea tu perfil y deja que los reclutadores te encuentren.</p>
                        </div>

                        {/* Conexión contextual con Colaboraciones Urgentes */}
                        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-5 my-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                            <div className="flex items-center space-x-3 text-center sm:text-left">
                                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                                    <BoltIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">¿Necesitas cubrir una pauta de terreno hoy?</h4>
                                    <p className="text-xs text-gray-600">Publica un encargo urgente y deja que nuestro motor IA te conecte con los mejores talentos disponibles.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('urgentes')}
                                    className="px-4 py-2 bg-white hover:bg-orange-100 text-primary border border-orange-200 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                                >
                                    Ver Urgencias Activas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!currentUser) setIsLoginGuardOpen(true);
                                        else {
                                            setEditingCollab(null);
                                            setIsPublishCollabOpen(true);
                                        }
                                    }}
                                    className="px-4 py-2 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    <span>Publicar Aviso</span>
                                </button>
                            </div>
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
                            <button onClick={handleCreateProfileClick} className="mt-4 sm:mt-0 flex-shrink-0 px-5 py-2 font-bold text-secondary bg-highlight rounded-md hover:bg-yellow-300 transition-colors duration-200 shadow-md cursor-pointer">
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
                                    className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Anterior
                                </button>
                                <span className="text-sm text-text-secondary">
                                    Página {talentCurrentPage} de {totalTalentPages}
                                </span>
                                <button
                                    onClick={() => handleTalentPageChange(talentCurrentPage + 1)}
                                    disabled={talentCurrentPage === totalTalentPages}
                                    className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-sm font-medium text-text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'freelance':
                return (
                    <div className="space-y-6">
                        {/* Conexión contextual de Freelance con Colaboraciones Urgentes */}
                        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center space-x-3 text-center sm:text-left">
                                <span className="p-2 bg-blue-600 text-white rounded-xl flex-shrink-0">
                                    <BoltIcon className="w-5 h-5" />
                                </span>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">¿Eres freelance y buscas encargos inmediatos?</h4>
                                    <p className="text-xs text-gray-600">Revisa las colaboraciones de última hora que colegas y medios necesitan cubrir hoy.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTab('urgentes')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex-shrink-0 shadow-2xs cursor-pointer"
                            >
                                Ver Colaboraciones Urgentes
                            </button>
                        </div>
                        <FreelanceServicesModule freelanceServices={freelanceServices} rotationInterval={rotationInterval} onBack={onBack} isTabMode={true} />
                    </div>
                );
        }
    };

    const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                activeTab === tabName 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-neutral min-h-screen">
            <div className="container mx-auto px-4 md:px-8 py-10">
                
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group cursor-pointer"
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

                <div className="flex justify-center flex-wrap gap-2 md:gap-3 mb-8">
                    <TabButton tabName="jobs" label="Oportunidades Laborales" />
                    <TabButton tabName="urgentes" label="Colaboraciones Urgentes" />
                    <TabButton tabName="talents" label="Base de Talentos" />
                    <TabButton tabName="freelance" label="Servicios Freelance" />
                </div>

                <div>
                    {renderContent()}
                </div>
            </div>

            {/* Modal de Protección de Login */}
            {isLoginGuardOpen && <LoginGuardModal onClose={() => setIsLoginGuardOpen(false)} onNavigate={onNavigate} />}

            {/* Modal de Matchmaking para Ofertas Laborales */}
            <JobMatchmakingModal
                isOpen={isMatchModalOpen}
                job={selectedMatchJob}
                onClose={() => setIsMatchModalOpen(false)}
            />

            {/* Modal para Crear / Editar Colaboración Urgente */}
            {isPublishCollabOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex justify-center items-center p-4 animate-fade-in overflow-y-auto">
                    <ShortCollaborationForm
                        collaboration={editingCollab}
                        onSave={handleSaveCollaboration}
                        onClose={() => {
                            setIsPublishCollabOpen(false);
                            setEditingCollab(null);
                        }}
                        isModal={true}
                        hideAuthorFields={true}
                    />
                </div>
            )}

            {/* Modal de Diálogo de Matchmaking IA para Colaboraciones Urgentes */}
            {isCollabMatchOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <SparklesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold font-serif text-lg leading-tight">
                                        Matchmaking Inteligente de Talentos
                                    </h3>
                                    <p className="text-white/80 text-xs">
                                        CiPress IA • Análisis de afinidad territorial y especialidades con Gemini
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCollabMatchOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                            {selectedCollabForMatch && (
                                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                            Requerimiento Analizado
                                        </span>
                                        <span className="text-xs font-serif font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                            {selectedCollabForMatch.budget}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">
                                        {selectedCollabForMatch.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Plazo: <span className="font-medium text-gray-700">{selectedCollabForMatch.deadline}</span>
                                    </p>
                                </div>
                            )}

                            {isLoadingCollabMatches ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-12 w-12 border-3 border-orange-100 border-t-primary"></div>
                                        <SparklesIcon className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Emparejando con el Banco de Talentos...</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                            Analizando especialidades periodísticas, disponibilidad regional y seniority.
                                        </p>
                                    </div>
                                </div>
                            ) : collabMatchResult ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
                                        <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                                            {collabMatchResult.summary}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {collabMatchResult.matches.map((candidate: MatchCandidate) => {
                                            const isCopied = copiedCandidateId === candidate.talentId;
                                            const isTop = candidate.matchPercentage >= 80;

                                            return (
                                                <div 
                                                    key={candidate.talentId}
                                                    className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <img 
                                                            src={candidate.avatarUrl || `https://i.pravatar.cc/150?u=${candidate.talentId}`} 
                                                            alt={candidate.name}
                                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0" 
                                                        />
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h5 className="font-bold text-sm text-gray-900">
                                                                    {candidate.name}
                                                                </h5>
                                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                                                    isTop 
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                                                }`}>
                                                                    {candidate.matchPercentage}% Afinidad
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-primary font-medium mt-0.5">
                                                                {candidate.recommendedRole}
                                                            </p>
                                                            <div className="flex items-center text-[11px] text-gray-400 mt-1">
                                                                <MapPinIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                                                <span>{candidate.region}</span>
                                                            </div>

                                                            <div className="mt-2 space-y-1">
                                                                {candidate.matchReasons.map((reason, idx) => (
                                                                    <p key={idx} className="text-[11px] text-gray-600 flex items-center">
                                                                        <span className="text-emerald-500 mr-1.5">•</span>
                                                                        <span>{reason}</span>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                const phone = selectedCollabForMatch?.whatsappContact?.replace(/\D/g, '') || '';
                                                                const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(candidate.whatsappMessage)}`;
                                                                window.open(waUrl, '_blank');
                                                            }}
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                                                        >
                                                            <WhatsAppIcon className="h-4 w-4 mr-1.5" />
                                                            WhatsApp
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopyWhatsAppMsg(candidate.talentId, candidate.whatsappMessage)}
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                                                            title="Copiar mensaje sugerido"
                                                        >
                                                            {isCopied ? (
                                                                <>
                                                                    <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                                                    <span className="text-emerald-700 font-bold">¡Copiado!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ClipboardDocumentIcon className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                                                    <span>Copiar Texto</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsCollabMatchOpen(false)}
                                className="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-xl text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal institucional CiPress (AGENTS.md) */}
            <CiPressModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={modalConfig.onConfirm}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default OpportunitiesModule;
