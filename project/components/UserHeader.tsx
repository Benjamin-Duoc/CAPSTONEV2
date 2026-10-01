import React, { useState } from 'react';
import { User } from '../types';
import { UserIcon } from './icons';

interface UserHeaderProps {
    user: User;
    userTypeLabel: string;
    onLogout: () => void;
    onNavigate?: (page: string) => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, userTypeLabel, onLogout, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary mr-4">Cipress</h1>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                    {userTypeLabel}
                </span>
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary focus:outline-none"
                >
                    <span className="font-medium">Hola, {user.firstName}</span>
                    <div className="bg-gray-200 p-2 rounded-full">
                        <UserIcon className="w-5 h-5" />
                    </div>
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-500 truncate">{user.role}</p>
                        </div>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                if (onNavigate) onNavigate('dashboard');
                            }}
                            className="block w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                            Mi Panel
                        </button>
                        
                        <button
                            onClick={onLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 border-t border-gray-100"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default UserHeader;
