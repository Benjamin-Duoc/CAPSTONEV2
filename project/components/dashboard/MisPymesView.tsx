import React, { useState, useEffect } from 'react';
import type { User, Entrepreneurship } from '../../types';
import EntrepreneurForm from '../admin/EntrepreneurForm';
import { 
    BuildingOfficeIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    GlobeAltIcon,
    MapPinIcon,
    TagIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { ENV } from '../../src/config/env';

const API_BASE = ENV.isDevelopment ? '/api' : ENV.apiUrl;

interface MisPymesViewProps {
    currentUser: User;
}

const MisPymesView: React.FC<MisPymesViewProps> = ({ currentUser }) => {
    const [pymes, setPymes] = useState<Entrepreneurship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPyme, setEditingPyme] = useState<Entrepreneurship | null>(null);

    const loadPymes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/entrepreneurships`);
            if (res.ok) {
                const data = await res.json();
                // Filter by userId (camelCase from keysToCamel in db.ts, but here we fetch directly)
                // Actually, the route_factory uses marshmallow which usually returns snake_case unless configured otherwise.
                // But in this project, the frontend usually expects camelCase because of keysToCamel in fetchList.
                // Since I'm using raw fetch here, I'll handle both or just use the same logic as db.ts if I could.
                // Let's assume the backend returns snake_case and we filter manually.
                const userPymes = data.filter((p: any) => p.user_id === currentUser.id || p.userId === currentUser.id);
                setPymes(userPymes);
            }
        } catch (error) {
            console.error("Error loading pymes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPymes();
    }, [currentUser.id]);

    const handleSave = async (data: any) => {
        try {
            const method = data.id ? 'POST' : 'POST'; // route_factory uses POST for both if ID is present
            const payload = { ...data, user_id: currentUser.id };
            
            const res = await fetch(`${API_BASE}/entrepreneurships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(data.id ? "Emprendimiento actualizado con éxito." : "Emprendimiento creado con éxito.");
                setIsFormOpen(false);
                setEditingPyme(null);
                loadPymes();
            } else {
                const err = await res.json();
                alert("Error al guardar: " + (err.error || "Ocurrió un problema"));
            }
        } catch (error) {
            alert("Error de conexión al guardar.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este emprendimiento? Esta acción no se puede deshacer.")) return;
        
        try {
            const res = await fetch(`${API_BASE}/entrepreneurships/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                loadPymes();
            } else {
                alert("No se pudo eliminar el emprendimiento.");
            }
        } catch (error) {
            alert("Error de conexión al eliminar.");
        }
    };

    const openEditForm = (pyme: Entrepreneurship) => {
        setEditingPyme(pyme);
        setIsFormOpen(true);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                        <BuildingOfficeIcon className="h-8 w-8 text-primary mr-3" />
                        Mis Pymes y Proyectos
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Gestiona tus medios de comunicación, agencias o servicios editoriales vinculados a tu perfil profesional.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingPyme(null); setIsFormOpen(true); }}
                    className="flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all active:scale-95"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuevo Emprendimiento
                </button>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500 font-medium font-serif">Cargando tus proyectos...</p>
                </div>
            ) : pymes.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="max-w-md mx-auto">
                        <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Aún no tienes emprendimientos</h3>
                        <p className="text-gray-500 mb-8">Registra tu micromedio, agencia de noticias o servicios de comunicación para darte a conocer en la red CiPress.</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center text-primary font-bold hover:text-orange-600 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-1" />
                            Comienza aquí
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pymes.map((pyme) => (
                        <div key={pyme.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img 
                                    src={pyme.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'} 
                                    alt={pyme.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        {pyme.type}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEditForm(pyme)}
                                        className="bg-white p-2 rounded-full shadow-lg text-gray-600 hover:text-primary transition-colors active:scale-95"
                                        title="Editar"
                                    >
                                        <PencilSquareIcon className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(pyme.id)}
                                        className="bg-white p-2 rounded-full shadow-lg text-gray-600 hover:text-red-600 transition-colors active:scale-95"
                                        title="Eliminar"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-center mb-3">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-3 w-3 ${i < Math.floor(pyme.rating || 5) ? 'fill-current' : ''}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-2">({pyme.reviewCount || 0} reseñas)</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-primary transition-colors line-clamp-1">{pyme.name}</h3>
                                
                                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
                                    {pyme.description}
                                </p>
                                
                                <div className="space-y-3 pt-6 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <TagIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Especialidad: <span className="font-bold text-gray-700">{pyme.specialty}</span></span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{pyme.location}</span>
                                    </div>
                                    {pyme.portfolioUrl && (
                                        <div className="flex items-center text-xs text-gray-500 overflow-hidden">
                                            <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <a href={pyme.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                                Sitio Web / Portfolio
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <EntrepreneurForm 
                    entrepreneur={editingPyme}
                    onSave={handleSave}
                    onClose={() => { setIsFormOpen(false); setEditingPyme(null); }}
                />
            )}
        </div>
    );
};

export default MisPymesView;
