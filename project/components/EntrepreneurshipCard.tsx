import React from 'react';
import { StarIcon } from './icons';
import { Entrepreneurship } from '../types';

interface Props {
    entrepreneurship: Entrepreneurship;
    onPortfolioClick?: (url: string) => void;
}

export const EntrepreneurshipCard: React.FC<Props> = ({ entrepreneurship, onPortfolioClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-48 overflow-hidden relative">
                <img
                    src={entrepreneurship.imageUrl || 'https://via.placeholder.com/400x225'}
                    alt={entrepreneurship.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <span className="text-secondary font-bold text-xs tracking-wider uppercase mb-1">
                    {entrepreneurship.specialty}
                </span>
                <h3 className="text-lg font-bold text-text-primary mb-2 leading-tight">
                    {entrepreneurship.name}
                </h3>
                <p className="text-sm text-text-secondary flex-grow mb-4">
                    {entrepreneurship.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                        <span className="font-bold text-sm text-gray-800">{entrepreneurship.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">/ 7 ({entrepreneurship.reviewCount})</span>
                    </div>
                    <button
                        onClick={() => onPortfolioClick && onPortfolioClick(entrepreneurship.portfolioUrl)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded-md text-sm transition-colors shadow-sm"
                    >
                        Portafolio
                    </button>
                </div>
            </div>
        </div>
    );
};
