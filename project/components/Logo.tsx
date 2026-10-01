import React from 'react';
import type { Page } from '../types';

interface LogoProps {
  onNavigate: (page: Page, subPage?: string) => void;
  className?: string;
}

const logoStyle = {
  width: '180px',
  height: 'auto'
};

const Logo: React.FC<LogoProps> = ({ onNavigate, className }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onNavigate('home');
      }}
      className={`flex items-center space-x-3 group ${className}`}
      aria-label="Volver a la página de inicio"
    >
      {/* Imagen del logo desde /public/images */}
      <div className="flex items-center h-20 py-4">
        <img
          src="/assets/images/LOGO-CIPRESS-2.png"
          alt="Logo Cipress"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Wordmark */}
    </a>
  );
};

export default Logo;
