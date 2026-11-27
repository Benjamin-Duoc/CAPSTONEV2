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

    def audit_profile(self, profile_data: dict) -> dict:
        """
        Audita un perfil profesional del Banco de Talentos usando Gemini o heurística avanzada local.
        Evalúa completitud, coherencia de habilidades, trayectoria y empleabilidad periodística.
        """
        name = profile_data.get('name', 'Colega')
        title = (profile_data.get('title') or '').strip()
        skills = profile_data.get('skills') or []
        experience_years = profile_data.get('experience_years') or profile_data.get('experienceYears') or 0
        region = profile_data.get('region') or 'Metropolitana de Santiago'
        availability = profile_data.get('availability') or 'Remoto'
        linkedin_url = profile_data.get('linkedin_url') or profile_data.get('linkedinUrl') or ''
        expected_salary = profile_data.get('expected_salary') or profile_data.get('expectedSalary') or ''
        is_premium = bool(profile_data.get('is_premium') or profile_data.get('isPremium'))

        # 1. Intentar con Gemini si la API key está presente
        if self.api_key:
            skills_str = ", ".join([s for s in skills if s]) if isinstance(skills, list) else str(skills)
            prompt = (
                "Eres un consultor senior de empleabilidad editorial y reclutamiento especializado en periodismo, "
                "fotoperiodismo y medios de comunicación para la red CiPress en Chile.\n"
                "Audita de forma constructiva, rigurosa y profesional el siguiente perfil profesional del Banco de Talentos:\n"
                f"- Nombre: {name}\n"
                f"- Título descriptor: {title}\n"
                f"- Años de experiencia: {experience_years}\n"
                f"- Habilidades clave: {skills_str}\n"
                f"- Región geográfica: {region}\n"
                f"- Modalidad: {availability}\n"
                f"- Perfil LinkedIn: {'Registrado' if linkedin_url else 'No registrado'}\n"
                f"- Renta pretendida: {'Registrada' if expected_salary else 'No declarada'}\n"
                f"- Nivel de membresía: {'Colaborador Premium (prioridad en directorio)' if is_premium else 'Colaborador Gratis'}\n\n"
                "Genera una auditoría con diagnóstico de empleabilidad. Responde ÚNICAMENTE un objeto JSON estrictamente válido "
                "con la siguiente estructura exacta, sin texto introductorio, sin explicaciones ni bloques de markdown fuera del json:\n"
                "{\n"
                '  "profile_score": <entero entre 40 y 98 según completitud y solidez>,\n'
                '  "verdict": "<frase concisa de 2 a 4 palabras, ej: \'Perfil Altamente Competitivo\', \'Perfil Sólido en Crecimiento\'>",\n'
                '  "strengths": ["<punto fuerte concreto 1>", "<punto fuerte concreto 2>", "<punto fuerte concreto 3>"],\n'
                '  "improvements": ["<recomendación accionable 1>", "<recomendación accionable 2>", "<recomendación accionable 3>"],\n'
                '  "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],\n'
                '  "suggested_bio": "<Extracto profesional de 2 o 3 oraciones de alto impacto destacando experiencia y valor periodístico>",\n'
                '  "suggested_titles": ["<Título alternativo 1 (máx 8 palabras)>", "<Título alternativo 2 (máx 8 palabras)>"]\n'
                "}"
            )

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 700
                }
            }

            for model_name in self.MODELS_TO_TRY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    resp = requests.post(url, headers=headers, json=payload, timeout=18)
                    if resp.status_code == 200:
                        candidates = resp.json().get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_json = raw_text.strip()
                            if clean_json.startswith("```json"):
                                clean_json = clean_json[7:]
                            if clean_json.startswith("```"):
                                clean_json = clean_json[3:]
                            if clean_json.endswith("```"):
                                clean_json = clean_json[:-3]
                            clean_json = clean_json.strip()

                            parsed = json.loads(clean_json)
                            return {
                                "status": "success",
                                "source": "gemini",
                                "model": model_name,
                                "data": parsed
                            }
                except Exception as e:
                    logger.warning(f"Error auditando perfil con Gemini ({model_name}): {e}")

        # 2. Heurística local de alta fidelidad si no hay API key o hubo error
        return {
            "status": "success",
            "source": "cipress_local_heuristics",
            "data": self._local_profile_audit(name, title, skills, experience_years, region, availability, linkedin_url, expected_salary, is_premium)
        }

    def _local_profile_audit(self, name, title, skills, experience_years, region, availability, linkedin_url, expected_salary, is_premium):
        """Genera un reporte heurístico inteligente para perfiles de periodistas."""
        clean_skills = [s.strip() for s in skills if s and s.strip()] if isinstance(skills, list) else []
        title_word_count = len(title.split()) if title else 0

        score = 40
        if title:
            score += 15 if title_word_count <= 8 else 5
        if len(clean_skills) >= 3:
            score += 20
        elif len(clean_skills) >= 1:
            score += 10
        if int(experience_years or 0) > 0:
            score += 10
        if linkedin_url:
            score += 10
        if expected_salary:
            score += 5
        score = min(score, 96)

        if score >= 80:
            verdict = "Perfil Altamente Competitivo"
        elif score >= 60:
            verdict = "Perfil Sólido en Crecimiento"
        else:
            verdict = "Perfil Básico con Buen Potencial"

        strengths = []
        if len(clean_skills) >= 3:
            strengths.append(f"Diversidad de especialidades identificadas: {', '.join(clean_skills[:2])}.")
        if int(experience_years or 0) >= 3:
            strengths.append(f"Trayectoria consolidada de {experience_years} años que aporta credibilidad editorial.")
        elif int(experience_years or 0) > 0:
            strengths.append(f"Experiencia inicial ({experience_years} año) que demuestra dinamismo y adaptabilidad.")
        if title and title_word_count <= 8:
            strengths.append(f"Título profesional conciso y directo: \"{title}\".")
        if not strengths:
            strengths.append("Información de contacto y disponibilidad geográfica claramente establecida.")

        improvements = []
        if not linkedin_url:
            improvements.append("Añadir tu enlace a LinkedIn aumenta significativamente la tasa de contacto de agencias.")
        if len(clean_skills) < 3:
            improvements.append("Completa las 3 habilidades principales para facilitar coincidencias con coberturas urgentes.")
        if title_word_count > 8:
            improvements.append("Ajusta tu título a un máximo de 8 palabras para una lectura ágil en listados de medios.")
        if int(experience_years or 0) == 0:
            improvements.append("Indica tus años de experiencia acumulados para calificar en búsquedas con filtro de seniority.")
        if not expected_salary and is_premium:
            improvements.append("Indicar un rango salarial estimado acelera negociaciones laborales con empleadores.")
        if not improvements:
            improvements.append("Mantén tus habilidades actualizadas con herramientas emergentes de IA periodística y fact-checking.")

        keywords = list(dict.fromkeys([
            s for s in clean_skills
        ] + [
            "Periodismo", region, "Prensa Digital", "Cobertura Editorial", "Redacción"
        ]))[:5]

        skill_ref = f"especializado en {clean_skills[0]}" if clean_skills else "con enfoque en periodismo riguroso"
        if len(clean_skills) > 1:
            skill_ref += f" y {clean_skills[1]}"
        exp_ref = f"{experience_years} años de trayectoria" if int(experience_years or 0) > 0 else "trayectoria emergente"
        suggested_bio = f"Comunicador profesional en {region} con {exp_ref}, {skill_ref}. Comprometido con el rigor informativo, narrativas modernas y la entrega oportuna de contenidos para medios y agencias."

        suggested_titles = []
        if clean_skills:
            suggested_titles.append(f"Periodista Especialista en {clean_skills[0]}"[:50])
            if len(clean_skills) > 1:
                suggested_titles.append(f"Corresponsal & Editor en {clean_skills[1]}"[:50])
        else:
            suggested_titles.append("Periodista Multimedia & Redactor de Prensa")
            suggested_titles.append("Comunicador Estratégico y de Terreno")

        return {
            "profile_score": score,
            "verdict": verdict,
            "strengths": strengths[:3],
            "improvements": improvements[:3],
            "keywords": keywords,
            "suggested_bio": suggested_bio,
            "suggested_titles": suggested_titles
        }

    def suggest_profile_titles(self, skills: list, current_title: str = "") -> dict:
        """
        Genera sugerencias de títulos descriptivos profesionales concisos (<= 8 palabras).
        """
        clean_skills = [s.strip() for s in skills if s and s.strip()] if isinstance(skills, list) else []
        skills_str = ", ".join(clean_skills) if clean_skills else "Periodismo general, Redacción"

        if self.api_key:
            prompt = (
                f"Genera exactamente 3 títulos profesionales periodísticos atractivos y concisos (máximo 8 palabras cada uno) "
                f"para un comunicador en Chile cuyas habilidades principales son: {skills_str}.\n"
                f"Título actual: '{current_title or 'Sin definir'}'.\n"
                "Devuelve ÚNICAMENTE los 3 títulos separados por saltos de línea, sin números ni viñetas ni comentarios adicionales."
            )
            result, used_model, _ = self._call_gemini(prompt)
            if result:
                lines = [l.strip().lstrip('1234567890.-*• ') for l in result.split('\n') if l.strip()]
                valid_titles = [" ".join(l.split()[:8]) for l in lines if l]
                if valid_titles:
                    return {
                        "status": "success",
                        "titles": valid_titles[:3],
                        "source": "gemini"
                    }

        base = clean_skills[0] if clean_skills else "Investigación"
        sec = clean_skills[1] if len(clean_skills) > 1 else "Medios Digitales"
        return {
            "status": "success",
            "titles": [
                f"Periodista Especializado en {base}"[:45],
                f"Redactor Senior de {base} y {sec}"[:45],
                "Corresponsal Multimedia y Analista Editorial"
            ],
            "source": "cipress_local_heuristics"
        }

    @staticmethod
    def _extract_int_id(*values):
        for v in values:
            if v is None or v == "":
                continue
            try:
                return int(v)
            except (TypeError, ValueError):
                continue
        return None

    @classmethod
    def _collect_user_ids(cls, source: dict, id_keys: tuple, acting_user_id=None) -> set:
        """Recopila los user_id asociados al emisor de la búsqueda para excluir auto-coincidencias."""
        ids = set()
        if source:
            uid = cls._extract_int_id(*(source.get(k) for k in id_keys))
            if uid is not None:
                ids.add(uid)
        acting_uid = cls._extract_int_id(acting_user_id)
        if acting_uid is not None:
            ids.add(acting_uid)
        return ids

    @classmethod
    def _filter_out_self_records(cls, items: list, excluded_user_ids: set, id_keys: tuple, excluded_names: set = None) -> list:
        """Excluye candidatos o publicaciones pertenecientes al propio usuario solicitante."""
        if not items:
            return []
        clean_names = {str(n).strip().lower() for n in (excluded_names or set()) if n and str(n).strip()}
        filtered = []
        for item in items:
            item_uid = cls._extract_int_id(*(item.get(k) for k in id_keys))
            if item_uid is not None and item_uid in excluded_user_ids:
                continue
            # Respaldo por nombre exacto solo cuando el registro carece de user_id vinculado
            if item_uid is None and clean_names:
                item_name = (item.get('name') or item.get('author') or '').strip().lower()
                if item_name and item_name in clean_names:
                    continue
            filtered.append(item)
        return filtered

    def matchmaking(self, collaboration: dict, candidate_profiles: list = None, acting_user_id=None) -> dict:
        """
        Realiza el emparejamiento semántico entre un pedido urgente de colaboración
        y los perfiles profesionales registrados en el Banco de Talentos.
        """
        title = (collaboration.get('title') or '').strip()
        deadline = collaboration.get('deadline') or 'Inmediato'
        budget = collaboration.get('budget') or 'A convenir'

        # Si no se entregan perfiles desde el frontend, consultarlos desde la base de datos
        if not candidate_profiles:
            try:
                from app.models.all_models import TalentProfile
                from app.schemas.all_schemas import TalentProfileSchema
                schema = TalentProfileSchema(many=True)
                raw_profiles = TalentProfile.query.all()
                candidate_profiles = schema.dump(raw_profiles)
            except Exception as e:
                logger.warning(f"Error cargando perfiles para matchmaking: {e}")
                candidate_profiles = []

        excluded_uids = self._collect_user_ids(
            collaboration,
            ('author_user_id', 'authorUserId', 'user_id', 'userId'),
            acting_user_id=acting_user_id
        )
        candidate_profiles = self._filter_out_self_records(
            candidate_profiles,
            excluded_uids,
            ('user_id', 'userId'),
            excluded_names={collaboration.get('author')}
        )

        if not candidate_profiles:
            return {
                "status": "success",
                "summary": "No hay otros perfiles registrados en el Banco de Talentos para realizar el emparejamiento.",
                "matches": [],
                "source": "local"
            }

        # 1. Intentar emparejamiento inteligente con Gemini
        if self.api_key:
            candidates_summary = []
            for p in candidate_profiles[:15]:
                clean_skills = [s for s in (p.get('skills') or []) if s]
                candidates_summary.append({
                    "id": p.get('id'),
                    "name": p.get('name'),
                    "title": p.get('title'),
                    "skills": clean_skills,
                    "region": p.get('region'),
                    "availability": p.get('availability'),
                    "experience_years": p.get('experience_years') or 0,
                    "is_premium": bool(p.get('is_premium') or p.get('isPremium'))
                })

            prompt = (
                "Eres el motor de emparejamiento semántico y selección de talentos (Matchmaking Editorial) "
                "de CiPress (Círculo de Periodistas de Chile).\n"
                "Tu objetivo es encontrar a los mejores profesionales del Banco de Talentos para cubrir este encargo urgente:\n\n"
                f"REQUERIMIENTO DE COBERTURA URGENTE:\n"
                f"- Título/Tema: {title}\n"
                f"- Plazo: {deadline}\n"
                f"- Presupuesto: {budget}\n\n"
                f"PERFILES DE TALENTO DISPONIBLES:\n{json.dumps(candidates_summary, ensure_ascii=False)}\n\n"
                "CRITERIOS DE EVALUACIÓN:\n"
                "1. Afinidad temática y técnica entre la cobertura y las habilidades/título del talento.\n"
                "2. Compatibilidad geográfica regional.\n"
                "3. Seniority y años de experiencia.\n\n"
                "Devuelve ÚNICAMENTE un objeto JSON estrictamente válido con esta estructura exacta:\n"
                "{\n"
                '  "summary": "<Resumen ejecutivo de 1 o 2 oraciones justificando la selección de candidatos>",\n'
                '  "matches": [\n'
                "    {\n"
                '      "talent_id": <id numérico>,\n'
                '      "name": "<nombre del talento>",\n'
                '      "title": "<título del talento>",\n'
                '      "region": "<región>",\n'
                '      "match_percentage": <entero entre 65 y 98>,\n'
                '      "recommended_role": "<Rol periodístico asignable, ej: Reportero Gráfico en Terreno, Redactor Especializado>",\n'
                '      "match_reasons": ["<razón 1>", "<razón 2>"],\n'
                '      "whatsapp_message": "Hola <Nombre>, te contacto desde CiPress respecto a la colaboración urgente \\"<Título>\\". Tu perfil fue seleccionado con alta afinidad para esta cobertura. ¿Tienes disponibilidad?"\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Ordena la lista 'matches' de mayor a menor porcentaje de afinidad. Incluye máximo 4 candidatos."
            )

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 800
                }
            }

            for model_name in self.MODELS_TO_TRY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    resp = requests.post(url, headers=headers, json=payload, timeout=18)
                    if resp.status_code == 200:
                        candidates = resp.json().get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_json = raw_text.strip()
                            if clean_json.startswith("```json"):
                                clean_json = clean_json[7:]
                            if clean_json.startswith("```"):
                                clean_json = clean_json[3:]
                            if clean_json.endswith("```"):
                                clean_json = clean_json[:-3]
                            clean_json = clean_json.strip()

                            parsed = json.loads(clean_json)
                            enriched_matches = self._enrich_matches(parsed.get('matches', []), candidate_profiles)
                            return {
                                "status": "success",
                                "source": "gemini",
                                "model": model_name,
                                "summary": parsed.get('summary', 'Candidatos seleccionados con alta afinidad técnica y territorial.'),
                                "matches": enriched_matches
                            }
                except Exception as e:
                    logger.warning(f"Error en matchmaking con Gemini ({model_name}): {e}")

        # 2. Respaldo heurístico local
        local_res = self._local_matchmaking(title, deadline, budget, candidate_profiles)
        return {
            "status": "success",
            "source": "cipress_local_heuristics",
            **local_res
        }

    def _enrich_matches(self, matches: list, original_profiles: list) -> list:
        """Enriquece los resultados de Gemini con fotos de avatar y datos de los perfiles permitidos."""
        profiles_by_id = {p.get('id'): p for p in original_profiles if p.get('id')}
        enriched = []
        for m in matches:
            tid = m.get('talent_id')
            if tid not in profiles_by_id:
                continue
            orig = profiles_by_id[tid]
            enriched.append({
                **m,
                "avatar_url": orig.get('avatar_url') or f"https://i.pravatar.cc/150?u={tid or 1}",
                "linkedin_url": orig.get('linkedin_url', ''),
                "is_premium": bool(orig.get('is_premium') or orig.get('isPremium'))
            })
        return enriched

    def _local_matchmaking(self, title: str, deadline: str, budget: str, candidate_profiles: list) -> dict:
        """Motor heurístico de coincidencia geográfica y temática para periodistas."""
        title_lower = title.lower()
        scored_matches = []

        keywords_map = {
            "foto": "Fotoperiodismo",
            "imagen": "Fotoperiodismo",
            "grafic": "Reportería Gráfica",
            "marcha": "Cobertura en Terreno",
            "evento": "Cobertura en Vivo",
            "investiga": "Periodismo de Investigación",
            "dato": "Periodismo de Datos",
            "polit": "Crónica Política",
            "tribunal": "Crónica Judicial",
            "redacc": "Redacción Editorial",
            "cultur": "Periodismo Cultural"
        }

        matched_specialties = [spec for kw, spec in keywords_map.items() if kw in title_lower]
        if not matched_specialties:
            matched_specialties = ["Prensa General", "Cobertura Rápida"]

        for p in candidate_profiles:
            score = 65
            reasons = []
            clean_skills = [s for s in (p.get('skills') or []) if s]
            p_title = (p.get('title') or '').lower()
            p_region = p.get('region') or 'Metropolitana'

            # 1. Coincidencia geográfica
            if p_region.lower() in title_lower or "metropolitana" in p_region.lower():
                score += 15
                reasons.append(f"Ubicación estratégica en {p_region} para rápida respuesta.")
            else:
                reasons.append(f"Disponibilidad operativa con base en {p_region}.")

            # 2. Coincidencia de habilidades
            skill_matched = False
            for s in clean_skills:
                for kw in keywords_map:
                    if kw in s.lower() and kw in title_lower:
                        score += 15
                        reasons.append(f"Especialidad verificada en {s}.")
                        skill_matched = True
                        break
                if skill_matched:
                    break

            if not skill_matched and clean_skills:
                reasons.append(f"Dominio de competencias complementarias: {clean_skills[0]}.")

            # 3. Experiencia
            exp = int(p.get('experience_years') or 0)
            if exp >= 3:
                score += 8
                reasons.append(f"{exp} años de experiencia profesional acreditada.")

            score = min(score, 97)
            rec_role = matched_specialties[0] if matched_specialties else "Corresponsal Editorial"
            name = p.get('name') or 'Colega'

            wa_msg = (
                f"Hola {name}, te contacto desde CiPress respecto al requerimiento urgente '{title}' "
                f"(Plazo: {deadline}, Presupuesto: {budget}). Tu perfil en el Banco de Talentos fue seleccionado "
                f"por afinidad técnica. ¿Tienes disponibilidad para sumarte?"
            )

            scored_matches.append({
                "talent_id": p.get('id'),
                "name": name,
                "title": p.get('title') or 'Periodista CiPress',
                "region": p_region,
                "avatar_url": p.get('avatar_url') or f"https://i.pravatar.cc/150?u={p.get('id', 1)}",
                "match_percentage": score,
                "recommended_role": rec_role,
                "match_reasons": reasons[:2],
                "whatsapp_message": wa_msg,
                "linkedin_url": p.get('linkedin_url', ''),
                "is_premium": bool(p.get('is_premium') or p.get('isPremium'))
            })

        # Ordenar descendente por afinidad
        scored_matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        top_matches = scored_matches[:4]

        return {
            "summary": f"Se identificaron {len(top_matches)} profesionales con afinidad temática hacia '{title}'.",
            "matches": top_matches
        }

    def matchmaking_job_to_talents(self, job: dict, candidate_profiles: list = None, acting_user_id=None) -> dict:
        """
        Realiza el emparejamiento semántico entre una Oferta Laboral (Job)
        y los perfiles profesionales registrados en el Banco de Talentos.
        """
        job_title = (job.get('title') or '').strip()
        company = (job.get('company') or '').strip()
        area = job.get('area') or 'Prensa'
        location = job.get('location') or 'Chile'
        job_type = job.get('type') or 'Completo'
        description = job.get('description') or ''
        apply_email = job.get('apply_email') or job.get('applyEmail') or 'contacto@cipress.cl'

        if not candidate_profiles:
            try:
                from app.models.all_models import TalentProfile
                from app.schemas.all_schemas import TalentProfileSchema
                schema = TalentProfileSchema(many=True)
                raw_profiles = TalentProfile.query.all()
                candidate_profiles = schema.dump(raw_profiles)
            except Exception as e:
                logger.warning(f"Error cargando perfiles para job-to-talents: {e}")
                candidate_profiles = []

        excluded_uids = self._collect_user_ids(
            job,
            ('user_id', 'userId', 'author_user_id', 'authorUserId'),
            acting_user_id=acting_user_id
        )
        candidate_profiles = self._filter_out_self_records(
            candidate_profiles,
            excluded_uids,
            ('user_id', 'userId')
        )

        if not candidate_profiles:
            return {
                "status": "success",
                "summary": "No hay otros perfiles registrados en el Banco de Talentos para realizar el emparejamiento.",
                "matches": [],
                "source": "local"
            }

        # 1. Intentar con Gemini
        if self.api_key:
            candidates_summary = []
            for p in candidate_profiles[:15]:
                clean_skills = [s for s in (p.get('skills') or []) if s]
                candidates_summary.append({
                    "id": p.get('id'),
                    "name": p.get('name'),
                    "title": p.get('title'),
                    "skills": clean_skills,
                    "region": p.get('region'),
                    "availability": p.get('availability'),
                    "experience_years": p.get('experience_years') or 0,
                    "is_premium": bool(p.get('is_premium') or p.get('isPremium')),
                    "email": p.get('email') or f"talento_{p.get('id')}@cipress.cl"
                })

            prompt = (
                "Eres el motor de selección de talentos y Matchmaking Editorial de CiPress (Círculo de Periodistas de Chile).\n"
                "Tu misión es encontrar a los mejores candidatos del Banco de Talentos para cubrir la siguiente vacante laboral:\n\n"
                f"OFERTA LABORAL:\n"
                f"- Cargo: {job_title}\n"
                f"- Medio / Empresa: {company}\n"
                f"- Área: {area}\n"
                f"- Ubicación: {location}\n"
                f"- Jornada / Tipo: {job_type}\n"
                f"- Requisitos y Descripción: {description[:500]}\n\n"
                f"PERFILES DE TALENTO REGISTRADOS:\n{json.dumps(candidates_summary, ensure_ascii=False)}\n\n"
                "CRITERIOS DE SELECCIÓN:\n"
                "1. Afinidad directa entre las habilidades del periodista y el área periodística (Prensa, Digital, TV, Radio).\n"
                "2. Experiencia previa y años de ejercicio profesional adecuados al cargo.\n"
                "3. Compatibilidad geográfica y disponibilidad horaria/remota.\n\n"
                "Devuelve ÚNICAMENTE un objeto JSON estrictamente válido con este formato:\n"
                "{\n"
                '  "summary": "<Resumen de 1-2 oraciones explicando por qué estos candidatos son ideales para el cargo>",\n'
                '  "matches": [\n'
                "    {\n"
                '      "talent_id": <id numérico>,\n'
                '      "name": "<nombre del talento>",\n'
                '      "title": "<título>",\n'
                '      "region": "<región>",\n'
                '      "match_percentage": <entero entre 68 y 98>,\n'
                '      "recommended_role": "<Rol o especialidad recomendada, ej: Editor Digital, Redactor Senior, Reportero>",\n'
                '      "match_reasons": ["<razón 1>", "<razón 2>"]\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Ordena la lista 'matches' de mayor a menor porcentaje de afinidad (máximo 4 candidatos)."
            )

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
            }

            for model_name in self.MODELS_TO_TRY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    resp = requests.post(url, headers=headers, json=payload, timeout=18)
                    if resp.status_code == 200:
                        candidates = resp.json().get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_json = raw_text.strip()
                            if clean_json.startswith("```json"):
                                clean_json = clean_json[7:]
                            if clean_json.startswith("```"):
                                clean_json = clean_json[3:]
                            if clean_json.endswith("```"):
                                clean_json = clean_json[:-3]
                            clean_json = clean_json.strip()

                            parsed = json.loads(clean_json)
                            enriched = self._enrich_matches(parsed.get('matches', []), candidate_profiles)
                            for item in enriched:
                                orig = next((p for p in candidate_profiles if p.get('id') == item.get('talent_id')), {})
                                item['email'] = orig.get('email') or apply_email
                                item['experience_years'] = orig.get('experience_years') or 0
                                item['availability'] = orig.get('availability') or 'Disponible'

                            return {
                                "status": "success",
                                "source": "gemini",
                                "model": model_name,
                                "summary": parsed.get('summary', f"Candidatos seleccionados con alta afinidad para el cargo de {job_title} en {company}."),
                                "matches": enriched
                            }
                except Exception as e:
                    logger.warning(f"Error en matchmaking_job_to_talents con Gemini ({model_name}): {e}")

        # 2. Respaldo heurístico local
        local_res = self._local_job_to_talents(job, candidate_profiles)
        return {
            "status": "success",
            "source": "cipress_local_heuristics",
            **local_res
        }

    def _local_job_to_talents(self, job: dict, candidate_profiles: list) -> dict:
        job_title = (job.get('title') or '').lower()
        area = (job.get('area') or 'Prensa').lower()
        location = (job.get('location') or '').lower()
        apply_email = job.get('apply_email') or job.get('applyEmail') or 'contacto@cipress.cl'

        scored = []
        for p in candidate_profiles:
            score = 65
            reasons = []
            clean_skills = [s.lower() for s in (p.get('skills') or []) if s]
            p_title = (p.get('title') or '').lower()
            p_region = (p.get('region') or 'Metropolitana').lower()
            p_avail = (p.get('availability') or '').lower()
            exp = int(p.get('experience_years') or 0)

            # 1. Coincidencia de Área
            if area in p_title or any(area in s for s in clean_skills):
                score += 15
                reasons.append(f"Experiencia y competencias alineadas con el área {job.get('area')}.")
            elif "digital" in area and ("web" in p_title or "redes" in p_title or any("digital" in s for s in clean_skills)):
                score += 15
                reasons.append("Dominio comprobado en ecosistemas y plataformas digitales.")
            else:
                reasons.append(f"Perfil adaptable al área de {job.get('area')}.")

            # 2. Coincidencia de Ubicación o Remoto
            if "remoto" in location or "remoto" in p_avail:
                score += 10
                reasons.append("Compatibilidad para modalidad remota o híbrida.")
            elif location in p_region or "metropolitana" in p_region:
                score += 10
                reasons.append(f"Residencia en {p.get('region')}, compatible con la ubicación requerida.")

            # 3. Experiencia acreditada
            if exp >= 3:
                score += 8
                reasons.append(f"{exp} años de trayectoria profesional acreditada.")

            score = min(score, 97)

            scored.append({
                "talent_id": p.get('id'),
                "name": p.get('name') or 'Colega',
                "title": p.get('title') or 'Periodista CiPress',
                "region": p.get('region') or 'Metropolitana',
                "avatar_url": p.get('avatar_url') or f"https://i.pravatar.cc/150?u={p.get('id', 1)}",
                "match_percentage": score,
                "recommended_role": f"Candidato para {job.get('title')}",
                "match_reasons": reasons[:2],
                "email": p.get('email') or apply_email,
                "linkedin_url": p.get('linkedin_url', ''),
                "experience_years": exp,
                "availability": p.get('availability') or 'Disponible',
                "is_premium": bool(p.get('is_premium') or p.get('isPremium'))
            })

        scored.sort(key=lambda x: x['match_percentage'], reverse=True)
        top = scored[:4]
        return {
            "summary": f"Se identificaron {len(top)} profesionales destacados del Banco de Talentos con afinidad para '{job.get('title')}'.",
            "matches": top
        }

    def matchmaking_talent_to_jobs(self, talent_profile: dict, jobs: list = None, acting_user_id=None) -> dict:
        """
        Realiza el emparejamiento semántico entre el perfil de un Periodista (TalentProfile)
        y la lista de ofertas laborales activas en CiPress.
        """
        p_name = talent_profile.get('name') or 'Periodista'
        p_title = talent_profile.get('title') or ''
        clean_skills = [s for s in (talent_profile.get('skills') or []) if s]
        p_region = talent_profile.get('region') or 'Metropolitana'
        p_exp = int(talent_profile.get('experience_years') or 0)
        p_avail = talent_profile.get('availability') or 'Completa'
        p_bio = talent_profile.get('bio') or ''

        if not jobs:
            try:
                from app.models.all_models import Job
                from app.schemas.all_schemas import JobSchema
                schema = JobSchema(many=True)
                raw_jobs = Job.query.all()
                jobs = schema.dump(raw_jobs)
            except Exception as e:
                logger.warning(f"Error cargando jobs para talent-to-jobs: {e}")
                jobs = []

        excluded_uids = self._collect_user_ids(
            talent_profile,
            ('user_id', 'userId'),
            acting_user_id=acting_user_id
        )
        jobs = self._filter_out_self_records(
            jobs,
            excluded_uids,
            ('user_id', 'userId', 'author_user_id', 'authorUserId')
        )

        if not jobs:
            return {
                "status": "success",
                "summary": "No hay ofertas laborales de terceros activas en este momento.",
                "matches": [],
                "source": "local"
            }

        # 1. Intentar con Gemini
        if self.api_key:
            jobs_summary = []
            for j in jobs[:15]:
                jobs_summary.append({
                    "id": j.get('id'),
                    "title": j.get('title'),
                    "company": j.get('company'),
                    "area": j.get('area'),
                    "location": j.get('location'),
                    "type": j.get('type'),
                    "description": (j.get('description') or '')[:250]
                })

            prompt = (
                "Eres el orientador laboral y motor de Matchmaking Editorial de CiPress (Círculo de Periodistas de Chile).\n"
                "Tu misión es evaluar el perfil del siguiente periodista y recomendarle las mejores ofertas laborales acordes a sus fortalezas:\n\n"
                f"PERFIL DEL PERIODISTA:\n"
                f"- Nombre: {p_name}\n"
                f"- Título descriptor: {p_title}\n"
                f"- Habilidades: {', '.join(clean_skills)}\n"
                f"- Años de experiencia: {p_exp}\n"
                f"- Región: {p_region}\n"
                f"- Disponibilidad: {p_avail}\n"
                f"- Extracto/Bio: {p_bio[:300]}\n\n"
                f"VACANTES LABORALES DISPONIBLES:\n{json.dumps(jobs_summary, ensure_ascii=False)}\n\n"
                "CRITERIOS DE RECOMENDACIÓN:\n"
                "1. Nivel de coincidencia entre las habilidades/experiencia del periodista y las responsabilidades del cargo.\n"
                "2. Compatibilidad del área periodística (Prensa, Digital, TV, Radio).\n"
                "3. Viabilidad de modalidad (remoto/híbrido/presencial regional).\n\n"
                "Devuelve ÚNICAMENTE un objeto JSON estrictamente válido con esta estructura:\n"
                "{\n"
                '  "summary": "<Resumen personalizado de 1-2 oraciones explicando por qué estas vacantes son las más recomendadas para el periodista>",\n'
                '  "matches": [\n'
                "    {\n"
                '      "job_id": <id numérico>,\n'
                '      "match_percentage": <entero entre 65 y 98>,\n'
                '      "compatibility_tier": "<Alta | Media | Básica>",\n'
                '      "match_reasons": ["<razón 1>", "<razón 2>"],\n'
                '      "highlight": "<Frase motivadora corta destacando el principal punto fuerte para esta vacante>"\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Ordena 'matches' de mayor a menor porcentaje de afinidad."
            )

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
            }

            for model_name in self.MODELS_TO_TRY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    resp = requests.post(url, headers=headers, json=payload, timeout=18)
                    if resp.status_code == 200:
                        candidates = resp.json().get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_json = raw_text.strip()
                            if clean_json.startswith("```json"):
                                clean_json = clean_json[7:]
                            if clean_json.startswith("```"):
                                clean_json = clean_json[3:]
                            if clean_json.endswith("```"):
                                clean_json = clean_json[:-3]
                            clean_json = clean_json.strip()

                            parsed = json.loads(clean_json)
                            allowed_job_ids = {j.get('id') for j in jobs if j.get('id') is not None}
                            valid_matches = [m for m in parsed.get('matches', []) if m.get('job_id') in allowed_job_ids]
                            return {
                                "status": "success",
                                "source": "gemini",
                                "model": model_name,
                                "summary": parsed.get('summary', 'Ofertas seleccionadas según tu perfil periodístico.'),
                                "matches": valid_matches
                            }
                except Exception as e:
                    logger.warning(f"Error en matchmaking_talent_to_jobs con Gemini ({model_name}): {e}")

        # 2. Respaldo heurístico local
        local_res = self._local_talent_to_jobs(talent_profile, jobs)
        return {
            "status": "success",
            "source": "cipress_local_heuristics",
            **local_res
        }

    def _local_talent_to_jobs(self, talent_profile: dict, jobs: list) -> dict:
        p_title = (talent_profile.get('title') or '').lower()
        skills = [s.lower() for s in (talent_profile.get('skills') or []) if s]
        p_region = (talent_profile.get('region') or 'Metropolitana').lower()
        exp = int(talent_profile.get('experience_years') or 0)

        scored = []
        for j in jobs:
            score = 65
            reasons = []
            j_title = (j.get('title') or '').lower()
            area = (j.get('area') or 'Prensa').lower()
            location = (j.get('location') or '').lower()

            if area in p_title or any(area in s for s in skills):
                score += 15
                reasons.append(f"Tus competencias calzan con el área de {j.get('area')}.")
            elif "digital" in area and any(k in p_title or any(k in s for s in skills) for k in ["digital", "web", "redes"]):
                score += 15
                reasons.append("Tu perfil digital se alinea con el formato de esta publicación.")

            if "remoto" in location:
                score += 10
                reasons.append("Modalidad de trabajo remota compatible.")
            elif location in p_region or "metropolitana" in p_region:
                score += 10
                reasons.append(f"Ubicación en {j.get('location')} compatible con tu zona de residencia.")

            if exp >= 3:
                score += 8
                reasons.append(f"Cumples con el nivel de experiencia requerido ({exp} años).")

            score = min(score, 97)
            tier = "Alta" if score >= 80 else ("Media" if score >= 70 else "Básica")

            scored.append({
                "job_id": j.get('id'),
                "match_percentage": score,
                "compatibility_tier": tier,
                "match_reasons": reasons[:2],
                "highlight": f"Tu perfil en CiPress tiene una afinidad {tier.lower()} con esta vacante."
            })

        scored.sort(key=lambda x: x['match_percentage'], reverse=True)
        return {
            "summary": f"Hemos evaluado {len(jobs)} vacantes laborales y encontramos {len(scored)} con afinidad para tu perfil.",
            "matches": scored
        }

    def matchmaking_talent_to_collaborations(self, talent_profile: dict, collaborations: list = None, acting_user_id=None) -> dict:
        """
        Realiza el emparejamiento semántico entre el perfil de un Periodista (TalentProfile)
        y la lista de colaboraciones urgentes activas en CiPress.
        """
        p_name = talent_profile.get('name') or 'Periodista'
        p_title = talent_profile.get('title') or ''
        clean_skills = [s for s in (talent_profile.get('skills') or []) if s]
        p_region = talent_profile.get('region') or 'Metropolitana'
        p_exp = int(talent_profile.get('experience_years') or 0)
        p_avail = talent_profile.get('availability') or 'Completa'
        p_bio = talent_profile.get('bio') or ''

        if not collaborations:
            try:
                from app.models.all_models import ShortCollaboration
                from app.schemas.all_schemas import ShortCollaborationSchema
                schema = ShortCollaborationSchema(many=True)
                raw_collabs = ShortCollaboration.query.all()
                collaborations = schema.dump(raw_collabs)
            except Exception as e:
                logger.warning(f"Error cargando colaboraciones para talent-to-collabs: {e}")
                collaborations = []

        excluded_uids = self._collect_user_ids(
            talent_profile,
            ('user_id', 'userId'),
            acting_user_id=acting_user_id
        )
        collaborations = self._filter_out_self_records(
            collaborations,
            excluded_uids,
            ('author_user_id', 'authorUserId', 'user_id', 'userId'),
            excluded_names={talent_profile.get('name')}
        )

        if not collaborations:
            return {
                "status": "success",
                "summary": "No hay colaboraciones urgentes de otros usuarios activas en este momento.",
                "matches": [],
                "source": "local"
            }

        # 1. Intentar con Gemini
        if self.api_key:
            collabs_summary = []
            for c in collaborations[:15]:
                collabs_summary.append({
                    "id": c.get('id'),
                    "title": c.get('title'),
                    "deadline": c.get('deadline'),
                    "budget": c.get('budget'),
                    "author": c.get('author')
                })

            prompt = (
                "Eres el orientador laboral y motor de Matchmaking Editorial de CiPress (Círculo de Periodistas de Chile).\n"
                "Tu misión es evaluar el perfil del siguiente periodista y recomendarle las colaboraciones urgentes y pautas de terreno que mejor encajan con sus habilidades:\n\n"
                f"PERFIL DEL PERIODISTA:\n"
                f"- Nombre: {p_name}\n"
                f"- Título descriptor: {p_title}\n"
                f"- Habilidades: {', '.join(clean_skills)}\n"
                f"- Años de experiencia: {p_exp}\n"
                f"- Región: {p_region}\n"
                f"- Disponibilidad: {p_avail}\n"
                f"- Bio: {p_bio[:300]}\n\n"
                f"COLABORACIONES URGENTES DISPONIBLES:\n{json.dumps(collabs_summary, ensure_ascii=False)}\n\n"
                "CRITERIOS DE RECOMENDACIÓN:\n"
                "1. Afinidad temática de la pauta con las habilidades del periodista (ej: cobertura gráfica si sabe fotografía, redacción rápida, investigación, terreno).\n"
                "2. Disponibilidad e inmediatez para asumir asignaciones urgentes.\n\n"
                "Devuelve ÚNICAMENTE un objeto JSON estrictamente válido con esta estructura:\n"
                "{\n"
                '  "summary": "<Resumen personalizado de 1-2 oraciones explicando por qué estas colaboraciones son las más idóneas para el periodista>",\n'
                '  "matches": [\n'
                "    {\n"
                '      "collab_id": <id numérico>,\n'
                '      "match_percentage": <entero entre 65 y 98>,\n'
                '      "compatibility_tier": "<Alta | Media | Básica>",\n'
                '      "match_reasons": ["<razón 1>", "<razón 2>"],\n'
                '      "highlight": "<Frase motivadora corta destacando por qué postular a esta pauta>"\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Ordena 'matches' de mayor a menor porcentaje de afinidad."
            )

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
            }

            for model_name in self.MODELS_TO_TRY:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    resp = requests.post(url, headers=headers, json=payload, timeout=18)
                    if resp.status_code == 200:
                        candidates = resp.json().get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_json = raw_text.strip()
                            if clean_json.startswith("```json"):
                                clean_json = clean_json[7:]
                            if clean_json.startswith("```"):
                                clean_json = clean_json[3:]
                            if clean_json.endswith("```"):
                                clean_json = clean_json[:-3]
                            clean_json = clean_json.strip()

                            parsed = json.loads(clean_json)
                            allowed_collab_ids = {c.get('id') for c in collaborations if c.get('id') is not None}
                            valid_matches = [m for m in parsed.get('matches', []) if m.get('collab_id') in allowed_collab_ids]
                            return {
                                "status": "success",
                                "source": "gemini",
                                "model": model_name,
                                "summary": parsed.get('summary', 'Colaboraciones recomendadas para tu perfil.'),
                                "matches": valid_matches
                            }
                except Exception as e:
                    logger.warning(f"Error en matchmaking_talent_to_collaborations con Gemini ({model_name}): {e}")

        # 2. Respaldo heurístico local
        local_res = self._local_talent_to_collaborations(talent_profile, collaborations)
        return local_res

    def _local_talent_to_collaborations(self, talent_profile: dict, collaborations: list) -> dict:
        skills = [s.lower() for s in (talent_profile.get('skills') or []) if s]
        title_lower = (talent_profile.get('title') or '').lower()
        scored = []

        for c in collaborations:
            collab_id = c.get('id')
            c_title = (c.get('title') or '').lower()
            score = 70

            matched_terms = []
            for s in skills:
                if s in c_title:
                    score += 10
                    matched_terms.append(s)

            if "foto" in c_title and ("foto" in title_lower or any("foto" in s for s in skills)):
                score += 15
                matched_terms.append("fotografía")
            if "redac" in c_title and ("redac" in title_lower or any("redac" in s for s in skills)):
                score += 12
                matched_terms.append("redacción")
            if "evento" in c_title or "pauta" in c_title:
                score += 5

            score = min(max(score, 65), 96)
            tier = 'Alta' if score >= 85 else ('Media' if score >= 75 else 'Básica')

            reasons = []
            if matched_terms:
                reasons.append(f"Afinidad con tus habilidades de {', '.join(set(matched_terms[:2]))}.")
            else:
                reasons.append("Pauta periodística compatible con tu disponibilidad y perfil profesional.")

            scored.append({
                "collab_id": collab_id,
                "match_percentage": score,
                "compatibility_tier": tier,
                "match_reasons": reasons,
                "highlight": "Asignación rápida acorde a tu especialidad."
            })

        scored.sort(key=lambda x: x['match_percentage'], reverse=True)
        return {
            "status": "success",
            "source": "local",
            "summary": "Colaboraciones de última hora priorizadas según tus competencias profesionales.",
            "matches": scored
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
