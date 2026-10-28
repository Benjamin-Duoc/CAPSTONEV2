import React, { useState, useEffect } from 'react';
import type { User, TalentProfile } from '../../types';
import TalentProfileForm from '../admin/TalentProfileForm';
import { getMyTalentProfile, saveMyTalentProfile } from '../../utils/db';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface TalentProfileViewProps {
    currentUser: User;
}

const TalentProfileView: React.FC<TalentProfileViewProps> = ({ currentUser }) => {
    const [myProfile, setMyProfile] = useState<TalentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isPremium = (currentUser.role || '').toLowerCase().includes('premium');

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            const profile = await getMyTalentProfile();
            setMyProfile(profile);
            setIsLoading(false);
        };
        loadProfile();
    }, []);

    const handleSave = async (data: any) => {
        try {
            const saved = await saveMyTalentProfile(data);
            setMyProfile(saved);
            if (isPremium) {
                alert("¡Tu perfil de talento ha sido actualizado! Ya está visible con prioridad Premium en el Banco de Talentos.");
            } else {
                alert("¡Tu perfil de talento ha sido actualizado con éxito! Pásate a Premium para destacar con prioridad e incluir tu renta y contacto directo en el Banco de Talentos.");
            }
        } catch (error) {
            alert("Error al guardar el perfil.");
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        <SparklesIcon className="h-8 w-8 text-primary mr-3" />
                        Mi Perfil en el Banco de Talentos
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Gestiona cómo te ven los medios y empresas que buscan nuevos talentos en CiPress.
                    </p>
                </div>
                {isPremium && (
                    <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-lg">
                        <span className="text-orange-600 font-bold text-sm flex items-center">
                            <SparklesIcon className="h-4 w-4 mr-2" />
                            Prioridad Premium Activa
                        </span>
                    </div>
                )}
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500 font-medium">Cargando tus datos profesionales...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Formulario de Perfil</h2>
                    </div>
                    <div className="p-0 md:p-2">
                         <TalentProfileForm 
                            talentProfile={myProfile}
                            isPremium={isPremium}
                            onSave={handleSave}
                            onClose={() => {}} // No closing needed in this view
                            isModal={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentProfileView;
