import React, { useState, useMemo } from 'react';
import type { NewsArticle } from '../types';
import { getImageUrl } from '../utils/mediaUtils';

interface NewsModuleProps {
    newsArticles: NewsArticle[];
    onSelectNewsArticle: (article: NewsArticle) => void;
    onBack: () => void;
}

const NewsCard: React.FC<{ article: NewsArticle; isFeatured?: boolean; onClick: () => void; }> = ({ article, isFeatured = false, onClick }) => {
    if (isFeatured) {
        return (
            <button onClick={onClick} className="bg-surface rounded-lg shadow-xl overflow-hidden md:col-span-2 lg:col-span-3 grid md:grid-cols-2 group border border-gray-200 text-left w-full">
                <div className="md:order-2 overflow-hidden">
                    <img src={getImageUrl(article.imageUrl)} alt={article.title} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-8 flex flex-col justify-center md:order-1">
                    <span className="text-sm font-bold uppercase text-primary tracking-wide">{article.category}</span>
                    <h2 className="text-3xl font-bold font-serif text-text-primary mt-2 group-hover:text-primary transition-colors">{article.title}</h2>
                    <p className="text-md text-text-secondary mt-4">{article.summary}</p>
                    <p className="text-sm text-gray-500 mt-4">{article.author} &middot; {article.date}</p>
                    <span className="mt-6 text-accent font-semibold group-hover:underline">Leer análisis completo &rarr;</span>
                </div>
            </button>
        )
    }

    return (
        <button onClick={onClick} className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group border border-gray-200 text-left w-full">
            <div className="overflow-hidden">
                <img src={getImageUrl(article.imageUrl)} alt={article.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="p-5">
                <span className="text-xs font-bold uppercase text-primary tracking-wide">{article.category}</span>
                <h3 className="font-bold text-xl font-serif text-text-primary mt-2 h-24 group-hover:text-primary transition-colors">{article.title}</h3>
                <p className="text-sm text-gray-500 mt-3">{article.author} &middot; {article.date}</p>
                 <span className="mt-4 inline-block text-accent font-semibold text-sm group-hover:underline">Leer más &rarr;</span>
            </div>
        </button>
    );
}

const NewsModule: React.FC<NewsModuleProps> = ({ newsArticles, onSelectNewsArticle, onBack }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;
    
    // Sort articles by ID descending (newest first)
    const sortedArticles = useMemo(() => {
        return [...newsArticles].sort((a, b) => b.id - a.id);
    }, [newsArticles]);
    
    // Calculate total pages based on all articles (10 per page)
    const totalPages = Math.ceil(sortedArticles.length / ITEMS_PER_PAGE);

    // Get current page articles
    const currentPageArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedArticles]);
    
    // First article of current page is featured, rest are normal
    const featuredArticle = currentPageArticles[0];
    const otherArticles = currentPageArticles.slice(1);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Análisis y Comunidad</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Ideas, debates y tendencias que moldean el futuro del periodismo y los medios.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredArticle && <NewsCard article={featuredArticle} isFeatured={true} onClick={() => onSelectNewsArticle(featuredArticle)} />}
                    {otherArticles.map(article => (
                        <NewsCard key={article.id} article={article} onClick={() => onSelectNewsArticle(article)} />
                    ))}
                </div>

                {/* Paginación personalizada */}
                <div className="flex justify-center items-center space-x-3 mt-16 mb-8">
                    <button
                        onClick={() => {
                            if (currentPage > 1) {
                                window.scrollTo(0, 0);
                                setCurrentPage(currentPage - 1);
                            }
                        }}
                        disabled={currentPage === 1}
                        className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                            currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-orange-600'
                        }`}
                    >
                        Atrás
                    </button>
                    <span className="text-base font-semibold text-text-primary">
                        {currentPage}/{totalPages}
                    </span>
                    <button
                        onClick={() => {
                            if (currentPage < totalPages) {
                                window.scrollTo(0, 0);
                                setCurrentPage(currentPage + 1);
                            }
                        }}
                        disabled={currentPage === totalPages}
                        className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-orange-600'
                        }`}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsModule;