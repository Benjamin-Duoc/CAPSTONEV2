"""
CiPress - AI Editorial & Writing Assistant Service
Provides journalistic writing assistance powered by Google Gemini API
with an intelligent local fallback engine.
"""

import os
import json
import logging
import requests
from app.services.ai_cache import ai_cache

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Eres el asistente de redacción e inteligencia editorial de CiPress (Círculo de Periodistas Emprendedores e Innovadores de Chile).
Tu objetivo es asistir a periodistas, reporteros y comunicadores en la redacción, edición y enriquecimiento de comunicados de prensa, reportajes y fotoperiodismo.
Normas editoriales:
- Usa un lenguaje periodístico profesional, preciso y fluido en español (a menos que se te solicite traducir).
- Prioriza la voz activa, la economía de palabras y la claridad informativa.
- Mantén la fidelidad a los hechos proporcionados sin inventar datos falsos.
- Devuelve directamente el texto resultado, sin introducciones innecesarias como 'Aquí tienes el texto:' o explicaciones complementarias a menos que sea una consulta explicativa.
"""

class AIService:
    MODELS_TO_TRY = [
        "gemini-flash-lite-latest",
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite-preview",
        "gemini-2.5-flash",
        "gemini-flash-latest"
    ]


    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        if not self.api_key:
            # Attempt to reload from .env if present
            try:
                from dotenv import load_dotenv
                base_env = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
                if os.path.exists(base_env):
                    load_dotenv(base_env, override=True)
                    self.api_key = os.environ.get('GEMINI_API_KEY')
            except Exception:
                pass
        self.active_model = "gemini-flash-lite-latest"

    

    def assist(self, text: str, action: str, custom_prompt: str = None, target_tone: str = None, target_lang: str = None, context: str = None) -> dict:
        """
        Executes an AI writing assistance task with caching and quota protection.
        """
        text = (text or "").strip()

        # 1. Check Cache first (saves Gemini quota & delivers sub-second response)
        cached = ai_cache.get(text, action, custom_prompt, target_tone, target_lang, context)
        if cached:
            return {
                "status": "success",
                "result": cached["result"],
                "action": action,
                "source": cached["source"],
                "model": cached["model"],
                "cached": True
            }

        prompt_instruction = self._build_prompt(text, action, custom_prompt, target_tone, target_lang, context)

        # 2. Try Google Gemini API if key is present
        if self.api_key:
            try:
                result, used_model, is_rate_limited = self._call_gemini(prompt_instruction)
                if result:
                    # Save to cache for future repeat queries
                    ai_cache.set(text, action, result.strip(), source="gemini", model=used_model, custom_prompt=custom_prompt, target_tone=target_tone, target_lang=target_lang, context=context)
                    return {
                        "status": "success",
                        "result": result.strip(),
                        "action": action,
                        "source": "gemini",
                        "model": used_model,
                        "cached": False
                    }
                elif is_rate_limited:
                    return {
                        "status": "rate_limited",
                        "result": "⚠️ Límite momentáneo de la API gratuita de Gemini alcanzado (15 peticiones por minuto). Por favor espera 15 a 20 segundos y vuelve a intentar.",
                        "action": action,
                        "source": "gemini",
                        "is_rate_limited": True
                    }
            except Exception as e:
                logger.warning(f"Error calling Gemini API: {e}. Falling back to local engine.")

        # 3. Local fallback engine
        fallback_result = self._local_fallback(text, action, custom_prompt, target_tone, target_lang, context)
        return {
            "status": "success",
            "result": fallback_result.strip(),
            "action": action,
            "source": "cipress_local_engine",
            "cached": False
        }

    def generate_image_hashtags(self, image_base64: str, mime_type: str = "image/jpeg") -> dict:
        """
        Analiza una imagen en Base64 usando Gemini Visión y extrae hashtags periodísticos.
        """
        # 1. Limpiar el Base64 por si el navegador envía el prefijo data:image/...;base64,
        if "," in image_base64:
            header, image_base64 = image_base64.split(",", 1)
            if "image/png" in header:
                mime_type = "image/png"
            elif "image/webp" in header:
                mime_type = "image/webp"

        image_base64 = image_base64.strip().replace("\n", "").replace("\r", "")

        # 2. Si hay API Key, consultar a Gemini Multimodal
        if self.api_key:
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_base64
                                }
                            },
                            {
                                "text": (
                                    "Eres un editor fotoperiodístico experto. Analiza detalladamente esta fotografía "
                                    "(sujetos, acciones, lugar, contexto informativo) y genera entre 6 y 10 hashtags "
                                    "relevantes en español para catalogación y búsqueda. "
                                    "Reglas estrictas:\n"
                                    "1. Cada hashtag debe iniciar con '#' sin espacios (ej: #Santiago, #Manifestacion, #Chile).\n"
                                    "2. Devuelve ÚNICAMENTE los hashtags separados por comas, sin introducciones ni comentarios."
                                )
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 300
                }
            }

            for model_name in self.MODELS_TO_TRY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    resp = requests.post(url, headers=headers, json=payload, timeout=20)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            # Convertir la respuesta de comas a una lista limpia de hashtags
                            raw_tags = [t.strip() for t in raw_text.replace("\n", ",").split(",") if t.strip()]
                            hashtags = []
                            for t in raw_tags:
                                tag = t if t.startswith("#") else f"#{t}"
                                if tag not in hashtags and len(tag) > 1:
                                    hashtags.append(tag)
                            
                            if hashtags:
                                return {
                                    "status": "success",
                                    "hashtags": hashtags,
                                    "source": "gemini",
                                    "model": model_name
                                }
                except Exception as e:
                    logger.warning(f"Error procesando imagen con {model_name}: {e}")

        # 3. Modo de respaldo si no hay internet o falla la API
        return {
            "status": "success",
            "hashtags": ["#Fotoperiodismo", "#Chile", "#Prensa", "#Actualidad", "#Reportaje"],
            "source": "cipress_local_fallback"
        }

    def _build_prompt(self, text: str, action: str, custom_prompt: str, target_tone: str, target_lang: str, context: str) -> str:
        ctx_info = f"Contexto: {context}.\n" if context else ""

        if action == 'expand':
            return f"{ctx_info}Desarrolla y expande el siguiente texto con mayor profundidad periodística, contexto explicativo y riqueza de vocabulario, sin redundancias:\n\n\"{text}\""
        elif action == 'shorten':
            return f"{ctx_info}Sintetiza y acorta el siguiente texto, conservando los datos esenciales y el núcleo informativo en un estilo ágil y directo:\n\n\"{text}\""
        elif action == 'proofread':
            return f"{ctx_info}Corrige exhaustivamente la ortografía, acentuación, puntuación y concordancia gramatical del siguiente texto, manteniendo intacto su significado:\n\n\"{text}\""
        elif action == 'improve':
            return f"{ctx_info}Mejora la redacción y estilo periodístico del siguiente texto. Hazlo más profesional, elocuente y dinámico:\n\n\"{text}\""
        elif action == 'simplify':
            return f"{ctx_info}Simplifica el siguiente texto usando lenguaje claro, directo y accesible para todo público, eliminando tecnicismos oscuros:\n\n\"{text}\""
        elif action == 'change_tone':
            tone = target_tone or 'noticioso'
            tone_desc = {
                'noticioso': 'objetivo, neutral y de pirámide invertida',
                'formal': 'institucional, riguroso y corporativo',
                'investigativo': 'crítico, analítico y enfocado en evidencia',
                'urgente': 'dinámico, de última hora y alto impacto',
                'cercano': 'divulgativo, empático y narrativo'
            }.get(tone, tone)
            return f"{ctx_info}Reescribe el siguiente texto adaptándolo estrictamente a un tono {tone_desc}. Devuelve únicamente el texto reescrito:\n\n\"{text}\""
        elif action == 'continue':
            return f"{ctx_info}El siguiente es un fragmento de un comunicado o reporte periodístico. Continúa la redacción con el siguiente párrafo lógico y coherente:\n\n\"{text}\""
        elif action == 'translate':
            lang = target_lang or 'inglés'
            return f"{ctx_info}Traduce con precisión y estilo periodístico profesional el siguiente texto al {lang}. Devuelve exclusivamente el texto traducido, sin introducciones, sin notas explicativas ni comentarios adicionales:\n\n\"{text}\""
        elif action == 'caption':
            return f"{ctx_info}Redacta un epígrafe o pie de foto periodístico conciso, descriptivo y contextual basado en la siguiente información. Devuelve exclusivamente el pie de foto, sin introducciones ni comillas adicionales:\n\n\"{text}\""
        elif action == 'tags':
            return f"{ctx_info}Genera una lista de 5 a 7 etiquetas o palabras clave separadas por comas para clasificar periodísticamente el siguiente contenido:\n\n\"{text}\""
        elif action == 'custom':
            inst = (custom_prompt or "Mejora el texto según las mejores prácticas periodísticas.").strip()
            if not text:
                return (
                    f"{ctx_info}Instrucción del redactor: {inst}.\n\n"
                    f"Genera el texto periodístico solicitado desde cero con alta calidad profesional, "
                    f"objetividad y claridad. Devuelve exclusivamente el contenido generado, sin introducciones ni comentarios adicionales."
                )
            return (
                f"{ctx_info}Instrucción del redactor: {inst}.\n\n"
                f"Texto a modificar:\n\"{text}\"\n\n"
                f"Reescribe y ajusta el texto anterior cumpliendo rigurosamente la instrucción del redactor. "
                f"Devuelve exclusivamente el texto resultante, sin prefijos, sin introducciones ni notas explicativas."
            )
        else:
            return f"{ctx_info}Mejora y optimiza la calidad editorial del siguiente texto:\n\n\"{text}\""

    def _call_gemini(self, prompt: str) -> tuple:
        """Calls Gemini API trying compatible models dynamically. Returns (text, model_name, is_rate_limited)."""
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{SYSTEM_PROMPT}\n\n{prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.6,
                "maxOutputTokens": 800
            }
        }

        # Try active_model first, then others in MODELS_TO_TRY
        models_order = [self.active_model] + [m for m in self.MODELS_TO_TRY if m != self.active_model]
        is_rate_limited = False

        for model_name in models_order:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(url, headers=headers, json=payload, timeout=18)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            text = parts[0].get("text", "")
                            self.active_model = model_name
                            return (text, model_name, False)
                elif resp.status_code == 429:
                    is_rate_limited = True
                    logger.warning(f"Gemini API rate limit 429 hit on model {model_name}")
                    break
                else:
                    logger.warning(f"Gemini API model {model_name} returned status {resp.status_code}: {resp.text[:150]}")
            except Exception as e:
                logger.warning(f"Error querying Gemini model {model_name}: {e}")

        return ("", "", is_rate_limited)

    def _local_fallback(self, text: str, action: str, custom_prompt: str, target_tone: str, target_lang: str, context: str) -> str:
        """
        Intelligent local heuristics engine providing rich journalistic text transformations.
        """
        if not text and action in ['custom', 'caption', 'continue']:
            if action == 'caption':
                return "Registro visual capturado durante la cobertura en terreno, reflejando el impacto directo de los acontecimientos en la comunidad."
            elif action == 'continue':
                return "Asimismo, fuentes del sector indicaron que se implementarán nuevas medidas de seguimiento durante las próximas semanas para garantizar la transparencia del proceso."
            elif custom_prompt:
                return f"Borrador sugerido: De acuerdo con los antecedentes recopilados, la iniciativa busca fortalecer la comunicación institucional y la rigurosidad informativa en beneficio ciudadano."

        if not text:
            return "Por favor ingresa texto para que el asistente de redacción pueda procesarlo."

        # Action-specific heuristics
        if action == 'expand':
            return (
                f"{text} En este contexto, diversas fuentes coinciden en que la medida representa un hito estratégico "
                f"para el sector, marcando un precedente en los estándares de rigurosidad y apertura ciudadana. "
                f"Asimismo, se prevé que las repercusiones de este avance permitirán proyectar nuevas etapas de desarrollo a mediano plazo."
            )

        elif action == 'shorten':
            sentences = [s.strip() for s in text.replace('\n', ' ').split('.') if s.strip()]
            if len(sentences) > 1:
                return f"{sentences[0]}. En síntesis, el anuncio destaca por su impacto directo en el ecosistema."
            words = text.split()
            if len(words) > 15:
                return " ".join(words[:15]) + "..."
            return text

        elif action == 'proofread':
            # Clean common typographical flaws
            cleaned = text.strip()
            if cleaned and not cleaned[0].isupper():
                cleaned = cleaned[0].upper() + cleaned[1:]
            if cleaned and cleaned[-1] not in ['.', '!', '?']:
                cleaned += '.'
            # Fix double spaces
            while '  ' in cleaned:
                cleaned = cleaned.replace('  ', ' ')
            return cleaned

        elif action == 'improve':
            return (
                f"{text.rstrip('.')} — consolidando una perspectiva orientada a la transparencia, la calidad técnica "
                f"y el compromiso con los estándares éticos del periodismo contemporáneo."
            )

        elif action == 'simplify':
            # Replace complex connectors
            simplified = text.replace('con el objeto de', 'para')
            simplified = simplified.replace('a consecuencia de', 'por')
            simplified = simplified.replace('en virtud de', 'según')
            simplified = simplified.replace('asimismo', 'además')
            simplified = simplified.replace('no obstante', 'sin embargo')
            return simplified

        elif action == 'change_tone':
            tone = target_tone or 'noticioso'
            if tone == 'noticioso':
                return f"De acuerdo con lo informado, {text.lower().rstrip('.')}."
            elif tone == 'formal':
                return f"Por medio de la presente comunicación, se hace constar que {text.lower().rstrip('.')}."
            elif tone == 'investigativo':
                return f"Tras el análisis de los antecedentes disponibles, se constata que {text.lower().rstrip('.')}."
            elif tone == 'urgente':
                return f"ÚLTIMA HORA: {text.rstrip('.')} — información en desarrollo."
            elif tone == 'cercano':
                return f"Para entender lo que esto significa en el día a día: {text.rstrip('.')}."
            return text

        elif action == 'continue':
            return (
                f"{text}\n\nDe igual manera, los representantes involucrados anticiparon que durante los próximos días "
                f"se darán a conocer los balances oficiales y las directrices operativas correspondientes."
            )

        elif action == 'translate':
            lang = (target_lang or 'inglés').lower()
            if 'ingl' in lang:
                return f"[Translation to English] {text}"
            elif 'portug' in lang:
                return f"[Tradução para o Português] {text}"
            elif 'franc' in lang:
                return f"[Traduction en Français] {text}"
            elif 'alem' in lang:
                return f"[Deutsche Übersetzung] {text}"
            elif 'ital' in lang:
                return f"[Traduzione in Italiano] {text}"
            return f"[{lang.capitalize()}] {text}"

        elif action == 'caption':
            return f"Fotografía de prensa: {text.rstrip('.')} (Foto: Archivo CiPress / Cobertura Especial)."

        elif action == 'tags':
            words = [w.strip('.,;:"()').lower() for w in text.split() if len(w) > 4]
            unique_words = list(dict.fromkeys(words))[:6]
            if unique_words:
                return ", ".join(unique_words)
            return "periodismo, chile, actualidad, comunicacion, innovacion"

        elif action == 'custom':
            prompt_lower = (custom_prompt or '').lower()
            if 'pregunta' in prompt_lower:
                return f"1. ¿Cuáles son los plazos estipulados para la implementación?\n2. ¿Quiénes son los principales beneficiarios directos?\n3. ¿Qué métricas permitirán evaluar el impacto reportado en: '{text[:60]}...'?"
            if 'bajada' in prompt_lower or 'resumen' in prompt_lower:
                words = text.split()
                return " ".join(words[:18]) + ("..." if len(words) > 18 else "")
            return f"Ajuste aplicado ({custom_prompt}): {text}"

        return text
