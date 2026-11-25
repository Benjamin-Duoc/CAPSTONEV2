import React, { useState, useEffect, useMemo } from 'react';
import type { User, TalentProfile, TalentAuditResult } from '../../types';
import TalentProfileForm from '../admin/TalentProfileForm';
import { getMyTalentProfile, saveMyTalentProfile, auditTalentProfile } from '../../utils/db';
import { isPremiumUser, isAdminUser } from '../../utils/roleUtils';
import { 
    SparklesIcon, 
    CheckCircleIcon, 
    LightBulbIcon, 
    TagIcon, 
    ClipboardDocumentIcon, 
    ClipboardDocumentCheckIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';

interface TalentProfileViewProps {
    currentUser: User;
}

const TalentProfileView: React.FC<TalentProfileViewProps> = ({ currentUser }) => {
    const [myProfile, setMyProfile] = useState<TalentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<TalentAuditResult | null>(null);
    const [copiedBio, setCopiedBio] = useState(false);

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

    const isPremium = isPremiumUser(currentUser) || isAdminUser(currentUser);

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
        const loadProfile = async () => {
            setIsLoading(true);
            const profile = await getMyTalentProfile(currentUser?.id);
            setMyProfile(profile);
            setIsLoading(false);
        };
        loadProfile();
    }, [currentUser?.id]);

    // Live score calculation
    const { score, checklist } = useMemo(() => {
        if (!myProfile) {
            return {
                score: 0,
                checklist: [
                    { label: 'Título conciso (máx. 8 palabras)', passed: false },
                    { label: '3 habilidades clave declaradas', passed: false },
                    { label: 'Años de experiencia registrados', passed: false },
                    { label: 'Bio o extracto profesional redactado', passed: false },
                    { label: 'Enlace a LinkedIn registrado', passed: false },
                    { label: 'Región geográfica configurada', passed: false },
                ]
            };
        }

        let calculatedScore = 0;
        const titleWords = (myProfile.title || '').trim().split(/\s+/).filter(Boolean);
        const titlePassed = titleWords.length > 0 && titleWords.length <= 8;
        const skillsCount = (myProfile.skills || []).filter(s => s && s.trim()).length;
        const skillsPassed = skillsCount >= 3;
        const expPassed = (myProfile.experienceYears || 0) > 0;
        const bioPassed = Boolean(myProfile.bio && myProfile.bio.trim().length >= 20);
        const linkedinPassed = Boolean(myProfile.linkedinUrl && myProfile.linkedinUrl.trim().length > 5);
        const regionPassed = Boolean(myProfile.region && myProfile.region.trim());

        if (titlePassed) calculatedScore += 20;
        if (skillsPassed) calculatedScore += 25;
        else if (skillsCount > 0) calculatedScore += skillsCount * 8;
        if (expPassed) calculatedScore += 15;
        if (bioPassed) calculatedScore += 15;
        if (linkedinPassed) calculatedScore += 15;
        if (regionPassed) calculatedScore += 10;

        calculatedScore = Math.min(calculatedScore, 100);

        return {
            score: calculatedScore,
            checklist: [
                { label: 'Título conciso (máx. 8 palabras)', passed: titlePassed },
                { label: '3 habilidades clave declaradas', passed: skillsPassed },
                { label: 'Años de experiencia registrados', passed: expPassed },
                { label: 'Bio o extracto profesional redactado', passed: bioPassed },
                { label: 'Enlace a LinkedIn registrado', passed: linkedinPassed },
                { label: 'Región geográfica configurada', passed: regionPassed },
            ]
        };
    }, [myProfile]);

    const handleRunAudit = async () => {
        if (!myProfile || !myProfile.title) {
            showAlert(
                'Perfil en Construcción',
                'Guarda primero al menos tu título descriptor y habilidades para que CiPress IA pueda realizar una auditoría completa.',
                'warning'
            );
            return;
        }

        setIsAuditing(true);
        try {
            const result = await auditTalentProfile({
                ...myProfile,
                isPremium
            });

            if (result) {
                setAuditResult(result);
            } else {
                showAlert('Auditoría IA', 'No fue posible completar la auditoría en este momento. Inténtalo de nuevo en unos segundos.', 'warning');
            }
        } catch (error) {
            showAlert('Auditoría IA', 'Error al conectar con el servicio de IA de CiPress.', 'warning');
        } finally {
            setIsAuditing(false);
        }
    };

    const handleCopyBio = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedBio(true);
        setTimeout(() => setCopiedBio(false), 2500);
    };

    const handleSave = async (data: any) => {
        try {
            const payloadWithUser = {
                ...data,
                userId: currentUser?.id,
                name: data.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email || 'Periodista'
            };
            const saved = await saveMyTalentProfile(payloadWithUser);
            setMyProfile(saved);
            if (isPremium) {
                showAlert(
                    '¡Perfil Actualizado!',
                    'Tu perfil de talento ha sido actualizado exitosamente y cuenta con prioridad Premium activa en el Banco de Talentos.',
                    'success'
                );
            } else {
                showAlert(
                    '¡Perfil Guardado!',
                    'Tu perfil de talento ha sido actualizado con éxito. Recuerda que puedes pasar a Premium para destacar con prioridad e incluir tu renta y contacto directo en el Banco de Talentos.',
                    'success'
                );
            }
        } catch (error: any) {
            showAlert('Error al Guardar', error?.message || 'Hubo un error al intentar guardar tu perfil. Inténtalo nuevamente.', 'warning');
        }
    };

    const getScoreTier = (s: number) => {
        if (s >= 80) return { label: 'Perfil de Alto Impacto', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' };
        if (s >= 50) return { label: 'Perfil Competitivo en Crecimiento', color: 'text-orange-700 bg-orange-50 border-orange-200', bar: 'bg-primary' };
        return { label: 'Perfil Inicial / Básico', color: 'text-amber-700 bg-amber-50 border-amber-200', bar: 'bg-amber-500' };
    };

    const tier = getScoreTier(score);

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto space-y-8">
            {/* Cabecera */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 flex items-center">
                        <SparklesIcon className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                        Mi Perfil en el Banco de Talentos
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">
                        Gestiona cómo te ven los medios, editores y agencias que buscan coberturas y profesionales en CiPress.
                    </p>
                </div>
                {isPremium ? (
                    <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl flex items-center self-start md:self-auto">
                        <SparklesIcon className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-primary font-bold text-sm">Prioridad Premium Activa</span>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl flex items-center self-start md:self-auto text-xs text-gray-600 font-medium">
                        Cuenta Estándar
                    </div>
                )}
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500 font-medium">Cargando tus datos profesionales...</p>
                </div>
            ) : (
                <>
                    {/* PANEL DE AUDITORÍA Y PROFILE SCORE (IA CIPRESS) */}
                    <section className="bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 rounded-3xl border border-orange-100 shadow-lg p-6 md:p-8 relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-orange-100/80 pb-6">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary text-white">
                                        Sprint 3 • IA CiPress
                                    </span>
                                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${tier.color}`}>
                                        {tier.label}
                                    </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900 mt-2 flex items-center">
                                    Revisor Inteligente de Perfil & Empleabilidad
                                </h2>
                                <p className="text-gray-600 text-sm mt-1 max-w-2xl">
                                    Métricas en tiempo real y diagnóstico cualitativo impulsado por Gemini para asegurar que tu perfil destaque ante salas de redacción y empleadores.
                                </p>
                            </div>

                            <button
                                onClick={handleRunAudit}
                                disabled={isAuditing}
                                className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold text-white bg-primary hover:bg-orange-600 shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer text-sm flex-shrink-0"
                            >
                                <SparklesIcon className={`h-5 w-5 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
                                {isAuditing ? 'Auditando Perfil con IA...' : '✨ Auditar Perfil con CiPress IA'}
                            </button>
                        </div>

                        {/* Métrica de Score y Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-center">
                            {/* Score Bar */}
                            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-orange-100/70 shadow-xs">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Profile Score</span>
                                    <span className="text-2xl font-extrabold font-serif text-gray-900">{score}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${tier.bar}`} 
                                        style={{ width: `${score}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {score >= 80 
                                        ? '¡Excelente! Tu perfil cumple con los estándares editoriales más exigentes.'
                                        : 'Completa los elementos faltantes para maximizar tus opciones de contratación.'}
                                </p>
                            </div>

                            {/* Checklist de completitud */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {checklist.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`flex items-center text-xs p-2.5 rounded-xl border transition-colors ${
                                            item.passed 
                                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                                                : 'bg-white border-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {item.passed ? (
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
                                        ) : (
                                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                                        )}
                                        <span className="truncate">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RESULTADO DE LA AUDITORÍA IA (DESPLEGABLE / VISIBLE SI EXISTE) */}
                        {auditResult && (
                            <div className="mt-8 pt-6 border-t border-orange-200/60 animate-fade-in space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                                        <h3 className="font-bold text-lg text-gray-900">
                                            Diagnóstico Editorial: <span className="text-primary italic">{auditResult.verdict}</span>
                                        </h3>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                        Generado por CiPress IA • Score evaluado: {auditResult.profileScore}%
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Puntos Fuertes */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                                        <h4 className="font-bold text-sm text-emerald-800 flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 mr-2" />
                                            Puntos Fuertes Identificados
                                        </h4>
                                        <ul className="space-y-2">
                                            {auditResult.strengths.map((str, idx) => (
                                                <li key={idx} className="text-xs text-gray-700 flex items-start">
                                                    <span className="text-emerald-500 font-bold mr-2">•</span>
                                                    <span>{str}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Oportunidades de Mejora */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                                        <h4 className="font-bold text-sm text-amber-800 flex items-center">
                                            <LightBulbIcon className="h-4 w-4 text-amber-500 mr-2" />
                                            Oportunidades de Mejora Accionables
                                        </h4>
                                        <ul className="space-y-2">
                                            {auditResult.improvements.map((imp, idx) => (
                                                <li key={idx} className="text-xs text-gray-700 flex items-start">
                                                    <span className="text-amber-500 font-bold mr-2">•</span>
                                                    <span>{imp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Palabras clave recomendadas */}
                                {auditResult.keywords && auditResult.keywords.length > 0 && (
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-bold text-gray-700 flex items-center mr-2">
                                            <TagIcon className="h-4 w-4 text-primary mr-1" />
                                            Palabras Clave Recomendadas:
                                        </span>
                                        {auditResult.keywords.map((kw, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-xs font-medium"
                                            >
                                                #{kw}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Pitch Profesional Sugerido (Bio Ejecutiva) */}
                                {auditResult.suggestedBio && (
                                    <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-200/80 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-orange-950 flex items-center">
                                                <SparklesIcon className="h-4 w-4 text-primary mr-2" />
                                                Bio Ejecutiva / Pitch Profesional Sugerido por IA
                                            </h4>
                                            <button
                                                onClick={() => handleCopyBio(auditResult.suggestedBio)}
                                                className="text-xs font-bold text-primary hover:text-orange-700 flex items-center bg-white px-2.5 py-1 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                                            >
                                                {copiedBio ? (
                                                    <>
                                                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-emerald-600" />
                                                        <span className="text-emerald-700">¡Copiado!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                                                        Copiar Bio
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-700 italic leading-relaxed border-l-2 border-primary pl-3 py-1">
                                            "{auditResult.suggestedBio}"
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            💡 Tip: Puedes copiar este extracto y pegarlo en el campo "Bio o Extracto Profesional" del formulario a continuación.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* FORMULARIO DE EDICIÓN DEL PERFIL */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold font-serif text-gray-900">Formulario del Perfil de Talento</h2>
                                <p className="text-xs text-gray-500">Actualiza tus datos para sincronizarlos con el directorio público de CiPress.</p>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <TalentProfileForm 
                                talentProfile={myProfile}
                                isPremium={isPremium}
                                onSave={handleSave}
                                onClose={() => {}}
                                isModal={false}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Modal de diálogo estándar CiPress (AGENTS.md) */}
            <CiPressModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default TalentProfileView;
