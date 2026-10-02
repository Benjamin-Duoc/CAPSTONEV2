import React from 'react';
import type { PremiumSponsor } from '../types';
import { TwitterIcon, FacebookIcon, LinkedInIcon, InstagramIcon } from './icons';

interface SponsorDetailPageProps {
    sponsor: PremiumSponsor;
    onBack: () => void;
}

const SponsorDetailPage: React.FC<SponsorDetailPageProps> = ({ sponsor, onBack }) => {

    const renderContent = () => {
        if (!sponsor.reportContent || sponsor.reportContent.length === 0) {
            return <p className="text-lg text-text-secondary mb-6 leading-relaxed">Más información sobre {sponsor.name} próximamente.</p>;
        }

        return sponsor.reportContent.map((item, index) => {
            switch (item.type) {
                case 'paragraph':
                    return <p key={index} className="text-lg text-text-secondary mb-6 leading-relaxed">{item.text}</p>;
                case 'image':
                    return (
                        <figure key={index} className="my-10">
                            <img src={item.src} alt={item.alt} className="w-full h-auto rounded-lg shadow-lg" />
                            <figcaption className="text-center text-sm text-gray-500 mt-2">{item.alt}</figcaption>
                        </figure>
                    );
                case 'quote':
                    return (
                        <blockquote key={index} className="my-12 p-6 border-l-4 border-primary bg-surface rounded-r-lg shadow-sm">
                            <p className="text-2xl font-serif italic text-text-primary leading-tight">"{item.text}"</p>
                            {item.author && <cite className="block text-right text-text-secondary mt-4 not-italic">&mdash; {item.author}</cite>}
                        </blockquote>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <div className="bg-background animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <article>
                    <header className="mb-12">
                        <div className="w-full h-96 overflow-hidden rounded-lg shadow-2xl mb-8">
                            <img src={sponsor.imageUrl} alt={sponsor.name} className="w-full h-full object-cover"/>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-serif text-text-primary mt-2">{sponsor.name}</h1>
                        <p className="text-xl text-text-secondary mt-4 max-w-3xl">{sponsor.tagline}</p>
                        
                        {sponsor.reportAuthor && (
                             <div className="mt-6 flex items-center text-sm text-text-secondary border-t border-b border-gray-200 py-4">
                                <img src={`https://i.pravatar.cc/40?u=${sponsor.reportAuthor}`} alt={sponsor.reportAuthor} className="w-10 h-10 rounded-full mr-4" />
                                <div>
                                    <p className="font-semibold text-text-primary">Artículo por {sponsor.reportAuthor}</p>
                                    {/* @ts-ignore - reportDate doesn't officially exist on PremiumSponsor but might come from old data */}
                                    {sponsor.reportDate && <p>Publicado el {sponsor.reportDate}</p>}
                                </div>
                            </div>
                        )}
                    </header>
                    
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}

                        <div className="mt-12 pt-8 border-t border-gray-200">
                             <a href={sponsor.ctaLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto inline-block text-center px-8 py-4 text-lg font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-primary/20">
                                {sponsor.ctaText}
                            </a>
                            <div className="mt-8">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 text-center">Compartir</h4>
                                <div className="flex justify-center space-x-4 mt-3">
                                    <a href="#" aria-label="Compartir en Twitter" className="text-gray-400 hover:text-gray-800 transition-colors">
                                        <TwitterIcon className="h-6 w-6" />
                                    </a>
                                    <a href="#" aria-label="Compartir en Facebook" className="text-gray-400 hover:text-blue-600 transition-colors">
                                        <FacebookIcon className="h-6 w-6" />
                                    </a>
                                    <a href="#" aria-label="Compartir en LinkedIn" className="text-gray-400 hover:text-blue-700 transition-colors">
                                        <LinkedInIcon className="h-6 w-6" />
                                    </a>
                                    <a href="#" aria-label="Compartir en Instagram" className="text-gray-400 hover:text-pink-600 transition-colors">
                                        <InstagramIcon className="h-6 w-6" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </article>
            </div>
        </div>
    );
};

export default SponsorDetailPage;