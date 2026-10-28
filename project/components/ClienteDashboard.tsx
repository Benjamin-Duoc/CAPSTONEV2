import React from 'react';
import type { User, PremiumSponsor } from '../types';
import ConfianEnCipressView from './dashboard/ConfianEnCipressView';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface ClienteDashboardProps {
    currentUser: User | null;
    onLogout: () => void;
    premiumSponsors: PremiumSponsor[];
    onAddSponsor: (sponsor: Omit<PremiumSponsor, 'id'>) => Promise<void>;
    onUpdateSponsor: (sponsor: PremiumSponsor) => Promise<void>;
}

const ClienteDashboard: React.FC<ClienteDashboardProps> = ({
    currentUser,
    onLogout,
    premiumSponsors,
    onAddSponsor,
    onUpdateSponsor
}) => {
    return (
        <div className="flex h-screen bg-neutral font-sans">
            {/* Sidebar Minimal */}
            <div className="w-64 bg-surface border-r border-gray-200 flex flex-col justify-between">
                <div>
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold font-serif text-text-primary">Panel VIP</h2>
                        <p className="text-sm text-text-secondary mt-1 truncate">{currentUser?.email}</p>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-neutral p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mb-8">
                        <h3 className="text-lg font-bold text-primary">Bienvenido a su Panel VIP de CiPress</h3>
                        <p className="text-text-secondary mt-1">Como Cliente VIP, aquí puede gestionar exclusivamente el logo y enlace que aparecerá en nuestra portada en la sección "Confían en CiPress".</p>
                    </div>
                    
                    <ConfianEnCipressView
                        currentUser={currentUser!}
                        premiumSponsors={premiumSponsors}
                        onSave={async (data) => {
                            const existingSponsor = premiumSponsors.find(s => s.userId === currentUser?.id);
                            if (existingSponsor) {
                                await onUpdateSponsor({ ...existingSponsor, ...data } as PremiumSponsor);
                            } else {
                                await onAddSponsor({ 
                                    ...data, 
                                    nameColor: '#000000', 
                                    ctaColor: '#FF6B00' 
                                } as Omit<PremiumSponsor, 'id'>);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClienteDashboard;
