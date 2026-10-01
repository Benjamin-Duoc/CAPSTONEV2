import React from 'react';
import type { Page, User, HeroHeading, SiteStat, PartnerLogo } from '../types';

interface HomePageProps {
    onNavigate: (page: Page, subPage?: string) => void;
    currentUser?: User | null;
    heroHeading: HeroHeading | null;
    stats: SiteStat[];
    partnerLogos: PartnerLogo[];
}

const HomePage: React.FC<HomePageProps> = ({
    onNavigate,
    currentUser,
    heroHeading,
    stats,
    partnerLogos,
}) => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        {heroHeading?.title || 'CiPress'}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        {heroHeading?.subtitle || 'Círculo de Periodistas Emprendedores e Innovadores de Chile'}
                    </p>
                    <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                        Ecosistema colaborativo para el periodismo independiente. Publicaciones, fotoperiodismo, mercado laboral y herramientas de IA — todo en un solo lugar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {!currentUser ? (
                            <>
                                <button
                                    onClick={() => onNavigate('register')}
                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Únete a CiPress
                                </button>
                                <button
                                    onClick={() => onNavigate('login')}
                                    className="px-8 py-3 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Iniciar Sesión
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Ir a Mi Panel
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {stats.length > 0 && (
                <section className="bg-white py-12 px-4 border-b">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.id} className="p-4">
                                <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                                <div className="text-gray-600 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Modules Preview - Coming Soon */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">Módulos del Ecosistema</h2>
                    <p className="text-center text-gray-500 mb-12">Plataforma en desarrollo activo — Sprint 1</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '📰', title: 'Portal Editorial', desc: 'Portada inteligente con rotación horaria de contenidos y publicaciones editoriales.' },
                            { icon: '📸', title: 'Fotoperiodismo', desc: 'Marketplace fotográfico con marcas de agua dinámicas y licencias de uso.' },
                            { icon: '💼', title: 'Mercado Laboral', desc: 'Bolsa de trabajo especializada y banco de talentos para periodistas.' },
                            { icon: '🤖', title: 'Asistente IA', desc: 'Herramientas de IA generativa para redacción, perfiles y matchmaking laboral.' },
                            { icon: '💳', title: 'Suscripciones', desc: 'Sistema de membresías con pasarela de pagos integrada (Flow).' },
                            { icon: '👥', title: 'Comunidad', desc: 'Foros, colaboraciones urgentes y directorio de fuentes especializadas.' },
                        ].map((mod, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="text-3xl mb-3">{mod.icon}</div>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">{mod.title}</h3>
                                <p className="text-gray-500 text-sm">{mod.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Acerca de CiPress</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        CiPress nace como respuesta a la fragmentación tecnológica que enfrentan los periodistas independientes
                        en Chile. Nuestra misión es concentrar en un único ecosistema digital las herramientas que hoy están
                        dispersas: publicación, monetización, empleo y productividad asistida por IA.
                    </p>
                    <button
                        onClick={() => onNavigate('about')}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Conocer Más
                    </button>
                </div>
            </section>

            {/* Partner Logos */}
            {partnerLogos.length > 0 && (
                <section className="py-12 px-4 bg-gray-50 border-t">
                    <div className="max-w-6xl mx-auto text-center">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Alianzas Estratégicas</h3>
                        <div className="flex flex-wrap justify-center items-center gap-8">
                            {partnerLogos.map((partner) => (
                                <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer"
                                   className="opacity-60 hover:opacity-100 transition-opacity">
                                    <img src={partner.logoUrl} alt={partner.name} className="h-12 object-contain" />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;
