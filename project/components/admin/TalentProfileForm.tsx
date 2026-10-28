import React, { useState, useEffect } from 'react';
import type { TalentProfile } from '../../types';
import { chileanRegions } from '../../data/mockData';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface TalentProfileFormProps {
    talentProfile: TalentProfile | null;
    isPremium: boolean;
    onSave: (profile: TalentProfile | Omit<TalentProfile, 'id'>) => void;
    onClose: () => void;
    isModal?: boolean;
}

const initialProfileState: Omit<TalentProfile, 'id'> = {
    name: '',
    avatarUrl: 'https://i.pravatar.cc/150',
    title: '',
    skills: ['', '', ''],
    availability: 'Remoto',
    expectedSalary: '',
    region: 'Metropolitana de Santiago',
    linkedinUrl: '',
    experienceYears: 0,
};

const TalentProfileForm: React.FC<TalentProfileFormProps> = ({ talentProfile, isPremium, onSave, onClose, isModal = true }) => {
    const [formData, setFormData] = useState<Omit<TalentProfile, 'id'> | TalentProfile>(initialProfileState);
    const [titleError, setTitleError] = useState('');

    useEffect(() => {
        if (talentProfile) {
            setFormData(talentProfile);
        } else {
            setFormData(initialProfileState);
        }
    }, [talentProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'title') {
            if (value.split(' ').filter(Boolean).length > 8) {
                setTitleError('El título no puede exceder las 8 palabras.');
            } else {
                setTitleError('');
            }
        }
        setFormData(prev => ({
            ...prev,
            [name]: name === 'experienceYears' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSkillChange = (index: number, value: string) => {
        const newSkills = [...formData.skills] as [string, string, string];
        newSkills[index] = value;
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const handlePremiumAlert = () => {
        if (!isPremium) {
            alert('¡Destaca entre la competencia! 🚀\n\nMejora a tu cuenta a PREMIUM para que las empresas y reclutadores puedan contactarte directamente por LinkedIn y ver tus pretensiones de renta en el listado prioritario.');
        }
    };

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const base64String = readerEvent.target?.result as string;
                    setFormData(prev => ({ ...prev, avatarUrl: base64String }));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (titleError) {
            alert('Por favor, corrige los errores antes de guardar.');
            return;
        }
        onSave(formData);
    };

    const content = (
        <div className={`bg-white ${isModal ? 'rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto' : 'p-0 w-full'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{talentProfile ? 'Editar Perfil de Talento' : 'Crear Perfil de Talento'}</h2>
                {!isModal && (
                    <button onClick={onClose} className="text-sm font-medium text-primary hover:underline flex items-center">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Volver
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 border rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Información Personal</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Foto o Avatar</label>
                            {formData.avatarUrl && <img src={formData.avatarUrl} alt="Previsualización" className="my-2 rounded-full h-24 w-24 object-cover bg-gray-100 border" />}
                            <div>
                                <label className="block text-xs font-medium text-gray-600">URL de la Imagen</label>
                                <input type="text" name="avatarUrl" placeholder="Pegar URL de la imagen" value={formData.avatarUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" />
                            </div>
                             <div className="flex items-center space-x-2">
                                <hr className="flex-grow border-gray-300" /><span className="text-sm text-gray-500">o</span><hr className="flex-grow border-gray-300" />
                            </div>
                            <button type="button" onClick={handleImageUpload} className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                Buscar archivo en el equipo...
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Perfil Profesional</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Título Descriptor (máximo 8 palabras)</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className={`mt-1 block w-full border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3`} required />
                            {titleError && <p className="text-red-500 text-xs mt-1">{titleError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tus 3 Habilidades Principales</label>
                            <div className="space-y-2 mt-1">
                                <input type="text" placeholder="Habilidad 1 (Ej: Periodismo de Datos)" value={formData.skills[0]} onChange={(e) => handleSkillChange(0, e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                                <input type="text" placeholder="Habilidad 2 (Ej: Visualización de Datos)" value={formData.skills[1]} onChange={(e) => handleSkillChange(1, e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                                <input type="text" placeholder="Habilidad 3 (Ej: SEO)" value={formData.skills[2]} onChange={(e) => handleSkillChange(2, e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Disponibilidad</label>
                                <select name="availability" value={formData.availability} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                    <option>Remoto</option>
                                    <option>Presencial</option>
                                    <option>Híbrido</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Región de Residencia</label>
                                <select name="region" value={formData.region} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                    {chileanRegions.map(region => <option key={region} value={region}>{region}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group cursor-pointer" onClick={handlePremiumAlert}>
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    Renta Mensual Pretendida (CLP)
                                    {!isPremium && <LockClosedIcon className="h-4 w-4 ml-1 text-orange-500" title="Solo Premium" />}
                                </label>
                                <input 
                                    type="text" 
                                    name="expectedSalary" 
                                    placeholder={isPremium ? "Ej: $1.200.000 o a convenir" : "Bloqueado - Solo Premium"} 
                                    value={isPremium ? formData.expectedSalary : ''} 
                                    onChange={handleChange} 
                                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${!isPremium ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`} 
                                    disabled={!isPremium}
                                />
                                {!isPremium && <div className="hidden group-hover:block absolute top-0 left-0 w-full h-full bg-transparent z-10" />}
                            </div>
                            <div className="relative group cursor-pointer" onClick={handlePremiumAlert}>
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    Años de Experiencia
                                    {!isPremium && <LockClosedIcon className="h-4 w-4 ml-1 text-orange-500" title="Solo Premium" />}
                                </label>
                                <input 
                                    type="number" 
                                    name="experienceYears" 
                                    value={isPremium ? formData.experienceYears : 0} 
                                    onChange={handleChange} 
                                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${!isPremium ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`} 
                                    min="0" 
                                    disabled={!isPremium}
                                />
                                {!isPremium && <div className="hidden group-hover:block absolute top-0 left-0 w-full h-full bg-transparent z-10" />}
                            </div>
                        </div>
                        <div className="relative group cursor-pointer" onClick={handlePremiumAlert}>
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                Vínculo a LinkedIn
                                {!isPremium && <LockClosedIcon className="h-4 w-4 ml-1 text-orange-500" title="Solo Premium" />}
                            </label>
                            <input 
                                type="url" 
                                name="linkedinUrl" 
                                placeholder={isPremium ? "https://linkedin.com/in/tu-perfil" : "Bloqueado - Solo Premium"} 
                                value={isPremium ? formData.linkedinUrl : ''} 
                                onChange={handleChange} 
                                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 ${!isPremium ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`} 
                                disabled={!isPremium}
                            />
                            {!isPremium && <div className="hidden group-hover:block absolute top-0 left-0 w-full h-full bg-transparent z-10" />}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        {isModal && <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>}
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-colors">
                            {talentProfile ? 'Actualizar Mi Perfil' : 'Crear Perfil Profesional'}
                        </button>
                    </div>
                </form>
            </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
};

export default TalentProfileForm;