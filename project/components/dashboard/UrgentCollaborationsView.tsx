import React, { useState } from 'react';
import type { User, ShortCollaboration } from '../../types';
import { PencilSquareIcon, TrashIcon, PlusIcon, SparklesIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import ShortCollaborationForm from '../admin/ShortCollaborationForm';
import { WhatsAppIcon } from '../icons';

interface UrgentCollaborationsViewProps {
    currentUser: User;
    collaborations: ShortCollaboration[];
    onSave: (data: ShortCollaboration | Omit<ShortCollaboration, 'id'>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const UrgentCollaborationsView: React.FC<UrgentCollaborationsViewProps> = ({
    currentUser,
    collaborations,
    onSave,
    onDelete
}) => {
    const [activeTab, setActiveTab] = useState<'lista' | 'editor'>('lista');
    const [editingCollaboration, setEditingCollaboration] = useState<ShortCollaboration | null>(null);

    const handleEdit = (collaboration: ShortCollaboration) => {
        setEditingCollaboration(collaboration);
        setActiveTab('editor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAdd = () => {
        setEditingCollaboration(null);
        setActiveTab('editor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveDone = async (data: ShortCollaboration | Omit<ShortCollaboration, 'id'>) => {
        // Enjertar datos del usuario de forma robusta
        const nameFallback = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'Usuario CiPress';
        const avatarFallback = currentUser.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`;
        
        const finalData = {
            ...data,
            author: nameFallback,
            authorAvatarUrl: avatarFallback,
            authorUserId: currentUser.id
        };
        await onSave(finalData as ShortCollaboration);
        setActiveTab('lista');
        alert('¡Aviso guardado con éxito!');
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
            {/* Header con Pestañas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-text-primary flex items-center">
                        <SparklesIcon className="h-8 w-8 text-primary mr-3" />
                        Colaboraciones Urgentes
                    </h2>
                    <p className="text-text-secondary mt-1">Conecta con colegas para pedidos de colaboración inmediata.</p>
                </div>
                
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setActiveTab('lista')}
                        className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${
                            activeTab === 'lista' 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ListBulletIcon className="h-5 w-5 mr-2" />
                        Ver Mis Avisos
                    </button>
                    <button
                        onClick={handleAdd}
                        className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${
                            activeTab === 'editor' && !editingCollaboration
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuevo Aviso
                    </button>
                </div>
            </div>

            {activeTab === 'editor' ? (
                <div className="max-w-3xl mx-auto animate-fade-in shadow-xl rounded-3xl overflow-hidden border border-gray-50 bg-white">
                    <div className="bg-primary/5 px-6 py-4 flex items-center border-b border-primary/10">
                        {editingCollaboration ? (
                            <PencilSquareIcon className="h-6 w-6 text-primary mr-3" />
                        ) : (
                            <PlusIcon className="h-6 w-6 text-primary mr-3" />
                        )}
                        <span className="font-bold text-primary italic">
                            {editingCollaboration ? 'Modificando Pedido Existente' : 'Creando Nueva Publicación Urgente'}
                        </span>
                    </div>
                    <ShortCollaborationForm
                        collaboration={editingCollaboration}
                        onSave={handleSaveDone}
                        onClose={() => setActiveTab('lista')}
                        isModal={false}
                        hideAuthorFields={true}
                    />
                </div>
            ) : (
                <>
                    {collaborations.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PlusIcon className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">No tienes pedidos urgentes publicados</h3>
                            <button
                                onClick={handleAdd}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                Pulsa aquí para crear el primero
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {collaborations.map(collab => (
                                <div key={collab.id} className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col hover:shadow-xl transition-all group overflow-hidden">
                                     <div className="p-6 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-tight h-12">
                                                {collab.title}
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-3 pt-4 border-t border-gray-50 mt-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400 font-medium">Plazo</span>
                                                <span className="font-bold text-text-primary px-2 py-0.5 bg-gray-50 rounded">{collab.deadline}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400 font-medium">Presupuesto</span>
                                                <span className="font-bold text-green-600 font-serif px-2 py-0.5 bg-green-50 rounded">{collab.budget}</span>
                                            </div>
                                        </div>
                                     </div>

                                    <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                                            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                                            <span>{collab.whatsappContact}</span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button 
                                                onClick={() => handleEdit(collab)}
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (confirm('¿Deseas eliminar este pedido definitivamente?')) {
                                                        onDelete(collab.id);
                                                    }
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UrgentCollaborationsView;
