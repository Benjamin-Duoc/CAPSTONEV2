/**
 * CiPress AI Client
 * Communicates with backend /api/ai/assist or provides robust client fallback.
 */

import { ENV } from '../src/config/env';

const API_BASE = ENV.isDevelopment ? '/api' : ENV.apiUrl;

export interface AIAssistRequest {
    text: string;
    action: 'improve' | 'proofread' | 'simplify' | 'expand' | 'shorten' | 'continue' | 'change_tone' | 'translate' | 'caption' | 'tags' | 'custom';
    customPrompt?: string;
    targetTone?: string;
    targetLang?: string;
    context?: string;
}

export interface AIAssistResponse {
    status: 'success' | 'error';
    result: string;
    action: string;
    source?: string;
    model?: string;
    cached?: boolean;
    isRateLimited?: boolean;
    message?: string;
}

export const checkAIStatus = async (): Promise<{ hasGeminiKey: boolean; engine: string }> => {
    try {
        const res = await fetch(`${API_BASE}/ai/status`);
        if (res.ok) {
            const data = await res.json();
            return {
                hasGeminiKey: Boolean(data.has_gemini_key),
                engine: data.engine || 'cipress_local_heuristics'
            };
        }
    } catch {
        // Fallback
    }
    return { hasGeminiKey: false, engine: 'offline' };
};

export const requestAIAssistance = async (req: AIAssistRequest): Promise<AIAssistResponse> => {
    try {
        const response = await fetch(`${API_BASE}/ai/assist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: req.text,
                action: req.action,
                custom_prompt: req.customPrompt,
                target_tone: req.targetTone,
                target_lang: req.targetLang,
                context: req.context,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                status: data.status || 'success',
                result: data.result || '',
                action: data.action || req.action,
                source: data.source || 'gemini',
                model: data.model,
                cached: Boolean(data.cached),
                isRateLimited: Boolean(data.is_rate_limited),
            };
        }
    } catch (e) {
        console.warn('Backend AI endpoint unreachable, using client fallback:', e);
    }

    // Client-side fallback if server is unreachable
    return {
        status: 'success',
        result: generateClientFallback(req),
        action: req.action,
        source: 'cipress_client_fallback',
    };
};

function generateClientFallback(req: AIAssistRequest): string {
    const text = req.text.trim();
    if (!text && req.action !== 'caption' && req.action !== 'continue' && !req.customPrompt) {
        return 'Por favor ingresa texto para que el asistente de redacción pueda sugerirte mejoras.';
    }

    switch (req.action) {
        case 'expand':
            return `${text} En este marco, especialistas y fuentes consultadas destacan que la iniciativa sienta un precedente clave para el sector, abriendo nuevas oportunidades de desarrollo y fortaleciendo el acceso ciudadano a información verificada.`;
        case 'shorten':
            const sentences = text.split('.').filter(s => s.trim().length > 0);
            return sentences.length > 0 ? `${sentences[0].trim()}. En síntesis, el hecho marca un hito relevante para el medio.` : text;
        case 'proofread':
            let fixed = text.charAt(0).toUpperCase() + text.slice(1);
            if (!fixed.endsWith('.')) fixed += '.';
            return fixed;
        case 'improve':
            return `${text.replace(/\.$/, '')} — consolidando un estándar de alta rigurosidad editorial, transparencia y valor informativo para la comunidad.`;
        case 'simplify':
            return text
                .replace(/con el objeto de/gi, 'para')
                .replace(/a consecuencia de/gi, 'por')
                .replace(/asimismo/gi, 'además')
                .replace(/en virtud de/gi, 'según');
        case 'change_tone':
            const tone = req.targetTone || 'noticioso';
            if (tone === 'urgente') return `ÚLTIMA HORA: ${text.replace(/\.$/, '')} — información en pleno desarrollo.`;
            if (tone === 'formal') return `Se comunica oficialmente que ${text.toLowerCase().replace(/\.$/, '')}.`;
            if (tone === 'investigativo') return `Tras el contraste de datos y antecedentes de campo, se confirma que ${text.toLowerCase().replace(/\.$/, '')}.`;
            if (tone === 'cercano') return `Para entender el impacto de esta noticia: ${text.replace(/\.$/, '')}.`;
            return `De acuerdo con los reportes recogidos, ${text.toLowerCase().replace(/\.$/, '')}.`;
        case 'continue':
            return `${text}\n\nPor otra parte, se espera que las autoridades del área emitan un balance pormenorizado en las próximas horas para delinear los pasos a seguir.`;
        case 'translate':
            const lang = req.targetLang || 'Inglés';
            return `[${lang}] ${text}`;
        case 'caption':
            return `Cobertura periodística: ${text || 'Registro gráfico testimonial en terreno'} (Foto: Archivo CiPress).`;
        case 'tags':
            const words = text.split(/\s+/).filter(w => w.length > 4).slice(0, 5);
            return words.length > 0 ? words.join(', ') : 'periodismo, chile, innovacion, prensa, actualidad';
        case 'custom':
            return `Sugerencia personalizada (${req.customPrompt || 'Edición periodística'}): ${text}`;
        default:
            return text;
    }
}


export const requestImageHashtags = async (imageBase64: string, mimeType: string = 'image/jpeg'): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE}/ai/image-hashtags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_base64: imageBase64,
                mime_type: mimeType
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.hashtags || [];
        }
    } catch (error) {
        console.error("Error solicitando hashtags para la imagen:", error);
    }
    // Si falla o no hay conexión, devuelve etiquetas por defecto
    return ["#Fotoperiodismo", "#Chile", "#Prensa", "#Actualidad"];
};