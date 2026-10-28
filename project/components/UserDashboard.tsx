import React, { useState } from 'react';
import type { User, PremiumSponsor, PressRelease, ShortCollaboration } from '../types';
import { initiatePayment } from '../utils/db';
import MyProfileView from './dashboard/MyProfileView';
import ConfianEnCipressView from './dashboard/ConfianEnCipressView';
import RedactarComunicadoView from './dashboard/RedactarComunicadoView';
import MisGaleriasView from './dashboard/MisGaleriasView';
import MisPymesView from './dashboard/MisPymesView';
import TalentProfileView from './dashboard/TalentProfileView';
import UrgentCollaborationsView from './dashboard/UrgentCollaborationsView';
import { 
    UserIcon, 
    CreditCardIcon, 
    PencilSquareIcon, 
    PhotoIcon, 
    BriefcaseIcon, 
    SparklesIcon, 
    BuildingOfficeIcon,
    LockClosedIcon,
    ArrowLeftOnRectangleIcon,
    CheckIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface UserDashboardProps {
    currentUser: User | null;
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onUpdateProfile: (updates: Partial<User>) => Promise<void>;
    premiumSponsors: PremiumSponsor[];
    onAddSponsor: (sponsor: Omit<PremiumSponsor, 'id'>) => Promise<void>;
    onUpdateSponsor: (sponsor: PremiumSponsor) => Promise<void>;
    pressReleases: PressRelease[];
    onAddPressRelease: (pressRelease: Omit<PressRelease, 'id'>) => Promise<void>;
    onUpdatePressRelease: (pressRelease: PressRelease) => Promise<void>;
    onDeletePressRelease: (id: number) => Promise<void>;
    onGalleriesUpdated?: () => void;
    shortCollaborations: ShortCollaboration[];
    onAddShortCollaboration: (collaboration: Omit<ShortCollaboration, 'id'>) => Promise<void>;
    onUpdateShortCollaboration: (collaboration: ShortCollaboration) => Promise<void>;
    onDeleteShortCollaboration: (id: number) => Promise<void>;
    initialSection?: MenuSection;
}

type MenuSection = 'Mi Perfil' | 'Suscripción' | 'Redactar Comunicado' | 'Colaboraciones Urgentes' | 'Mis Galerías' | 'Mis Pymes' | 'Confían en CiPress' | 'Mis Servicios Freelance' | 'Mi Perfil de Talento' | 'Publicar Oferta Laboral' | 'Mis Fuentes Especializadas';

interface MenuItem {
    name: MenuSection;
    icon: React.ComponentType<any>;
    category: 'Mi Cuenta' | 'Mis Publicaciones' | 'Área Comercial' | 'Área Laboral';
    visibleFor: string[]; // roles
    lockedFor: string[]; // roles
}

const MENU_ITEMS: MenuItem[] = [
    { name: 'Mi Perfil', icon: UserIcon, category: 'Mi Cuenta', visibleFor: ['all'], lockedFor: [] },
    { name: 'Suscripción', icon: CreditCardIcon, category: 'Mi Cuenta', visibleFor: ['all'], lockedFor: [] },
    
    { name: 'Redactar Comunicado', icon: PencilSquareIcon, category: 'Mis Publicaciones', visibleFor: ['all'], lockedFor: [] },
    { name: 'Colaboraciones Urgentes', icon: SparklesIcon, category: 'Mis Publicaciones', visibleFor: ['all'], lockedFor: ['colaborador gratis', 'colaborador'] },
    { name: 'Mis Galerías', icon: PhotoIcon, category: 'Mis Publicaciones', visibleFor: ['all'], lockedFor: [] },
    { name: 'Mis Pymes', icon: BuildingOfficeIcon, category: 'Mis Publicaciones', visibleFor: ['all'], lockedFor: [] },
    
    { name: 'Confían en CiPress', icon: BuildingOfficeIcon, category: 'Área Comercial', visibleFor: ['cliente', 'empresa', 'administrador'], lockedFor: [] },
    { name: 'Mis Servicios Freelance', icon: SparklesIcon, category: 'Área Comercial', visibleFor: ['cliente', 'administrador'], lockedFor: ['colaborador'] },
    
    { name: 'Mi Perfil de Talento', icon: UserIcon, category: 'Área Laboral', visibleFor: ['all'], lockedFor: [] },
    { name: 'Publicar Oferta Laboral', icon: BriefcaseIcon, category: 'Área Laboral', visibleFor: ['empresa', 'administrador'], lockedFor: [] },
    { name: 'Mis Fuentes Especializadas', icon: SparklesIcon, category: 'Mis Publicaciones', visibleFor: ['all'], lockedFor: ['colaborador gratis', 'colaborador'] },
];

const UserDashboard: React.FC<UserDashboardProps> = ({ 
    currentUser, onLogout, onNavigate, onUpdateProfile, 
    premiumSponsors, onAddSponsor, onUpdateSponsor,
    pressReleases, onAddPressRelease, onUpdatePressRelease, onDeletePressRelease, onGalleriesUpdated,
    shortCollaborations, onAddShortCollaboration, onUpdateShortCollaboration, onDeleteShortCollaboration,
    initialSection = 'Mi Perfil'
}) => {
    const [activeSection, setActiveSection] = useState<MenuSection>(initialSection);
    const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

    // Mapeo seguro del rol (todo a lowercase)
    const userRole = (typeof currentUser?.role === 'string' 
        ? currentUser.role 
        : (currentUser?.role as any)?.name || '').toLowerCase();
        
    // Función auxiliar para determinar visibilidad
    const isVisible = (item: MenuItem) => {
        if (item.visibleFor.includes('all')) return true;
        if (userRole === 'administrador') return true;
        return item.visibleFor.some(role => userRole.includes(role));
    };

    // Función auxiliar para determinar si está bloqueado (Freemium Upsell)
    const isLocked = (item: MenuItem) => {
        if (userRole === 'administrador') return false;
        
        // REGLA DE ORO: Si es Premium o Cliente, NADA está bloqueado
        if (userRole.includes('premium') || userRole.includes('cliente')) return false;

        return item.lockedFor.some(lockedRole => userRole.includes(lockedRole));
    };

    const handleUpgrade = async () => {
        if (!currentUser) return;
        setIsProcessingUpgrade(true);
        try {
            const { url } = await initiatePayment(currentUser.id);
            window.location.href = url;
        } catch (error: any) {
            alert(error.message || "Error al iniciar el proceso de pago.");
            setIsProcessingUpgrade(false);
        }
    };

    // Agrupar ítems visibles por categoría
    const categories = ['Mi Cuenta', 'Mis Publicaciones', 'Área Comercial', 'Área Laboral'];

    const handleMenuClick = (item: MenuItem) => {
        setActiveSection(item.name);
    };

    const renderContent = () => {
        const lockedItem = MENU_ITEMS.find(i => i.name === activeSection);
        if (lockedItem && isLocked(lockedItem)) {
            return (
                <div className="p-8 max-w-2xl mx-auto mt-10">
                    <div className="bg-white p-8 rounded-2xl border-2 border-primary shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-bold rounded-bl-lg flex items-center">
                            <LockClosedIcon className="w-4 h-4 mr-1" /> Exclusivo Premium
                        </div>
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <StarIcon className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold font-serif text-text-primary mb-4">
                            ¡Destaca en nuestro Banco de Talentos pasándote a Premium!
                        </h3>
                        <p className="text-text-secondary mb-8">
                            La sección "{activeSection}" es un beneficio exclusivo. ¡Pásate a Premium para acceder a todas las herramientas avanzadas y destacar profesionalmente frente a los medios que buscan talento!
                        </p>
                        <button 
                            onClick={handleUpgrade}
                            disabled={isProcessingUpgrade}
                            className={`w-full max-w-sm mx-auto py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center ${isProcessingUpgrade ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isProcessingUpgrade ? 'Conectando...' : 'Mejorar a Premium Ahora'}
                        </button>
                    </div>
                </div>
            );
        }

        switch (activeSection) {
            case 'Mi Perfil':
                return currentUser ? <MyProfileView currentUser={currentUser} onSaveProfile={onUpdateProfile} /> : <div className="p-8 text-center text-gray-500 font-medium">Cargando perfil...</div>;
            case 'Suscripción':
                const isPremiumUser = userRole.includes('premium');
                return (
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-bold font-serif text-text-primary">Gestión de Suscripción</h3>
                            {isPremiumUser ? (
                                <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
                                    <StarIcon className="h-5 w-5 mr-2 animate-pulse" />
                                    <span className="font-bold">Suscripción Premium Activa</span>
                                </div>
                            ) : (
                                <p className="text-text-secondary mt-2">Estás usando una cuenta básica de colaborador</p>
                            )}
                        </div>

                        {isPremiumUser ? (
                            <div className="bg-white p-10 rounded-3xl border border-primary/20 shadow-xl text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <SparklesIcon className="h-10 w-10 text-primary" />
                                </div>
                                <h4 className="text-2xl font-bold text-text-primary mb-4">¡Ya eres cliente Premium! 🚀</h4>
                                <p className="text-lg text-text-secondary mb-8">
                                    Gracias por comprar la membresía y confiar en **CiPress**. Tu apoyo nos permite seguir conectando al mejor talento periodístico de Chile.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <CheckIcon className="h-6 w-6 text-green-500" />
                                        <span className="text-sm font-medium text-gray-700">Visibilidad 24/7</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <CheckIcon className="h-6 w-6 text-green-500" />
                                        <span className="text-sm font-medium text-gray-700">Banco de Talentos VIP</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Plan Actual */}
                                <div className="bg-surface p-8 rounded-2xl border border-gray-200 opacity-60">
                                    <h4 className="text-xl font-bold text-gray-500">Colaborador Gratis</h4>
                                    <p className="text-3xl font-black text-gray-400 mt-2">$0 <span className="text-sm font-normal">/mes</span></p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-start text-sm text-gray-400">
                                            <CheckIcon className="h-5 w-5 mr-2" />
                                            <span>Subida de comunicados.</span>
                                        </li>
                                    </ul>
                                </div>
                                {/* Plan Premium */}
                                <div className="bg-white p-8 rounded-2xl border-2 border-primary shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-[10px] font-bold">VIP</div>
                                    <h4 className="text-xl font-bold text-primary flex items-center">
                                        <StarIcon className="h-6 w-6 mr-2" />
                                        Premium
                                    </h4>
                                    <p className="text-3xl font-black text-text-primary mt-2">$3.000 <span className="text-sm font-normal">/mes</span></p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-start text-sm text-text-secondary">
                                            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <span>Visibilidad total en Portada.</span>
                                        </li>
                                        <li className="flex items-start text-sm text-text-secondary">
                                            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                                            <span>Prioridad en Banco de Talentos.</span>
                                        </li>
                                    </ul>
                                    <button 
                                        onClick={handleUpgrade}
                                        disabled={isProcessingUpgrade}
                                        className={`w-full mt-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center ${isProcessingUpgrade ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isProcessingUpgrade ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Conectando...
                                            </>
                                        ) : 'Subir a Premium'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'Redactar Comunicado':
                return currentUser ? <RedactarComunicadoView 
                    currentUser={currentUser}
                    userPressReleases={pressReleases.filter(pr => pr.author === `${currentUser.firstName} ${currentUser.lastName}`.trim() || pr.authorUserId === currentUser.id)}
                    onSavePressRelease={async (data) => {
                        if ('id' in data) {
                            await onUpdatePressRelease(data as PressRelease);
                        } else {
                            await onAddPressRelease({ ...data, authorUserId: currentUser.id } as Omit<PressRelease, 'id'>);
                        }
                    }}
                    onDeletePressRelease={onDeletePressRelease}
                /> : <div className="p-8 text-center text-gray-500 font-medium">Cargando...</div>;
            case 'Mi Perfil de Talento':
                return currentUser ? <TalentProfileView currentUser={currentUser} /> : <div className="p-8 text-center text-gray-500 font-medium">Cargando...</div>;
            case 'Colaboraciones Urgentes':
                return currentUser ? <UrgentCollaborationsView
                    currentUser={currentUser}
                    collaborations={(shortCollaborations || []).filter(c => c.authorUserId === currentUser.id)}
                    onSave={async (data) => {
                        if ('id' in data && data.id) {
                            await onUpdateShortCollaboration(data as ShortCollaboration);
                        } else {
                            await onAddShortCollaboration({ ...data, authorUserId: currentUser.id } as Omit<ShortCollaboration, 'id'>);
                        }
                    }}
                    onDelete={onDeleteShortCollaboration}
                /> : <div className="p-8 text-center text-gray-500 font-medium">Cargando...</div>;
            case 'Mis Galerías':
                return <MisGaleriasView user={currentUser!} onGalleriesUpdated={onGalleriesUpdated} />;
            case 'Mis Pymes':
                return <MisPymesView currentUser={currentUser!} />;
            case 'Confían en CiPress':
                return currentUser ? <ConfianEnCipressView 
                    currentUser={currentUser} 
                    premiumSponsors={premiumSponsors}
                    onSave={async (data) => {
                        const existingSponsor = premiumSponsors.find(s => s.userId === currentUser?.id);
                        if (existingSponsor) {
                            await onUpdateSponsor({ ...existingSponsor, ...data } as PremiumSponsor);
                        } else {
                            await onAddSponsor({ ...data, nameColor: '#000000', ctaColor: '#FF6B00', id: Date.now() } as Omit<PremiumSponsor, 'id'>);
                        }
                    }}
                /> : <div className="p-8 text-center text-gray-500 font-medium">Cargando...</div>;
            case 'Mis Fuentes Especializadas':
                return <div className="p-8 text-center text-gray-500 font-medium">Gestiona tus fuentes especializadas desde aquí (Vista en desarrollo).</div>;
            case 'Mis Servicios Freelance':
                return null;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 flex flex-col md:flex-row animate-fade-in border-t border-gray-100">
            {/* Sidebar Lateral Inteligente */}
            <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col md:sticky md:top-20 z-20">
                <div className="p-6 border-b border-gray-100 flex items-center mb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg mr-3 shadow-inner overflow-hidden">
                        {currentUser?.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            currentUser?.firstName?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 leading-tight">Mi Espacio</h2>
                        <p className="text-xs text-primary font-medium">{currentUser?.role || 'Cargando...'}</p>
                    </div>
                </div>

                <div className="flex-grow px-4 py-4 space-y-6">
                    {categories.map(cat => {
                        const itemsInCategory = MENU_ITEMS.filter(item => item.category === cat && isVisible(item));
                        if (itemsInCategory.length === 0) return null;

                        return (
                            <div key={cat}>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    {cat}
                                </h3>
                                <ul className="space-y-1">
                                    {itemsInCategory.map(item => {
                                        const active = activeSection === item.name;
                                        const locked = isLocked(item);
                                        const Icon = item.icon;

                                        return (
                                            <li key={item.name}>
                                                <button
                                                    onClick={() => handleMenuClick(item)}
                                                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                                                        ${active 
                                                            ? 'bg-primary text-white shadow-md' 
                                                            : locked 
                                                                ? 'text-gray-400 hover:bg-gray-100' 
                                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                                    `}
                                                >
                                                    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : locked ? 'text-gray-300' : 'text-gray-500'}`} />
                                                    <span className="flex-grow text-left">{item.name}</span>
                                                    {locked && <LockClosedIcon className="w-4 h-4 text-orange-400 ml-2 animate-pulse" />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-200 mt-4">
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-red-500" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 bg-white relative z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)] pt-4 md:pt-0 pb-12 md:pb-24">
                {renderContent()}
            </main>
        </div>
    );
};

export default UserDashboard;
