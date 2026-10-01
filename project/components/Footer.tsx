
import React from 'react';
import type { Page, PartnerLogo, User } from '../types';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (page: Page, subPage?: string) => void;
  partnerLogos: PartnerLogo[];
  currentUser?: User | null;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, partnerLogos, currentUser }) => {
  return (
    <footer className="bg-surface text-text-primary border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!currentUser && (
          <div className="bg-gradient-to-r from-secondary to-blue-900 rounded-lg p-8 mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold font-serif text-white">Suscríbete Gratis a CiPress</h2>
              <p className="text-blue-200 mt-1">Únete gratis al Círculo de Periodistas Emprendedores e Innovadores de Chile y sé parte del fututo del periodismo.</p>
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('register'); }}
              className="mt-6 md:mt-0 px-6 py-3 font-bold text-secondary bg-white rounded-md hover:bg-gray-200 transition-colors duration-200 shadow-lg flex-shrink-0"
            >
              Registrarme
            </a>
          </div>
        )}

        {/* Partner Logos Section */}
        <div className="text-center py-8">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-text-secondary mb-8">Apoyan al Periodismo Emprendedor</h3>
          <div className="flex justify-center items-center gap-10 md:gap-16 flex-wrap">
            {partnerLogos.map(logo => (
              <a key={logo.id} href={logo.websiteUrl} target="_blank" rel="noopener noreferrer" title={logo.name} className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                <img
                  src={logo.logoUrl}
                  alt={logo.name}
                  className="h-[3.9rem] w-auto max-w-[150px] object-contain"
                />
              </a>
            ))}
          </div>
        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
          <div className="col-span-2 md:col-span-1">
            <Logo onNavigate={onNavigate} />
            <p className="mt-4 text-text-secondary text-sm">Potenciando el trabajo para periodistas a través del emprendimiento y la difusión de oportunidades.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-text-secondary">Comunidad</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="text-base text-text-primary hover:text-primary">Quiénes Somos</a></li>
              <li><a href="#" className="text-base text-text-primary hover:text-primary">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-text-secondary">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms-of-service'); }} className="text-base text-text-primary hover:text-primary">Términos de Servicio</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy-policy'); }} className="text-base text-text-primary hover:text-primary">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} Círculo de Periodistas Innovadores de Chile. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;