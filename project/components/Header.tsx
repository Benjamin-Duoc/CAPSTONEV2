import React, { useState } from 'react';
import type { Page, User } from '../types';
import Logo from './Logo';
interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page, subPage?: string) => void;
    isAdminMode: boolean;
    currentUser?: User | null;
    onLogout?: () => void;
    onEditProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, isAdminMode, currentUser, onLogout, onEditProfile }) => {
    const [showUserMenu, setShowUserMenu] = useState(false); // Estado para el menú desplegable (Del Main)

    const mainNavItems: { page: Page; label: string }[] = [
        { page: 'courses', label: 'Capacitación' },
        { page: 'specialists', label: 'Fuentes Destacadas' },
        { page: 'funding', label: 'Fondos y Becas' },
        { page: 'events', label: 'Próximos Eventos' },
        { page: 'opportunities', label: 'Oportunidades Laborales' },
        { page: 'photojournalism', label: 'Fotoperiodismo' },
    ];

    return (
        <>
            <header className="bg-background/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center">
                            <Logo onNavigate={onNavigate} />
                        </div>
                        <nav className="hidden md:flex md:space-x-8">

                            {mainNavItems.map((item) => (
                                <a
                                    key={item.page}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onNavigate(item.page); }}
                                    className={`text-base font-medium transition-colors duration-200 relative ${currentPage === item.page ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {item.label}
                                    {currentPage === item.page && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"></span>}
                                </a>
                            ))}
                        </nav>
                        <div className="flex items-center space-x-4">

                            {/* Menú de Usuario con Dropdown (Versión MAIN mejorada) */}
                            {currentUser ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-highlight flex items-center justify-center text-primary font-black text-xs overflow-hidden">
                                            {currentUser.avatarUrl ? (
                                                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                (currentUser.firstName?.[0] || 'U') + (currentUser.lastName?.[0] || '')
                                            )}
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-sm font-bold text-text-primary leading-tight text-[15px]">Hola {currentUser.firstName || 'Usuario'}</p>
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50 animate-fade-in">
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    onNavigate('dashboard');
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:text-primary hover:bg-gray-50 transition-colors bg-surface border-y border-gray-100"
                                            >
                                                Mi Panel
                                            </button>

                                            {(() => {
                                                const roleStr = (typeof currentUser.role === 'string' ? currentUser.role : (currentUser.role as any)?.name || '').toLowerCase();
                                                const isActualAdmin = isAdminMode || roleStr.includes('admin') || currentUser.email === 'ana@administrador.cl';

                                                return isActualAdmin && (
                                                    <>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        <button
                                                            onClick={() => {
                                                                setShowUserMenu(false);
                                                                onNavigate('admin');
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                                                        >
                                                            Administrar
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    if (onLogout) onLogout();
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
                                        className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block"
                                    >
                                        Ingresar
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onNavigate('register'); }}
                                        className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-primary/20"
                                    >
                                        Registrarme
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;