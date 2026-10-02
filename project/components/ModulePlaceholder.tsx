import React from 'react';

interface ModulePlaceholderProps {
  title: string;
  sprint?: string;
  description?: string;
  onBack: () => void;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  sprint = 'Sprint 3',
  description = 'Este módulo está planificado para las próximas fases de desarrollo según el cronograma del proyecto.',
  onBack
}) => {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4">
          En desarrollo &bull; {sprint}
        </span>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {description}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          Volver a la Portada
        </button>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
