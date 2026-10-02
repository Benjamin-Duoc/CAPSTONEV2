import React from 'react';
import UserPressReleaseForm from './UserPressReleaseForm';
import type { PressRelease, Page } from '../types';

interface PressReleaseUploadPageProps {
  onSave: (pressRelease: Omit<PressRelease, 'id'>) => void;
  onNavigate: (page: Page) => void;
}

const PressReleaseUploadPage: React.FC<PressReleaseUploadPageProps> = ({ onSave, onNavigate }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('press-releases')}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 mb-2"
        >
          &larr; Volver a Comunicados de Prensa
        </button>
        <h1 className="text-3xl font-bold font-serif text-gray-900">Redactar Comunicado de Prensa</h1>
        <p className="text-sm text-gray-600 mt-1">
          Completa la ficha informativa y redacta el comunicado con el editor de bloques periodísticos.
        </p>
      </div>
      <UserPressReleaseForm
        onSave={(data) => {
          onSave(data);
          onNavigate('press-releases');
        }}
        onClose={() => onNavigate('press-releases')}
      />
    </div>
  );
};

export default PressReleaseUploadPage;
