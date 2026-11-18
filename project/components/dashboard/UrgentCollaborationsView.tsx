import React, { useState } from 'react';
import type { User, ShortCollaboration, MatchCandidate, MatchmakingResult } from '../../types';
import { 
    PencilSquareIcon, 
    TrashIcon, 
    PlusIcon, 
    SparklesIcon, 
    ListBulletIcon, 
    CheckCircleIcon, 
    MapPinIcon,
    ClipboardDocumentIcon,
    ClipboardDocumentCheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import ShortCollaborationForm from '../admin/ShortCollaborationForm';
import { WhatsAppIcon } from '../icons';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';
import { runMatchmaking } from '../../utils/db';

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

    // Estados para Matchmaking IA
    const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
    const [selectedCollab, setSelectedCollab] = useState<ShortCollaboration | null>(null);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);
    const [matchmakingResult, setMatchmakingResult] = useState<MatchmakingResult | null>(null);
    const [copiedCandidateId, setCopiedCandidateId] = useState<number | null>(null);

    // Estado del modal institucional según AGENTS.md
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type?: CiPressModalType;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const showAlert = (title: string, message: string, type: CiPressModalType = 'info') => {
        setModalConfig({
            isOpen: true,
            type,
            title,
            message,
            confirmText: 'Entendido',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

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
        const nameFallback = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'Usuario CiPress';
        const avatarFallback = currentUser.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`;
        
        const finalData = {
            ...data,
            author: nameFallback,
            authorAvatarUrl: avatarFallback,
            authorUserId: currentUser.id
        };
        try {
            await onSave(finalData as ShortCollaboration);
            setActiveTab('lista');
            showAlert('¡Aviso Guardado!', 'Tu pedido de colaboración urgente ha sido publicado exitosamente.', 'success');
        } catch (error) {
            console.error("Error al guardar colaboración urgente:", error);
            showAlert('Error al Guardar', 'Hubo un error en el servidor al intentar guardar el aviso. Por favor intenta nuevamente.', 'danger');
        }
    };

    const handleDeleteClick = (id: number) => {
        setModalConfig({
            isOpen: true,
            type: 'danger',
            title: '¿Eliminar Pedido Urgente?',
            message: '¿Estás seguro de que deseas eliminar este pedido de colaboración? Esta acción es definitiva.',
            confirmText: 'Eliminar Definitivamente',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await onDelete(id);
                    showAlert('Pedido Eliminado', 'La publicación ha sido eliminada del tablero.', 'success');
                } catch (error) {
                    console.error("Error al eliminar colaboración urgente:", error);
                    showAlert('Error al Eliminar', 'Hubo un error en el servidor al intentar eliminar la colaboración.', 'danger');
                }
            }
        });
    };

    // Apertura y ejecución de Matchmaking IA
    const handleOpenMatchmaking = async (collab: ShortCollaboration) => {
        setSelectedCollab(collab);
        setIsMatchmakingOpen(true);
        setIsLoadingMatches(true);
        setMatchmakingResult(null);

        try {
            const res = await runMatchmaking(collab);
            if (res && res.matches) {
                setMatchmakingResult(res);
            } else {
                showAlert('Matchmaking IA', 'No se encontraron coincidencias automáticas en este momento.', 'info');
            }
        } catch (e) {
            showAlert('Asistente IA', 'Hubo un error al ejecutar el emparejamiento inteligente.', 'warning');
        } finally {
            setIsLoadingMatches(false);
        }
    };

    const handleCopyWhatsAppMsg = (id: number, message: string) => {
        navigator.clipboard.writeText(message);
        setCopiedCandidateId(id);
        setTimeout(() => setCopiedCandidateId(null), 2500);
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
            {/* Header con Pestañas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-text-primary flex items-center">
                        <SparklesIcon className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                        Colaboraciones Urgentes
                    </h2>
                    <p className="text-text-secondary mt-1">
                        Conecta con colegas para asignaciones de última hora, despachos y coberturas fotoperiodísticas inmediatas.
                    </p>
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

                                    {/* BOTÓN INTELIGENTE: MATCHMAKING IA */}
                                    <div className="px-6 pb-4">
                                        <button
                                            onClick={() => handleOpenMatchmaking(collab)}
                                            className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer group/btn"
                                        >
                                            <SparklesIcon className="h-4 w-4 mr-1.5 transition-transform group-hover/btn:rotate-12" />
                                            🎯 Matchmaking de Periodistas con IA
                                        </button>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                                            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                                            <span>{collab.whatsappContact}</span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button 
                                                onClick={() => handleEdit(collab)}
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                                title="Editar pedido"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(collab.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                title="Eliminar pedido"
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

            {/* MODAL DIÁLOGO DE MATCHMAKING IA */}
            {isMatchmakingOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col">
                        {/* Cabecera del Modal */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <SparklesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold font-serif text-lg leading-tight">
                                        Matchmaking Inteligente de Talentos
                                    </h3>
                                    <p className="text-white/80 text-xs">
                                        CiPress IA • Análisis de afinidad territorial y especialidades con Gemini
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMatchmakingOpen(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Contenido con Scroll */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                            {/* Resumen del Pedido Analizado */}
                            {selectedCollab && (
                                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                            Requerimiento Analizado
                                        </span>
                                        <span className="text-xs font-serif font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                            {selectedCollab.budget}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">
                                        {selectedCollab.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Plazo: <span className="font-medium text-gray-700">{selectedCollab.deadline}</span>
                                    </p>
                                </div>
                            )}

                            {/* Estado de Carga */}
                            {isLoadingMatches ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-12 w-12 border-3 border-orange-100 border-t-primary"></div>
                                        <SparklesIcon className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Emparejando con el Banco de Talentos...</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                            Analizando especialidades periodísticas, disponibilidad regional y seniority.
                                        </p>
                                    </div>
                                </div>
                            ) : matchmakingResult ? (
                                <div className="space-y-4 animate-fade-in">
                                    {/* Summary Banner */}
                                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
                                        <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                                            {matchmakingResult.summary}
                                        </p>
                                    </div>

                                    {/* Lista de Candidatos Emparejados */}
                                    <div className="space-y-3">
                                        {matchmakingResult.matches.map((candidate: MatchCandidate) => {
                                            const isCopied = copiedCandidateId === candidate.talentId;
                                            const isTop = candidate.matchPercentage >= 80;

                                            return (
                                                <div 
                                                    key={candidate.talentId}
                                                    className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                >
                                                    {/* Datos del Periodista */}
                                                    <div className="flex items-start space-x-3">
                                                        <img 
                                                            src={candidate.avatarUrl || `https://i.pravatar.cc/150?u=${candidate.talentId}`} 
                                                            alt={candidate.name}
                                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0" 
                                                        />
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h5 className="font-bold text-sm text-gray-900">
                                                                    {candidate.name}
                                                                </h5>
                                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                                                    isTop 
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                                                }`}>
                                                                    {candidate.matchPercentage}% Afinidad
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-primary font-medium mt-0.5">
                                                                {candidate.recommendedRole}
                                                            </p>
                                                            <div className="flex items-center text-[11px] text-gray-400 mt-1">
                                                                <MapPinIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                                                <span>{candidate.region}</span>
                                                            </div>

                                                            {/* Razón del Match */}
                                                            <div className="mt-2 space-y-1">
                                                                {candidate.matchReasons.map((reason, idx) => (
                                                                    <p key={idx} className="text-[11px] text-gray-600 flex items-center">
                                                                        <span className="text-emerald-500 mr-1.5">•</span>
                                                                        <span>{reason}</span>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Botones de Contacto Rápido */}
                                                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                const phone = selectedCollab?.whatsappContact?.replace(/\D/g, '') || '';
                                                                const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(candidate.whatsappMessage)}`;
                                                                window.open(waUrl, '_blank');
                                                            }}
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                                                        >
                                                            <WhatsAppIcon className="h-4 w-4 mr-1.5" />
                                                            WhatsApp
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopyWhatsAppMsg(candidate.talentId, candidate.whatsappMessage)}
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                                                            title="Copiar mensaje de contacto sugerido"
                                                        >
                                                            {isCopied ? (
                                                                <>
                                                                    <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                                                    <span className="text-emerald-700 font-bold">¡Copiado!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ClipboardDocumentIcon className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                                                    <span>Copiar Texto</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Pie del Modal */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsMatchmakingOpen(false)}
                                className="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-xl text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal institucional estándar CiPress (AGENTS.md) */}
            <CiPressModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default UrgentCollaborationsView;
