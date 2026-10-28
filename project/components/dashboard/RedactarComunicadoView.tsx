import React, { useState } from 'react';
import type { User, PressRelease } from '../../types';
import PressReleaseForm from '../admin/PressReleaseForm';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RedactarComunicadoViewProps {
    currentUser: User;
    userPressReleases: PressRelease[];
    onSavePressRelease: (pressRelease: PressRelease | Omit<PressRelease, 'id'>) => Promise<void>;
    onDeletePressRelease: (id: number) => Promise<void>;
}

const RedactarComunicadoView: React.FC<RedactarComunicadoViewProps> = ({ 
    currentUser, 
    userPressReleases, 
    onSavePressRelease, 
    onDeletePressRelease 
}) => {
    const [activeTab, setActiveTab] = useState<'lista' | 'editor'>('lista');
    const [editingRelease, setEditingRelease] = useState<PressRelease | null>(null);

    const handleSave = async (data: PressRelease | Omit<PressRelease, 'id'>) => {
        try {
            await onSavePressRelease(data);
            setActiveTab('lista');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setEditingRelease(null);
            alert('¡Comunicado guardado exitosamente!');
        } catch (error) {
            console.error(error);
            alert('Hubo un error al guardar el comunicado.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este comunicado? Esta acción no se puede deshacer.")) {
            try {
                await onDeletePressRelease(id);
                alert("Comunicado eliminado exitosamente.");
            } catch (error) {
                console.error(error);
                alert("Hubo un error al eliminar el comunicado.");
            }
        }
    };

    const handleCreateNew = () => {
        setEditingRelease(null);
        setActiveTab('editor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditRelease = (pr: PressRelease) => {
        setEditingRelease(pr);
        setActiveTab('editor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isPremium = currentUser?.role?.toLowerCase().includes('premium') || currentUser?.role?.toLowerCase() === 'administrador';
    
    let countToday = 0;
    if (!isPremium) {
        const todayStr = new Date().toISOString().split('T')[0];
        countToday = userPressReleases.filter(pr => {
            // Check if createdAt exists and matches today's date prefix
            if (pr.createdAt && pr.createdAt.startsWith(todayStr)) return true;
            // Fallback to checking the date field
            if (pr.date && pr.date.includes(todayStr)) return true;
            // Also consider newly created ones that might just have a recent sequential ID
            // but relying on date is better.
            return false;
        }).length;
    }
    const limitReached = !isPremium && countToday >= 3;

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-fade-in relative">
            <div className="px-6 md:px-10 py-8">
                
                {/* Header & Tabs Row */}
                <div className="border-b border-gray-200 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => {
                                setActiveTab('lista');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`pb-4 text-lg font-bold transition-colors whitespace-nowrap ${
                                activeTab === 'lista'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Mis Comunicados ({userPressReleases.length})
                        </button>
                        <button
                            onClick={handleCreateNew}
                            disabled={limitReached}
                            className={`pb-4 text-lg font-bold transition-colors whitespace-nowrap flex items-center ${
                                activeTab === 'editor' && !editingRelease
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            } ${limitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Redactar Nuevo
                        </button>
                        {activeTab === 'editor' && editingRelease && (
                            <div className="pb-4 text-lg font-bold text-primary border-b-2 border-primary flex items-center">
                                <PencilSquareIcon className="w-5 h-5 mr-2" />
                                Editando Comunicado
                            </div>
                        )}
                    </div>
                    
                    {!isPremium && (
                        <div className={`flex items-center space-x-2 px-4 py-2 mt-4 sm:mt-0 rounded-lg text-sm font-bold shadow-sm ${limitReached ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            <span>Límite Diario:</span>
                            <span className="text-lg">{countToday}/3</span>
                        </div>
                    )}
                </div>

                {/* Tab Content: Editor */}
                {activeTab === 'editor' && (
                    <div className="animate-fade-in">
                        <PressReleaseForm 
                            pressRelease={editingRelease} 
                            onSave={handleSave} 
                            onClose={() => {
                                setActiveTab('lista');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            isModal={false}
                            isLimitReached={limitReached}
                        />
                    </div>
                )}

                {/* Tab Content: Lista */}
                {activeTab === 'lista' && (
                    <div className="animate-fade-in">
                        {userPressReleases.length === 0 ? (
                            <div className="text-center py-20 px-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <div className="mx-auto w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Aún no tienes comunicados</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-6">Comparte noticias e información relevante sobre tu empresa con la comunidad de CiPress.</p>
                                <button 
                                    onClick={handleCreateNew}
                                    className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    Comenzar a redactar
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userPressReleases.map((pr) => (
                                    <div key={pr.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={pr.imageUrl} alt={pr.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                                                {pr.date}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col">
                                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2 line-clamp-2">{pr.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow">{pr.summary}</p>
                                            
                                            <div className="pt-4 mt-auto border-t border-gray-100 flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => handleEditRelease(pr)}
                                                    className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    title="Editar comunicado"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(pr.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                    title="Eliminar comunicado"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedactarComunicadoView;
