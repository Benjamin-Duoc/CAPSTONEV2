import React, { useState, useRef, useEffect } from 'react';
import { requestAIAssistance, checkAIStatus, AIAssistRequest } from '../../utils/aiClient';

export interface AIWritingAssistantProps {
    currentText: string;
    onApplyText: (newText: string) => void;
    onAppendText?: (textToAppend: string) => void;
    onInsertBlock?: (type: 'paragraph' | 'quote', data: { text: string; author?: string }) => void;
    context?: 'press_release' | 'paragraph' | 'quote' | 'summary' | 'caption' | 'title';
    buttonLabel?: string;
    compact?: boolean;
    className?: string;
}

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
    currentText,
    onApplyText,
    onAppendText,
    onInsertBlock,
    context = 'paragraph',
    buttonLabel,
    compact = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [resultText, setResultText] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [selectedTone, setSelectedTone] = useState<string>('noticioso');
    const [selectedLang, setSelectedLang] = useState<string>('Inglés');
    const [activeActionLabel, setActiveActionLabel] = useState<string>('');
    const [showToneDropdown, setShowToneDropdown] = useState(false);
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [resultMeta, setResultMeta] = useState<{ source?: string; model?: string } | null>(null);
    const [aiStatus, setAiStatus] = useState<{ hasGeminiKey: boolean; engine: string } | null>(null);

    const popoverRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fetch AI Status when opened
    useEffect(() => {
        if (isOpen) {
            checkAIStatus().then(status => setAiStatus(status));
        }
    }, [isOpen]);

    // Auto-resize custom prompt textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [customPrompt]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExecuteAction = async (
        action: AIAssistRequest['action'],
        promptOverride?: string,
        toneOverride?: string,
        langOverride?: string
    ) => {
        const toneToUse = toneOverride || selectedTone;
        const langToUse = langOverride || selectedLang;
        const promptToUse = promptOverride !== undefined ? promptOverride : customPrompt;

        setIsLoading(true);
        setResultText(null);
        setResultMeta(null);
        setCopied(false);
        setShowToneDropdown(false);
        setShowLangDropdown(false);

        const actionTitles: Record<string, string> = {
            improve: 'Mejorando redacción',
            proofread: 'Corrigiendo ortografía y gramática',
            simplify: 'Simplificando texto',
            expand: 'Desarrollando idea',
            shorten: 'Sintetizando contenido',
            continue: 'Generando continuación',
            change_tone: `Adaptando a tono ${toneToUse}`,
            translate: `Traduciendo a ${langToUse}`,
            caption: 'Generando pie de foto',
            tags: 'Sugiriendo etiquetas',
            custom: 'Procesando consulta personalizada'
        };
        setActiveActionLabel(actionTitles[action] || 'Procesando');

        const response = await requestAIAssistance({
            text: currentText,
            action,
            customPrompt: promptToUse,
            targetTone: toneToUse,
            targetLang: langToUse,
            context
        });

        setIsLoading(false);
        if (response.status === 'success' || response.result) {
            setResultText(response.result);
            setResultMeta({
                source: response.source,
                model: response.model,
                cached: response.cached,
                isRateLimited: response.isRateLimited
            });
        } else {
            setResultText('No fue posible procesar la solicitud en este momento.');
            setResultMeta(null);
        }
    };

    const handleCopy = () => {
        if (!resultText) return;
        navigator.clipboard.writeText(resultText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = () => {
        if (!resultText) return;
        onApplyText(resultText);
        setIsOpen(false);
        setResultText(null);
    };

    const handleAppend = () => {
        if (!resultText) return;
        if (onAppendText) {
            onAppendText(resultText);
        } else {
            onApplyText(currentText ? `${currentText}\n\n${resultText}` : resultText);
        }
        setIsOpen(false);
        setResultText(null);
    };

    const handleInsertAsBlock = (type: 'paragraph' | 'quote') => {
        if (!resultText || !onInsertBlock) return;
        onInsertBlock(type, { text: resultText, author: type === 'quote' ? 'Fuente consultada' : undefined });
        setIsOpen(false);
        setResultText(null);
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={popoverRef}>
            {/* Trigger Button with CiPress AI Styling */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    isOpen 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md' 
                        : 'bg-white hover:bg-orange-50/80 text-gray-700 hover:text-orange-600 border-gray-200 hover:border-orange-300 shadow-sm'
                } ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'}`}
                title="Asistente de Redacción CiPress IA"
            >
                {/* CiPress Sparkle Logo Icon */}
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-orange-500 group-hover:text-orange-600 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
                    </svg>
                </span>
                <span className="font-bold tracking-tight">CiPress IA</span>
                {buttonLabel && <span className="text-gray-500 group-hover:text-orange-700 font-normal ml-0.5">{buttonLabel}</span>}
            </button>

            {/* AI Assistant Popover Panel */}
            {isOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden animate-fade-in text-gray-800">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-4 py-3 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-400">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-bold font-serif text-white">Asistente Editorial CiPress</h4>
                                    {aiStatus?.hasGeminiKey ? (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Gemini IA Conectado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30" title="Motor heurístico local activo">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            Motor Local
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-blue-200">Asistencia de redacción y enriquecimiento de notas</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white p-1 rounded transition-colors text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-4 space-y-3.5 max-h-[480px] overflow-y-auto">
                        {/* Quick Presets Grid */}
                        <div>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                Acciones Rápidas
                            </span>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('improve')}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-100 rounded-lg text-left transition-colors font-medium text-gray-700 disabled:opacity-50"
                                >
                                    <span>✨</span> Mejorar redacción
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('proofread')}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-100 rounded-lg text-left transition-colors font-medium text-gray-700 disabled:opacity-50"
                                >
                                    <span>✍️</span> Corregir ortografía
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('expand')}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-100 rounded-lg text-left transition-colors font-medium text-gray-700 disabled:opacity-50"
                                >
                                    <span>➕</span> Alargar / Desarrollar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('shorten')}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-100 rounded-lg text-left transition-colors font-medium text-gray-700 disabled:opacity-50"
                                >
                                    <span>✂️</span> Acortar / Sintetizar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('simplify')}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-100 rounded-lg text-left transition-colors font-medium text-gray-700 disabled:opacity-50"
                                >
                                    <span>🔍</span> Simplificar lenguaje
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('continue')}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-100 rounded-lg text-left transition-colors font-medium text-gray-700 disabled:opacity-50"
                                >
                                    <span>⏩</span> Continuar escribiendo
                                </button>
                            </div>
                        </div>

                        {/* Tone & Translation Dropdowns */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                            {/* Cambiar Tono */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowToneDropdown(!showToneDropdown);
                                        setShowLangDropdown(false);
                                    }}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                                >
                                    <span className="truncate">
                                        🎭 Tono: {{
                                            noticioso: 'Noticioso',
                                            formal: 'Formal',
                                            investigativo: 'Investigativo',
                                            urgente: 'Urgente',
                                            cercano: 'Cercano'
                                        }[selectedTone] || selectedTone}
                                    </span>
                                    <span className="text-[10px]">▼</span>
                                </button>
                                {showToneDropdown && (
                                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                                        {[
                                            { id: 'noticioso', label: 'Noticioso' },
                                            { id: 'formal', label: 'Formal / Institucional' },
                                            { id: 'investigativo', label: 'Investigativo' },
                                            { id: 'urgente', label: 'Urgente / Última hora' },
                                            { id: 'cercano', label: 'Cercano / Divulgativo' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTone(t.id);
                                                    setShowToneDropdown(false);
                                                    handleExecuteAction('change_tone', undefined, t.id, undefined);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-700"
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Traducir a */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLangDropdown(!showLangDropdown);
                                        setShowToneDropdown(false);
                                    }}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                                >
                                    <span className="truncate">🌐 Traducir: {selectedLang}</span>
                                    <span className="text-[10px]">▼</span>
                                </button>
                                {showLangDropdown && (
                                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                                        {['Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano'].map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedLang(lang);
                                                    setShowLangDropdown(false);
                                                    handleExecuteAction('translate', undefined, undefined, lang);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-700"
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Extra Actions for Photos/Media if context matches */}
                        {(context === 'caption' || context === 'press_release') && (
                            <div className="flex gap-2 pt-1 border-t border-gray-100 text-xs">
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('caption')}
                                    disabled={isLoading}
                                    className="flex-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors"
                                >
                                    📷 Sugerir pie de foto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExecuteAction('tags')}
                                    disabled={isLoading}
                                    className="flex-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium transition-colors"
                                >
                                    🏷️ Sugerir etiquetas
                                </button>
                            </div>
                        )}

                        {/* Expandable Custom Prompt Input */}
                        <div className="pt-2 border-t border-gray-100">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Consulta o Pedido Personalizado
                            </label>
                            <div className="relative flex items-end gap-1.5 bg-gray-50 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white rounded-xl p-2 transition-all">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            const trimmed = customPrompt.trim();
                                            if (trimmed) handleExecuteAction('custom', trimmed);
                                        }
                                    }}
                                    placeholder="Pide un cambio específico a la IA..."
                                    className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const trimmed = customPrompt.trim();
                                        if (trimmed) handleExecuteAction('custom', trimmed);
                                    }}
                                    disabled={isLoading || !customPrompt.trim()}
                                    className="flex-shrink-0 p-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white rounded-lg transition-colors shadow-sm"
                                    title="Enviar instrucción"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Loading Shimmer State */}
                        {isLoading && (
                            <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl space-y-2 animate-pulse">
                                <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                                    <span>{activeActionLabel || 'CiPress IA pensando...'}</span>
                                </div>
                                <div className="h-2 bg-orange-200/50 rounded w-5/6"></div>
                                <div className="h-2 bg-orange-200/50 rounded w-4/6"></div>
                            </div>
                        )}

                        {/* Result Preview Box */}
                        {resultText && !isLoading && (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-fade-in">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>Sugerencia:</span>
                                        {resultMeta?.isRateLimited ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                                                ⚠️ Límite de Cuota por Minuto
                                            </span>
                                        ) : resultMeta?.source === 'gemini' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                ✓ IA Gemini ({resultMeta.model || '2.5 Flash'})
                                                {resultMeta.cached && (
                                                    <span className="ml-1 text-emerald-700 font-bold bg-white/70 px-1 rounded text-[9px]">⚡ Caché</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200" title="Respaldo local periodístico activado">
                                                ⚙️ Motor Local
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="text-[11px] text-gray-500 hover:text-gray-800 font-medium"
                                    >
                                        {copied ? '✓ ¡Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="text-xs text-gray-800 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-gray-200 font-serif">
                                    {resultText}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleApply}
                                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                                    >
                                        ✓ Reemplazar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAppend}
                                        className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        + Añadir al final
                                    </button>
                                    {onInsertBlock && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleInsertAsBlock('paragraph')}
                                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-medium transition-colors"
                                                title="Insertar como nuevo bloque de párrafo"
                                            >
                                                + Párrafo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInsertAsBlock('quote')}
                                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-medium transition-colors"
                                                title="Insertar como nuevo bloque de cita"
                                            >
                                                + Cita
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setResultText(null)}
                                        className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs ml-auto"
                                    >
                                        Descartar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIWritingAssistant;
