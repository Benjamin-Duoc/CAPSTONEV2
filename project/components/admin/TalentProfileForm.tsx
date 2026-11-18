import React, { useState, useEffect } from 'react';
import type { TalentProfile } from '../../types';
import { chileanRegions } from '../../data/mockData';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';
import { suggestTalentTitles, auditTalentProfile } from '../../utils/db';

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
    bio: ''
};

const TalentProfileForm: React.FC<TalentProfileFormProps> = ({ talentProfile, isPremium, onSave, onClose, isModal = true }) => {
    const [formData, setFormData] = useState<Omit<TalentProfile, 'id'> | TalentProfile>(initialProfileState);
    const [titleError, setTitleError] = useState('');
    const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
    const [isSuggestingTitles, setIsSuggestingTitles] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

    // Modal state according to AGENTS.md
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type?: CiPressModalType;
        title: string;
        message: string;
        confirmText?: string;
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

    useEffect(() => {
        if (talentProfile) {
            setFormData(talentProfile);
        } else {
            setFormData(initialProfileState);
        }
    }, [talentProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            showAlert(
                'Función Exclusiva para Miembros Premium',
                '¡Destaca entre la competencia! 🚀\n\nMejora tu cuenta a PREMIUM para que las empresas y agencias reclutadoras puedan contactarte directamente por LinkedIn y ver tus pretensiones de renta en el listado prioritario del Banco de Talentos.',
                'info'
            );
        }
    };

    const handleSuggestTitles = async () => {
        setIsSuggestingTitles(true);
        try {
            const validSkills = formData.skills.filter(s => s && s.trim());
            const titles = await suggestTalentTitles(validSkills, formData.title);
            if (titles && titles.length > 0) {
                setSuggestedTitles(titles);
            } else {
                showAlert('Sugerencia de Títulos', 'Completa al menos una habilidad para generar títulos más precisos con IA.', 'info');
            }
        } catch (e) {
            showAlert('Asistente IA', 'No se pudieron generar sugerencias en este momento. Inténtalo nuevamente.', 'warning');
        } finally {
            setIsSuggestingTitles(false);
        }
    };

    const handleGenerateBio = async () => {
        setIsGeneratingBio(true);
        try {
            const audit = await auditTalentProfile({
                name: formData.name,
                title: formData.title,
                skills: formData.skills,
                experienceYears: formData.experienceYears,
                region: formData.region,
                availability: formData.availability,
                linkedinUrl: formData.linkedinUrl,
                expectedSalary: formData.expectedSalary,
                isPremium
            });

            if (audit && audit.suggestedBio) {
                setFormData(prev => ({ ...prev, bio: audit.suggestedBio }));
                showAlert('Bio Generada con Éxito', 'Se ha redactado un extracto profesional optimizado con IA. Puedes editarlo libremente antes de guardar.', 'success');
            } else {
                showAlert('Generador de Bio', 'Ingresa tus habilidades principales o título para que la IA pueda redactar tu bio ejecutiva.', 'info');
            }
        } catch (e) {
            showAlert('Asistente IA', 'Error al generar la biografía con IA.', 'warning');
        } finally {
            setIsGeneratingBio(false);
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
            showAlert('Título Inválido', 'El título descriptor no puede exceder las 8 palabras. Por favor corrígelo antes de guardar.', 'warning');
            return;
        }
        onSave(formData);
    };

    const content = (
        <div className={`bg-white ${isModal ? 'rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto' : 'p-0 w-full'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-gray-800">{talentProfile ? 'Editar Perfil de Talento' : 'Crear Perfil de Talento'}</h2>
                {isModal && (
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Cerrar ventana"
                    >
                        ✕
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
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Título Descriptor (máximo 8 palabras)</label>
                                <button
                                    type="button"
                                    onClick={handleSuggestTitles}
                                    disabled={isSuggestingTitles}
                                    className="text-xs font-semibold text-primary hover:text-orange-600 flex items-center bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-md border border-orange-200 transition-all cursor-pointer"
                                >
                                    <SparklesIcon className={`h-3.5 w-3.5 mr-1 text-primary ${isSuggestingTitles ? 'animate-spin' : ''}`} />
                                    {isSuggestingTitles ? 'Generando títulos...' : '✨ Sugerir con IA'}
                                </button>
                            </div>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ej: Periodista de Investigación y Datos" className={`mt-1 block w-full border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3`} required />
                            {titleError && <p className="text-red-500 text-xs mt-1">{titleError}</p>}

                            {suggestedTitles.length > 0 && (
                                <div className="mt-2.5 p-3 bg-orange-50/80 border border-orange-200/80 rounded-xl text-xs space-y-2 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-orange-900 flex items-center">
                                            <SparklesIcon className="h-3.5 w-3.5 mr-1 text-primary" />
                                            Sugerencias IA (haz clic para aplicar al instante):
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => setSuggestedTitles([])}
                                            className="text-gray-400 hover:text-gray-600 text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {suggestedTitles.map((t, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, title: t }));
                                                    setTitleError('');
                                                }}
                                                className="bg-white hover:bg-orange-100 text-gray-800 border border-orange-200 px-2.5 py-1.5 rounded-lg text-left transition-colors font-medium shadow-xs text-xs"
                                            >
                                                "{t}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Bio o Extracto Profesional</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateBio}
                                    disabled={isGeneratingBio}
                                    className="text-xs font-semibold text-primary hover:text-orange-600 flex items-center bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-md border border-orange-200 transition-all cursor-pointer"
                                >
                                    <SparklesIcon className={`h-3.5 w-3.5 mr-1 text-primary ${isGeneratingBio ? 'animate-spin' : ''}`} />
                                    {isGeneratingBio ? 'Redactando...' : '✨ Generar Bio con IA'}
                                </button>
                            </div>
                            <textarea
                                name="bio"
                                rows={3}
                                value={formData.bio || ''}
                                onChange={handleChange}
                                placeholder="Extracto o bio periodística que resuma tu experiencia, enfoques y valor agregado para medios y agencias..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary"
                            />
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

    const modalElement = (
        <CiPressModal
            isOpen={modalConfig.isOpen}
            type={modalConfig.type}
            title={modalConfig.title}
            message={modalConfig.message}
            confirmText={modalConfig.confirmText}
            onConfirm={modalConfig.onConfirm}
            onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        />
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                {content}
                {modalElement}
            </div>
        );
    }

    return (
        <>
            {content}
            {modalElement}
        </>
    );
};

export default TalentProfileForm;