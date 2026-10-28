import React, { useState, useEffect } from 'react';
import type { User, PressRelease, TalentProfile } from '../types';
import PressReleaseForm from './admin/PressReleaseForm';
import TalentProfileForm from './admin/TalentProfileForm';
import { ArrowLeftOnRectangleIcon, UserIcon, DocumentTextIcon, CreditCardIcon, CheckIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getMyTalentProfile, saveMyTalentProfile, initiatePayment, getApiUrl } from '../utils/db';

interface FreeDashboardProps {
    currentUser: User | null;
    onLogout: () => void;
    pressReleases: PressRelease[];
    onAddPressRelease: (pressRelease: Omit<PressRelease, 'id'>) => Promise<void>;
    onUpdatePressRelease: (pressRelease: PressRelease) => Promise<void>;
    onDeletePressRelease: (id: number) => Promise<void>;
    onNavigate: (page: string) => void;
    initialTab?: 'content' | 'talent' | 'subscription' | 'participate';
}

const FreeDashboard: React.FC<FreeDashboardProps> = ({
    currentUser,
    onLogout,
    pressReleases,
    onAddPressRelease,
    onUpdatePressRelease,
    onDeletePressRelease,
    onNavigate,
    initialTab = 'content'
}) => {
    const isPremium = (currentUser?.role || '').toLowerCase() === 'colaborador premium';
    const [activeTab, setActiveTab] = useState<'content' | 'talent' | 'subscription' | 'participate'>(initialTab);
    const [myProfile, setMyProfile] = useState<TalentProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoadingProfile(true);
            const profile = await getMyTalentProfile();
            setMyProfile(profile);
            setIsLoadingProfile(false);
        };
        loadProfile();
    }, []);

    const handleSaveProfile = async (data: any) => {
        try {
            const saved = await saveMyTalentProfile(data);
            setMyProfile(saved);
            alert("¡Perfil de talento actualizado con éxito!");
        } catch (error) {
            alert("Error al guardar el perfil.");
        }
    };

    const handleUpgrade = async () => {
        if (!currentUser) return;
        setIsProcessingUpgrade(true);
        try {
            const res = await fetch(getApiUrl('payments/create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id }),
            });
            
            const data = await res.json();

            if (res.ok && (data.payment_url || data.url)) {
                // Redirección exitosa a Flow
                window.location.href = data.payment_url || data.url;
            } else {
                // Atrapamos el error (ej: 400 de Sandbox) y mostramos el mensaje amigable
                alert("Atención: " + (data.message || "Ocurrió un problema al generar el cobro."));
                setIsProcessingUpgrade(false);
            }
        } catch (error) {
            console.error("Error crítico en el pago:", error);
            alert("Error de conexión. Por favor, revisa tu internet o intenta más tarde.");
            setIsProcessingUpgrade(false);
        }
    };

    return (
        <div className="flex bg-neutral font-sans border-t border-gray-100">
            {/* Minimal Sidebar for Logout */}
            <div className="w-64 bg-surface border-r border-gray-200 flex flex-col justify-between hidden md:flex md:sticky md:top-20 md:h-[calc(100vh-80px)]">
                <div>
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold font-serif text-text-primary">Colaborador</h2>
                        <p className="text-sm text-text-secondary mt-1 truncate">{currentUser?.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 font-bold text-xs uppercase rounded">Cta. Básica</span>
                    </div>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('content')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'content' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
                    >
                        <DocumentTextIcon className="h-5 w-5" />
                        <span>Comunicados</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('talent')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'talent' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
                    >
                        <UserIcon className="h-5 w-5" />
                        <span>Banco de Talentos</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('participate')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'participate' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
                    >
                        <SparklesIcon className="h-5 w-5" />
                        <span>Participación</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('subscription')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'subscription' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
                    >
                        <CreditCardIcon className="h-5 w-5" />
                        <span>Suscripción</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-neutral">
                {/* Mobile Header */}
                <div className="md:hidden bg-surface flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold font-serif text-text-primary">Colaborador</h2>
                    <button onClick={onLogout} className="text-red-500 hover:text-red-700">
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 md:p-8 max-w-5xl mx-auto">
                    {activeTab === 'content' ? (
                        <>
                            {/* Counter and Limit Logic */}
                            {(() => {
                                const todayStart = new Date();
                                todayStart.setHours(0, 0, 0, 0);
                                
                                const userPressReleases = (pressReleases || []).filter(pr => 
                                    pr.authorUserId === currentUser?.id || 
                                    pr.author === currentUser?.email || 
                                    (currentUser && pr.author === `${currentUser.firstName} ${currentUser.lastName}`.trim())
                                );
                                const countToday = userPressReleases.filter(pr => {
                                    if (!pr.createdAt && !pr.date) return false;
                                    const prDate = new Date(pr.createdAt || pr.date);
                                    return prDate >= todayStart;
                                }).length;
                                
                                const limitReached = !isPremium && countToday >= 3;

                                return (
                                    <>
                                        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-primary">Panel de Redacción</h3>
                                                <p className="text-text-secondary mt-1 max-w-2xl">
                                                    Como colaborador gratuito, sus comunicados se publican automáticamente en el repositorio general y tienen visibilidad rotativa.
                                                </p>
                                            </div>
                                            <div className={`flex flex-col items-center p-3 rounded-xl border-2 ${limitReached ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-primary/20 text-primary'}`}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Hoy</span>
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-2xl font-black">{countToday}</span>
                                                    <span className="text-sm font-medium opacity-60">/ 3</span>
                                                </div>
                                                {limitReached && <span className="text-[10px] font-bold">LÍMITE</span>}
                                            </div>
                                        </div>

                                        <div className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto">
                                            <PressReleaseForm 
                                                pressRelease={null}
                                                isLimitReached={limitReached}
                                                onSave={async (data) => {
                                                    const success = await onAddPressRelease(data);
                                                    if (success) {
                                                        alert("¡Comunicado subido con éxito! Pasará a la rotación gratuita.");
                                                        window.location.reload();
                                                    }
                                                }}
                                                onClose={() => {
                                                    window.location.href = '/';
                                                }}
                                                isModal={false}
                                            />
                                        </div>
                                    </>
                                );
                            })()}
                        </>
                    ) : activeTab === 'talent' ? (
                        <div className="space-y-6">
                             <div className="bg-secondary/5 border-l-4 border-secondary p-4 rounded-r-lg">
                                <h3 className="text-lg font-bold text-secondary">Mi Perfil Profesional</h3>
                                <p className="text-text-secondary mt-1 text-sm">
                                    Completa tu perfil para que empresas y medios puedan encontrarte en el **Banco de Talentos**. Recuerda que como usuario Gratis, algunos campos de contacto directo están limitados.
                                </p>
                            </div>
                            
                            {isLoadingProfile ? (
                                <div className="text-center py-10">Cargando perfil...</div>
                            ) : (
                                <div className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto">
                                    <TalentProfileForm 
                                        talentProfile={myProfile}
                                        isPremium={isPremium}
                                        onSave={handleSaveProfile}
                                        onClose={() => setActiveTab('content')}
                                        isModal={false}
                                    />
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'subscription' ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-bold font-serif text-text-primary">Tu Suscripción CiPress</h3>
                                <p className="text-text-secondary mt-2">Actualmente estás en el plan de Colaborador Gratuito</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Plan Actual */}
                                <div className="bg-surface p-8 rounded-2xl border-2 border-gray-100 shadow-sm opacity-80">
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold text-gray-700">Colaborador Gratis</h4>
                                        <p className="text-3xl font-black text-gray-300 mt-2">$0 <span className="text-sm font-normal">/mes</span></p>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start text-sm text-gray-500">
                                            <CheckIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                            <span>Subida de comunicados ilimitada.</span>
                                        </li>
                                        <li className="flex items-start text-sm text-gray-500">
                                            <CheckIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                            <span>Visibilidad en repositorio general.</span>
                                        </li>
                                        <li className="flex items-start text-sm text-gray-500">
                                            <CheckIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                            <span>Aparición en Home (Horario nocturno 12pm-4am).</span>
                                        </li>
                                    </ul>
                                    <div className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-lg text-center cursor-default">
                                        Plan Actual
                                    </div>
                                </div>

                                {/* Plan Premium */}
                                <div className="bg-white p-8 rounded-2xl border-2 border-primary shadow-xl relative overflow-hidden transform hover:scale-[1.02] transition-transform">
                                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                                        RECOMENDADO
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold text-primary flex items-center">
                                            <StarIcon className="h-6 w-6 mr-2" />
                                            Colaborador Premium
                                        </h4>
                                        <p className="text-3xl font-black text-text-primary mt-2">$3.000 <span className="text-sm font-normal">/mes</span></p>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start text-sm text-text-secondary">
                                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="font-semibold text-text-primary">Visibilidad 24/7 en Portada</span> (Sin restricciones de horario).
                                        </li>
                                        <li className="flex items-start text-sm text-text-secondary">
                                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="font-semibold text-text-primary">Banco de Talentos VIP</span>: Aparece en los primeros lugares y con badge Premium.
                                        </li>
                                        <li className="flex items-start text-sm text-text-secondary">
                                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="font-semibold text-text-primary">Acceso a Mis Galerías</span>: Sube tu portafolio fotográfico.
                                        </li>
                                        <li className="flex items-start text-sm text-text-secondary">
                                            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="font-semibold text-text-primary">Contacto Directo</span>: Muestra tu LinkedIn y renta esperada en el perfil.
                                        </li>
                                    </ul>
                                    <button 
                                        onClick={handleUpgrade}
                                        disabled={isProcessingUpgrade}
                                        className={`w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center ${isProcessingUpgrade ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isProcessingUpgrade ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Conectando...
                                            </>
                                        ) : '¡Mejorar a Premium Ahora!'}
                                    </button>
                                    <p className="text-[10px] text-center text-gray-400 mt-4 italic">Pago seguro procesado por Flow (Próximamente)</p>
                                </div>
                            </div>

                            <div className="mt-12 bg-surface p-6 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-text-primary flex items-center">
                                    <SparklesIcon className="h-5 w-5 text-primary mr-2" />
                                    ¿Por qué ser Premium?
                                </h4>
                                <p className="text-sm text-text-secondary mt-2">
                                    Ser Premium en CiPress no solo es una suscripción, es potenciar tu marca personal como periodista. Tu trabajo tendrá una exposición constante ante nuestra audiencia de medios y empresas chilenas, aumentando radicalmente tus posibilidades de conexión laboral.
                                </p>
                            </div>
                        </div>
                    ) : activeTab === 'participate' ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-secondary/5 border-l-4 border-secondary p-4 rounded-r-lg mb-8">
                                <h3 className="text-lg font-bold text-secondary">Herramientas de Participación</h3>
                                <p className="text-text-secondary mt-1 text-sm">
                                    Participa activamente en nuestra comunidad. 
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div onClick={() => onNavigate('entrepreneurs')} className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <h4 className="text-lg font-bold text-gray-800">Emprendimientos</h4>
                                    <p className="text-sm text-gray-500 mt-2">Visita la sección y postula tu emprendimiento periodístico.</p>
                                </div>
                                <div onClick={() => onNavigate('community_posts')} className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <h4 className="text-lg font-bold text-gray-800">Comunidad</h4>
                                    <p className="text-sm text-gray-500 mt-2">Comparte artículos e inicia debates con otros periodistas.</p>
                                </div>
                                <div onClick={() => onNavigate('photojournalism')} className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <h4 className="text-lg font-bold text-gray-800">Fotoperiodismo</h4>
                                    <p className="text-sm text-gray-500 mt-2">Explora y colabora en la sección de fotoperiodismo.</p>
                                </div>
                                <div onClick={() => onNavigate('gallery')} className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <h4 className="text-lg font-bold text-gray-800">Galería de Fotos</h4>
                                    <p className="text-sm text-gray-500 mt-2">Navega por galerías de imágenes cedidas o vende tus propias fotos (requiere Premium para vender).</p>
                                </div>
                                <div onClick={() => onNavigate('opportunities')} className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center md:col-span-2">
                                    <h4 className="text-lg font-bold text-gray-800">Ofrecer Servicios Freelance</h4>
                                    <p className="text-sm text-gray-500 mt-2">Busca ofertas o promociona tus talentos en el directorio freelance.</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default FreeDashboard;
