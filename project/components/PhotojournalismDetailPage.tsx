import React from 'react';
import type { PhotojournalismPost } from '../types';
import { WhatsAppIcon } from './icons';

interface PhotojournalismDetailPageProps {
    post: PhotojournalismPost;
    onBack: () => void;
}

const PhotojournalismDetailPage: React.FC<PhotojournalismDetailPageProps> = ({ post, onBack }) => {
    return (
        <div className="bg-background animate-fade-in min-h-screen">
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

                <article className="bg-surface rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                    <div className="relative h-96 md:h-[600px] w-full bg-gray-900">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl md:text-5xl font-black font-serif text-text-primary mb-6">{post.title}</h1>

                            <div className="flex items-center justify-between border-b border-gray-200 pb-8 mb-8">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={post.photographerAvatarUrl}
                                        alt={post.photographerName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                                    />
                                    <div>
                                        <p className="font-bold text-text-primary text-lg">{post.photographerName}</p>
                                        <p className="text-sm text-text-secondary">Fecha de captura: {post.dateTaken}</p>
                                    </div>
                                </div>
                                <a
                                    href={`https://wa.me/${post.whatsappContact}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md font-medium"
                                >
                                    <WhatsAppIcon className="h-5 w-5 mr-2" />
                                    Contactar Fotógrafo
                                </a>
                            </div>

                            <div className="prose prose-lg text-text-secondary max-w-none">
                                <p className="text-xl leading-relaxed italic border-l-4 border-primary pl-6">{post.caption}</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default PhotojournalismDetailPage;
