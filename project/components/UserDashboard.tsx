import React from 'react';
import type { Page, User } from '../types';

interface UserDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onOpenPressRelease?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigate,
}) => {
  const roleName = typeof currentUser.role === 'string'
    ? currentUser.role
    : (currentUser.role as any)?.name || 'Colaborador';

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                {(currentUser.firstName?.[0] || 'U') + (currentUser.lastName?.[0] || '')}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif">{currentUser.firstName} {currentUser.lastName}</h1>
                <p className="text-blue-200 text-sm">{currentUser.email}</p>
              </div>
            </div>
            <span className="self-start sm:self-center px-3 py-1 bg-white/10 text-white border border-white/20 text-xs font-semibold rounded-full tracking-wider uppercase">
              {roleName}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Cuenta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Nombre completo</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{currentUser.firstName} {currentUser.lastName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Correo Electrónico</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{currentUser.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Región</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{currentUser.region || 'Metropolitana de Santiago'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Estado de la cuenta</p>
              <p className="text-sm font-semibold text-green-600 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Activa (Sprint 1-2)
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones de Plataforma</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => onNavigate('upload-press-release')}
              className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-left hover:bg-orange-100/70 transition-colors group"
            >
              <p className="text-sm font-bold text-orange-900 group-hover:text-orange-950">Redactar Comunicado</p>
              <p className="text-xs text-orange-700/80 mt-1">Publica una nota de prensa con el editor de bloques</p>
            </button>
            <button
              onClick={() => onNavigate('opportunities')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100/70 transition-colors group"
            >
              <p className="text-sm font-bold text-blue-900 group-hover:text-blue-950">Bolsa Laboral</p>
              <p className="text-xs text-blue-700/80 mt-1">Explora empleos y colaboraciones en medios</p>
            </button>
            <button
              onClick={() => onNavigate('photojournalism')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100/70 transition-colors group"
            >
              <p className="text-sm font-bold text-purple-900 group-hover:text-purple-950">Fotoperiodismo</p>
              <p className="text-xs text-purple-700/80 mt-1">Explora reportajes gráficos y fotos con licencia</p>
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('home')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              &larr; Volver a la portada
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
