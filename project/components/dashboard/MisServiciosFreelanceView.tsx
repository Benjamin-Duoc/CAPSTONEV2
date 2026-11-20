import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { User, FreelanceService } from '../../types';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';
import { WhatsAppIcon, LinkedInIcon } from '../icons';
import { 
    BriefcaseIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    XMarkIcon, 
    EnvelopeIcon, 
    TagIcon, 
    ClockIcon, 
    CurrencyDollarIcon,
    SparklesIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface MisServiciosFreelanceViewProps {
    currentUser: User;
    freelanceServices: FreelanceService[];
    onSave: (data: Omit<FreelanceService, 'id'> | FreelanceService) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const CATEGORIES = [
    'Todas',
    'Redacción',
    'Corrección',
    'Fotografía',
    'Audiovisual',
    'Community Management',
    'Traducción',
    'Locución'
];

const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
    'Redacción': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
    'Corrección': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600',
    'Fotografía': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    'Audiovisual': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
    'Community Management': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
    'Traducción': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    'Locución': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600'
};

const MisServiciosFreelanceView: React.FC<MisServiciosFreelanceViewProps> = ({
    currentUser,
    freelanceServices,
    onSave,
    onDelete
}) => {
    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [filterScope, setFilterScope] = useState<'all' | 'mine'>('all');

    // Modal state for Form (Add/Edit)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingService, setEditingService] = useState<FreelanceService | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalCardRef = useRef<HTMLDivElement>(null);

    // Form fields
    const [formData, setFormData] = useState({
        service: '',
        category: 'Redacción',
        price: '',
        deliveryTime: '',
        whatsappContact: '',
        email: '',
        linkedinUrl: '',
        description: '',
        imageUrl: ''
    });

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

    // Body scroll lock and focus management for form modal
    useEffect(() => {
        if (!isFormOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFormOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

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

    // Current user role, name and email
    const userRole = (typeof currentUser.role === 'string' 
        ? currentUser.role 
        : (currentUser.role as any)?.name || '').toLowerCase();
    const isAdmin = userRole.includes('admin');
    const currentUserName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
    const currentUserEmail = (currentUser.email || '').toLowerCase();

    // Check ownership of a service (robust check)
    const isServiceOwner = (s: FreelanceService) => {
        if (isAdmin) return true;
        if (s.userId && s.userId === currentUser.id) return true;
        if (s.email && currentUserEmail && s.email.toLowerCase() === currentUserEmail) return true;
        if (s.provider && currentUserName && s.provider.trim().toLowerCase() === currentUserName.toLowerCase()) return true;
        // Fallbacks for test accounts:
        if (currentUserEmail.includes('premium') && (s.userId === 4 || s.provider?.toLowerCase().includes('premium') || s.email?.includes('premium'))) return true;
        if (currentUserEmail.includes('gratis') && (s.userId === 5 || s.userId === 6 || s.provider?.toLowerCase().includes('gratis') || s.email?.includes('gratis'))) return true;
        return false;
    };

    // Compute services for this user or the whole catalog
    const userServices = useMemo(() => {
        return (freelanceServices || []).filter(s => {
            if (filterScope === 'mine') {
                return isServiceOwner(s);
            }
            return true;
        });
    }, [freelanceServices, currentUser, currentUserName, currentUserEmail, filterScope, isAdmin]);

    const filteredServices = useMemo(() => {
        return userServices.filter(s => {
            const matchesCategory = selectedCategory === 'Todas' || s.category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery = !q || 
                (s.service && s.service.toLowerCase().includes(q)) ||
                (s.provider && s.provider.toLowerCase().includes(q)) ||
                (s.description && s.description.toLowerCase().includes(q)) ||
                (s.price && s.price.toLowerCase().includes(q));

            return matchesCategory && matchesQuery;
        });
    }, [userServices, selectedCategory, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        const total = (freelanceServices || []).length;
        const myTotal = (freelanceServices || []).filter(s => isServiceOwner(s)).length;
        const activeCategories = new Set((freelanceServices || []).map(s => s.category)).size;
        return { total, myTotal, activeCategories };
    }, [freelanceServices, currentUser, currentUserName, currentUserEmail, isAdmin]);

    // Open create modal
    const handleOpenCreate = () => {
        setEditingService(null);
        setFormData({
            service: '',
            category: 'Redacción',
            price: '$50.000 / pauta',
            deliveryTime: '24 a 48 hrs',
            whatsappContact: '',
            email: currentUser.email || '',
            linkedinUrl: '',
            description: '',
            imageUrl: DEFAULT_SERVICE_IMAGES['Redacción'] || ''
        });
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleOpenEdit = (service: FreelanceService) => {
        setEditingService(service);
        setFormData({
            service: service.service || '',
            category: service.category || 'Redacción',
            price: service.price || '',
            deliveryTime: service.deliveryTime || '',
            whatsappContact: service.whatsappContact || '',
            email: service.email || currentUser.email || '',
            linkedinUrl: service.linkedinUrl || '',
            description: service.description || '',
            imageUrl: service.imageUrl || DEFAULT_SERVICE_IMAGES[service.category] || ''
        });
        setIsFormOpen(true);
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.service.trim()) {
            showAlert('Campo Obligatorio', 'Por favor ingresa el título del servicio freelance.', 'warning');
            return;
        }

        if (!formData.description.trim()) {
            showAlert('Campo Obligatorio', 'Por favor describe en qué consiste el servicio y los entregables.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const finalImage = formData.imageUrl.trim() || DEFAULT_SERVICE_IMAGES[formData.category] || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600';

            if (editingService) {
                // Update
                await onSave({
                    ...editingService,
                    ...formData,
                    imageUrl: finalImage,
                    provider: editingService.provider || currentUserName,
                    userId: editingService.userId || currentUser.id
                });
                setIsFormOpen(false);
                showAlert('Servicio Actualizado', `Tu servicio "${formData.service}" fue actualizado con éxito en el catálogo.`, 'success');
            } else {
                // Create
                await onSave({
                    ...formData,
                    imageUrl: finalImage,
                    provider: currentUserName,
                    userId: currentUser.id
                });
                setIsFormOpen(false);
                showAlert('Servicio Publicado', `¡Tu servicio "${formData.service}" ya está disponible en el catálogo de servicios freelance de CiPress!`, 'success');
            }
        } catch (error) {
            console.error('Error al guardar servicio freelance:', error);
            showAlert('Error al Guardar', 'No se pudo guardar el servicio en el servidor. Por favor verifica tu conexión y vuelve a intentarlo.', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete with confirmation
    const handleDelete = (service: FreelanceService) => {
        setModalConfig({
            isOpen: true,
            type: 'danger',
            title: '¿Eliminar Servicio Freelance?',
            message: `¿Estás seguro de que deseas retirar "${service.service}" del catálogo? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar Definitivamente',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await onDelete(service.id);
                    showAlert('Servicio Eliminado', 'El servicio fue retirado con éxito del catálogo.', 'success');
                } catch (error) {
                    console.error('Error al eliminar servicio freelance:', error);
                    showAlert('Error al Eliminar', 'No se pudo eliminar el servicio en el servidor.', 'danger');
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
                            <BriefcaseIcon className="h-4 w-4 mr-1.5 text-amber-200" />
                            Área Laboral • Mercado de Servicios
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">
                            Mis Servicios Freelance
                        </h1>
                        <p className="mt-2 text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                            Ofrece tus servicios profesionales tarifados (redacción, reportería en terreno, fotografía, corrección y traducción) para ser contratado directamente por medios y empresas.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="self-start md:self-center px-5 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 shrink-0 group transform hover:-translate-y-0.5"
                    >
                        <PlusIcon className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                        <span>Publicar Nuevo Servicio</span>
                    </button>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-6 pt-6 border-t border-white/20">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-xs text-white/80 font-medium">Tus Servicios Activos</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5 text-amber-300">{stats.myTotal}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-xs text-white/80 font-medium">Total en Catálogo</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center">
                        <p className="text-xs text-white/80 font-medium">Categorías Ofertadas</p>
                        <p className="text-xl sm:text-2xl font-black mt-0.5 text-emerald-300">{stats.activeCategories}</p>
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
                            placeholder="Buscar por servicio, profesional, descripción o tarifa..."
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
                            Todo el Catálogo ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilterScope('mine')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${filterScope === 'mine' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Mis Publicaciones ({stats.myTotal})
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

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-xl mx-auto my-8">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <BriefcaseIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">
                        No hay servicios para mostrar
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {searchQuery 
                            ? 'No se encontraron servicios que coincidan con la búsqueda.' 
                            : filterScope === 'mine'
                                ? 'Aún no has publicado ningún servicio freelance. Comienza ofreciendo tu especialidad a medios y empresas.'
                                : 'No hay servicios registrados en esta categoría actualmente.'}
                    </p>
                    <button
                        onClick={handleOpenCreate}
                        className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow inline-flex items-center space-x-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Ofrecer Mi Primer Servicio</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(service => {
                        const isOwner = isServiceOwner(service);
                        const canModify = isOwner || isAdmin;

                        return (
                            <div
                                key={service.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                            >
                                <div>
                                    {/* Image with Category Badge & Price Overlay */}
                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                        <img
                                            src={service.imageUrl || DEFAULT_SERVICE_IMAGES[service.category] || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600'}
                                            alt={service.service}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                            <span className="bg-primary/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                                                {service.category}
                                            </span>
                                            {isOwner && (
                                                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-lg shadow">
                                                    Mi Servicio
                                                </span>
                                            )}
                                        </div>

                                        {service.price && (
                                            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-lg shadow border border-white/20">
                                                {service.price}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-serif font-bold text-gray-900 text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {service.service}
                                            </h3>

                                            {/* Action icons if owner/admin */}
                                            {canModify && (
                                                <div className="flex items-center space-x-1 shrink-0">
                                                    <button
                                                        onClick={() => handleOpenEdit(service)}
                                                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Editar servicio"
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar servicio"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Provider & Delivery Time */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                                            <span className="font-semibold text-gray-700 truncate">
                                                👤 {service.provider}
                                            </span>
                                            {service.deliveryTime && (
                                                <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0">
                                                    <ClockIcon className="h-3 w-3 mr-1" />
                                                    {service.deliveryTime}
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2 w-full">
                                        {service.whatsappContact ? (
                                            <a
                                                href={`https://wa.me/${service.whatsappContact.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#1DAE51] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                                            >
                                                <WhatsAppIcon className="h-4 w-4" />
                                                <span>WhatsApp</span>
                                            </a>
                                        ) : null}

                                        {service.email ? (
                                            <a
                                                href={`mailto:${service.email}?subject=Consulta sobre servicio: ${encodeURIComponent(service.service)}`}
                                                className="py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
                                                title={`Contactar a ${service.email}`}
                                            >
                                                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                                                <span className="hidden sm:inline">Correo</span>
                                            </a>
                                        ) : null}

                                        {service.linkedinUrl ? (
                                            <a
                                                href={service.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-2 px-3 bg-[#0077b5] hover:bg-[#005582] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
                                                title="Ver perfil de LinkedIn"
                                            >
                                                <LinkedInIcon className="h-4 w-4 fill-current" />
                                                <span className="hidden sm:inline">LinkedIn</span>
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Form: Add or Edit Freelance Service */}
            {isFormOpen && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsFormOpen(false);
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-freelance-title"
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
                                    <h2 id="modal-freelance-title" className="text-xl sm:text-2xl font-bold font-serif text-gray-900 leading-tight">
                                        {editingService ? 'Editar Servicio Freelance' : 'Publicar Servicio en el Catálogo'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Completa los detalles de tu oferta para que medios y empresas puedan contratarte directamente.
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

                            {/* Modal Body */}
                            <div className="p-5 sm:p-6 flex-1 overflow-y-auto overscroll-contain">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Título del Servicio *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={formData.service}
                                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                            placeholder="Ej: Redacción de Reportajes de Investigación y Fact-Checking"
                                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Categoría *
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

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Tarifa / Precio Estimado
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="Ej: $50.000 / pauta o $180.000 / reportaje"
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Plazo Estimado de Entrega
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.deliveryTime}
                                                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                                                placeholder="Ej: 24 a 48 hrs o 3 a 5 días hábiles"
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                WhatsApp de Contacto (con código de país)
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Correo Electrónico de Contacto
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="Ej: periodista@cipress.cl"
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Enlace de LinkedIn o Portafolio
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.linkedinUrl}
                                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                                placeholder="https://linkedin.com/in/tu-perfil"
                                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Descripción del Servicio y Entregables *
                                        </label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Detalla qué incluye el servicio, tu metodología de trabajo, experiencia relevante y formato de entrega final..."
                                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            URL de Imagen Ilustrativa (Opcional)
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            placeholder="https://ejemplo.com/imagen.jpg (Se asigna imagen temática si se deja en blanco)"
                                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
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
                                                <span>{editingService ? 'Guardar Cambios' : 'Publicar Servicio'}</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
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

export default MisServiciosFreelanceView;

