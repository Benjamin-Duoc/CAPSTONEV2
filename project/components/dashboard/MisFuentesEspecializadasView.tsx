import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { User, Specialist } from '../../types';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';
import { WhatsAppIcon } from '../icons';
import { 
    SparklesIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    UserGroupIcon, 
    AcademicCapIcon, 
    BuildingOfficeIcon, 
    EnvelopeIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    XMarkIcon, 
    CheckBadgeIcon, 
    DocumentTextIcon, 
    GlobeAltIcon, 
    LockClosedIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface MisFuentesEspecializadasViewProps {
    currentUser: User;
    specialists: Specialist[];
    onSave: (data: Omit<Specialist, 'id' | 'dateAdded'> | Specialist) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    users?: User[];
}

const CATEGORIES = [
    'Todas',
    'Contacto Red CiPress',
    'Economía y Negocios',
    'Salud y Epidemiología',
    'Política y Sociedad',
    'Medioambiente y Energía',
    'Tecnología e IA'
];

const RELIABILITY_LEVELS = [
    'Fuente Primaria Verificada',
    'Experto Académico',
    'Vocero Institucional',
    'Colega Periodista CiPress'
];

const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
];

const MisFuentesEspecializadasView: React.FC<MisFuentesEspecializadasViewProps> = ({
    currentUser,
    specialists,
    onSave,
    onDelete,
    users = []
}) => {
    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [filterScope, setFilterScope] = useState<'all' | 'mine' | 'cipress'>('all');

    // Modal state for Form (Add/Edit)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formTab, setFormTab] = useState<'external' | 'cipress'>('external');
    const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        institution: '',
        category: 'Economía y Negocios',
        reliabilityLevel: 'Fuente Primaria Verificada',
        email: '',
        whatsappContact: '',
        specialtyDescription: '',
        notes: '',
        imageUrl: '',
        isPublic: true,
        linkedUserId: null as number | null
    });

    // CiPress user search in "Vincular Usuario CiPress"
    const [cipressUserSearch, setCipressUserSearch] = useState('');
    const modalCardRef = useRef<HTMLDivElement>(null);

    // Scroll Lock and Focus management for Modal
    useEffect(() => {
        if (!isFormOpen) return;

        // 1. Lock background scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // 2. ESC key closes form modal
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFormOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // 3. Focus modal container so mousewheel is captured immediately
        const timer = setTimeout(() => {
            if (modalCardRef.current) {
                modalCardRef.current.focus();
            }
        }, 50);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [isFormOpen]);

    // Modal state for Alerts / Deletions (Strict adherence to AGENTS.md)
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

    const showAlert = (title: string, message: string, type: CiPressModalType = 'warning') => {
        setModalConfig({
            isOpen: true,
            type,
            title,
            message,
            confirmText: 'Entendido',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    // Filter and compute visible specialists
    const userSpecialists = useMemo(() => {
        return (specialists || []).filter(s => {
            // Include:
            // 1. Sources created by this user
            // 2. Global/Public directory sources (userId == null or isPublic == true)
            // 3. Or all sources if Admin
            const isOwner = s.userId === currentUser.id;
            const isPublicGlobal = !s.userId || s.isPublic;
            const isAdmin = currentUser.role?.toLowerCase() === 'administrador';

            if (filterScope === 'mine') {
                return isOwner;
            }
            if (filterScope === 'cipress') {
                return s.linkedUserId || s.category === 'Contacto Red CiPress';
            }
            return isOwner || isPublicGlobal || isAdmin;
        });
    }, [specialists, currentUser, filterScope]);

    const filteredSpecialists = useMemo(() => {
        return userSpecialists.filter(s => {
            const matchesCategory = selectedCategory === 'Todas' || s.category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery = !q || 
                (s.name && s.name.toLowerCase().includes(q)) ||
                (s.title && s.title.toLowerCase().includes(q)) ||
                (s.institution && s.institution.toLowerCase().includes(q)) ||
                (s.specialtyDescription && s.specialtyDescription.toLowerCase().includes(q)) ||
                (s.notes && s.notes.toLowerCase().includes(q));

            return matchesCategory && matchesQuery;
        });
    }, [userSpecialists, selectedCategory, searchQuery]);

    // Statistics counts
    const stats = useMemo(() => {
        const total = userSpecialists.length;
        const verified = userSpecialists.filter(s => s.reliabilityLevel?.includes('Verificada') || s.reliabilityLevel?.includes('Académico')).length;
        const cipressMembers = userSpecialists.filter(s => s.linkedUserId || s.category === 'Contacto Red CiPress').length;
        return { total, verified, cipressMembers };
    }, [userSpecialists]);

    // Open form for creating
    const handleOpenCreate = () => {
        setEditingSpecialist(null);
        setFormTab('external');
        setFormData({
            name: '',
            title: '',
            institution: '',
            category: 'Economía y Negocios',
            reliabilityLevel: 'Fuente Primaria Verificada',
            email: '',
            whatsappContact: '',
            specialtyDescription: '',
            notes: '',
            imageUrl: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
            isPublic: true,
            linkedUserId: null
        });
        setIsFormOpen(true);
    };

    // Open form for editing
    const handleOpenEdit = (specialist: Specialist) => {
        setEditingSpecialist(specialist);
        setFormTab(specialist.linkedUserId ? 'cipress' : 'external');
        setFormData({
            name: specialist.name || '',
            title: specialist.title || '',
            institution: specialist.institution || '',
            category: specialist.category || 'Economía y Negocios',
            reliabilityLevel: specialist.reliabilityLevel || 'Fuente Primaria Verificada',
            email: specialist.email || '',
            whatsappContact: specialist.whatsappContact || '',
            specialtyDescription: specialist.specialtyDescription || '',
            notes: specialist.notes || '',
            imageUrl: specialist.imageUrl || '',
            isPublic: specialist.isPublic ?? true,
            linkedUserId: specialist.linkedUserId || null
        });
        setIsFormOpen(true);
    };

    // Selecting a registered CiPress user to populate contact
    const handleSelectCiPressUser = (user: User) => {
        setFormData(prev => ({
            ...prev,
            name: `${user.firstName} ${user.lastName}`.trim(),
            title: `Periodista / ${user.role || 'Colaborador'}`,
            institution: 'CiPress Red de Medios',
            category: 'Contacto Red CiPress',
            reliabilityLevel: 'Colega Periodista CiPress',
            email: user.email || '',
            whatsappContact: '',
            specialtyDescription: `Contacto profesional de la red de periodistas CiPress en la región de ${user.region || 'Chile'}. Disponible para colaboraciones editoriales y reportería conjunta.`,
            notes: `Colega registrado en CiPress con rol ${user.role}.`,
            linkedUserId: user.id,
            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + '+' + user.lastName)}&background=FF6B00&color=fff&size=200`
        }));
        setFormTab('external'); // Switch to main review form
    };

    // Save action
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showAlert('Campo Obligatorio', 'Debes ingresar el nombre de la fuente o contacto.', 'warning');
            return;
        }

        if (!formData.specialtyDescription.trim() && !formData.title.trim()) {
            showAlert('Información Incompleta', 'Indica el cargo, título o una breve descripción de la especialidad de la fuente.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingSpecialist) {
                // Update
                await onSave({
                    ...editingSpecialist,
                    ...formData,
                    userId: editingSpecialist.userId || currentUser.id,
                    textColor: '#FFFFFF'
                });
                setIsFormOpen(false);
                showAlert('Fuente Actualizada', `Se guardaron los cambios para ${formData.name}.`, 'success');
            } else {
                // Create
                await onSave({
                    ...formData,
                    userId: currentUser.id,
                    textColor: '#FFFFFF'
                });
                setIsFormOpen(false);
                showAlert('Fuente Registrada', `¡${formData.name} fue agregado exitosamente a tu agenda de fuentes especializadas!`, 'success');
            }
        } catch (error) {
            console.error("Error al guardar fuente:", error);
            showAlert('Error al Guardar', 'No se pudo guardar la fuente en el servidor. Por favor verifica tu conexión y vuelve a intentarlo.', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete action with confirmation
    const handleDelete = (specialist: Specialist) => {
        setModalConfig({
            isOpen: true,
            type: 'danger',
            title: '¿Eliminar Fuente Especializada?',
            message: `¿Estás seguro de que deseas eliminar a "${specialist.name}" de tu agenda de contactos? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar Definitivamente',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await onDelete(specialist.id);
                    showAlert('Fuente Eliminada', 'La fuente fue removida exitosamente de tu agenda.', 'success');
                } catch (error) {
                    console.error("Error al eliminar fuente:", error);
                    showAlert('Error al Eliminar', 'No se pudo eliminar la fuente en el servidor.', 'danger');
                }
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in font-sans">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-primary to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3 border border-white/20">
                            <SparklesIcon className="h-4 w-4 mr-1.5 text-amber-200" />
                            Agenda Periodística y Red de Fuentes
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">
                            Mis Fuentes Especializadas
                        </h1>
                        <p className="mt-2 text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                            Organiza tu red de contactos, voceros institucionales, expertos académicos y colegas de CiPress para coberturas periodísticas rigurosas y chequeo ágil de noticias.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="self-start md:self-center px-5 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 shrink-0 group transform hover:-translate-y-0.5"
                    >
                        <PlusIcon className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                        <span>Nueva Fuente o Contacto</span>
                    </button>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-6 pt-6 border-t border-white/20">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-xs text-white/80 font-medium">Fuentes en tu Red</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-xs text-white/80 font-medium">Verificadas / Académicas</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5 text-emerald-300">{stats.verified}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-xs text-white/80 font-medium">Red CiPress</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5 text-amber-300">{stats.cipressMembers}</p>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Search & Quick Scope */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, institución, especialidad o notas..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Scope Selector */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
                        <button
                            onClick={() => setFilterScope('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterScope === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Todas las Fuentes
                        </button>
                        <button
                            onClick={() => setFilterScope('mine')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterScope === 'mine' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Creadas por Mí
                        </button>
                        <button
                            onClick={() => setFilterScope('cipress')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterScope === 'cipress' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            👥 Red CiPress
                        </button>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium ${
                                selectedCategory === cat
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sources Grid */}
            {filteredSpecialists.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-xl mx-auto my-8">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <UserGroupIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">
                        No se encontraron fuentes
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {searchQuery 
                            ? 'No hay contactos o especialistas que coincidan con los términos de búsqueda.' 
                            : 'Aún no tienes fuentes registradas con este criterio. Comienza agregando a tu primer contacto o vinculando a colegas de CiPress.'}
                    </p>
                    <button
                        onClick={handleOpenCreate}
                        className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow inline-flex items-center space-x-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Agregar Primera Fuente</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpecialists.map(specialist => {
                        const isOwner = specialist.userId === currentUser.id;
                        const isAdmin = currentUser.role?.toLowerCase() === 'administrador';
                        const canModify = isOwner || isAdmin;
                        const isCiPressColleague = Boolean(specialist.linkedUserId || specialist.category === 'Contacto Red CiPress');

                        return (
                            <div
                                key={specialist.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                            >
                                <div className="p-6">
                                    {/* Top Row: Avatar & Badges */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-inner">
                                                {specialist.imageUrl ? (
                                                    <img
                                                        src={specialist.imageUrl}
                                                        alt={specialist.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-primary font-bold text-lg font-serif">
                                                        {specialist.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                                                    {specialist.name}
                                                </h3>
                                                <p className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1">
                                                    {specialist.title || 'Especialista'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions dropdown/buttons if owner/admin */}
                                        {canModify && (
                                            <div className="flex items-center space-x-1 shrink-0">
                                                <button
                                                    onClick={() => handleOpenEdit(specialist)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Editar fuente"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(specialist)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar de mi agenda"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Institution & Category tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {specialist.institution && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                                                <BuildingOfficeIcon className="h-3 w-3 mr-1 text-gray-500" />
                                                {specialist.institution}
                                            </span>
                                        )}

                                        {specialist.category && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-100">
                                                {specialist.category}
                                            </span>
                                        )}

                                        {isCiPressColleague && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900">
                                                👥 Red CiPress
                                            </span>
                                        )}
                                    </div>

                                    {/* Reliability Level Badge */}
                                    {specialist.reliabilityLevel && (
                                        <div className="mb-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                specialist.reliabilityLevel.includes('Verificada')
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : specialist.reliabilityLevel.includes('Académico')
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : specialist.reliabilityLevel.includes('Institucional')
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}>
                                                <CheckBadgeIcon className="h-3 w-3 mr-1" />
                                                {specialist.reliabilityLevel}
                                            </span>
                                        </div>
                                    )}

                                    {/* Specialty Description */}
                                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                                        {specialist.specialtyDescription}
                                    </p>

                                    {/* Private Journalistic Notes */}
                                    {specialist.notes && (
                                        <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-2.5 text-xs text-amber-900 mb-3">
                                            <div className="flex items-center font-bold text-[10px] text-amber-700 uppercase tracking-wider mb-1">
                                                <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />
                                                Nota de Cobertura
                                            </div>
                                            <p className="text-[11px] italic leading-tight">{specialist.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Action Footer */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2 w-full">
                                        {specialist.whatsappContact ? (
                                            <a
                                                href={`https://wa.me/${specialist.whatsappContact.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#1DAE51] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                                            >
                                                <WhatsAppIcon className="h-4 w-4" />
                                                <span>WhatsApp</span>
                                            </a>
                                        ) : (
                                            <div className="flex-1 py-2 px-3 bg-gray-200 text-gray-400 text-xs font-medium rounded-xl text-center">
                                                Sin Teléfono
                                            </div>
                                        )}

                                        {specialist.email ? (
                                            <a
                                                href={`mailto:${specialist.email}`}
                                                className="py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
                                                title={`Enviar correo a ${specialist.email}`}
                                            >
                                                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                                                <span className="hidden sm:inline">Correo</span>
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Form: Add or Edit Source */}
            {isFormOpen && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsFormOpen(false);
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-form-title"
                >
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
                        <div 
                            ref={modalCardRef}
                            tabIndex={-1}
                            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 flex flex-col text-left my-6 transform transition-all relative overflow-hidden overscroll-contain max-h-[85vh] focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                                <div>
                                    <h2 id="modal-form-title" className="text-xl sm:text-2xl font-bold font-serif text-gray-900 leading-tight">
                                        {editingSpecialist ? 'Editar Fuente Especializada' : 'Añadir Nueva Fuente a tu Agenda'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Registra fuentes confiables, voceros o vincula contactos de la comunidad de CiPress.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                                    title="Cerrar ventana"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* If creating new, show Tab navigation: External vs CiPress Member */}
                            {!editingSpecialist && (
                                <div className="px-5 sm:px-6 pt-3 border-b border-gray-100 flex space-x-4 shrink-0 bg-gray-50/50">
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('external')}
                                        className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                                            formTab === 'external'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Ingresar Fuente Externa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('cipress')}
                                        className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                                            formTab === 'cipress'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        <span>👥 Vincular Usuario de CiPress</span>
                                        <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                                            Rápido
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Modal Body */}
                            <div className="p-5 sm:p-6 flex-1 overflow-y-auto overscroll-contain">
                                {/* CiPress Members Quick Directory Tab */}
                                {formTab === 'cipress' && !editingSpecialist && (
                                    <div className="space-y-4">
                                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-orange-900">
                                            <p className="font-bold mb-1">💡 Conecta con otros miembros de CiPress</p>
                                            <p>Selecciona a un colega o usuario registrado para incorporarlo directamente a tu agenda de fuentes y contactos periodísticos.</p>
                                        </div>

                                        {/* User search */}
                                        <div className="relative">
                                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={cipressUserSearch}
                                                onChange={(e) => setCipressUserSearch(e.target.value)}
                                                placeholder="Buscar usuario por nombre o correo..."
                                                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                                            />
                                        </div>

                                        {/* Users List */}
                                        <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto border border-gray-200 rounded-2xl overscroll-contain">
                                            {users
                                                .filter(u => u.id !== currentUser.id)
                                                .filter(u => {
                                                    const q = cipressUserSearch.toLowerCase().trim();
                                                    if (!q) return true;
                                                    return `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                                                })
                                                .map(u => (
                                                    <div
                                                        key={u.id}
                                                        className="p-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm font-serif shrink-0">
                                                                {u.firstName?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {u.firstName} {u.lastName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {u.email} • <span className="text-primary font-medium">{u.role}</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectCiPressUser(u)}
                                                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                                                        >
                                                            Vincular a Agenda
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Standard Form Tab */}
                                {(formTab === 'external' || editingSpecialist) && (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Nombre Completo *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ej: Dra. Andrea Repetto"
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Cargo o Título Profesional *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="Ej: Economista Senior / Directora de Escuela"
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Institución u Organización
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.institution}
                                                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                                    placeholder="Ej: Universidad de Chile / Espacio Público"
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Categoría Periodística
                                                </label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                                >
                                                    {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Nivel de Confiabilidad / Tipo de Fuente
                                                </label>
                                                <select
                                                    value={formData.reliabilityLevel}
                                                    onChange={(e) => setFormData({ ...formData, reliabilityLevel: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                                >
                                                    {RELIABILITY_LEVELS.map(lvl => (
                                                        <option key={lvl} value={lvl}>{lvl}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    Teléfono o WhatsApp (con código de país)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.whatsappContact}
                                                    onChange={(e) => setFormData({ ...formData, whatsappContact: e.target.value })}
                                                    placeholder="Ej: 56911223344"
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Correo Electrónico de Contacto
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="Ej: contacto@institucion.cl"
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Descripción de Especialidad y Temas Clave *
                                            </label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={formData.specialtyDescription}
                                                onChange={(e) => setFormData({ ...formData, specialtyDescription: e.target.value })}
                                                placeholder="Detalla en qué temas es experta la fuente (ej: macroeconomía, proyecciones fiscales, reformas de pensiones, salud pública)..."
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Notas Privadas de Cobertura
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Notas personales (ej: 'Prefiere ser contactado por las mañanas', 'Muy asertivo para análisis del IPC')..."
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                URL de Foto o Avatar
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                placeholder="https://ejemplo.com/foto.jpg"
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="isPublicCheck"
                                                checked={formData.isPublic}
                                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                            />
                                            <label htmlFor="isPublicCheck" className="text-xs text-gray-700 cursor-pointer">
                                                Compartir en el <span className="font-semibold">Repositorio Público de Fuentes</span> de CiPress para otros periodistas.
                                            </label>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsFormOpen(false)}
                                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-sm transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Guardando...</span>
                                                    </>
                                                ) : (
                                                    <span>{editingSpecialist ? 'Guardar Cambios' : 'Añadir a mi Agenda'}</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Standard CiPress Confirmation / Alert Modal */}
            <CiPressModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default MisFuentesEspecializadasView;

