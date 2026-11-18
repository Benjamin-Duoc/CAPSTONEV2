"""
CiPress - AI Editorial Assistant Blueprint
Endpoints for text generation, refinement, translation and formatting.
"""

import os
from flask import Blueprint, request, jsonify, current_app
from app.services.ai_service import AIService

ai_bp = Blueprint('ai_routes', __name__, url_prefix='/api/ai')

@ai_bp.route('/status', methods=['GET'])
def ai_status():
    """Healthcheck and capability detection for AI service."""
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    return jsonify({
        "status": "ready",
        "has_gemini_key": bool(api_key),
        "engine": "gemini-1.5-flash" if api_key else "cipress_local_heuristics",
        "supported_actions": [
            "improve", "proofread", "simplify", "expand", "shorten",
            "continue", "change_tone", "translate", "caption", "tags", "custom"
        ]
    }), 200

@ai_bp.route('/assist', methods=['POST'])
def assist():
    """
    Main endpoint for journalistic writing assistant tasks.
    Payload:
    - text: str
    - action: 'improve' | 'proofread' | 'simplify' | 'expand' | 'shorten' | 'continue' | 'change_tone' | 'translate' | 'caption' | 'tags' | 'custom'
    - custom_prompt: optional str
    - target_tone: optional str ('noticioso', 'formal', 'investigativo', 'urgente', 'cercano')
    - target_lang: optional str ('inglés', 'portugués', 'francés', 'alemán', 'italiano')
    - context: optional str ('comunicado', 'fotoperiodismo', 'titular', etc.)
    """
    data = request.get_json() or {}
    text = data.get('text', '')
    action = data.get('action', 'improve')
    custom_prompt = data.get('custom_prompt')
    target_tone = data.get('target_tone')
    target_lang = data.get('target_lang')
    context = data.get('context')

    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)

    response = service.assist(
        text=text,
        action=action,
        custom_prompt=custom_prompt,
        target_tone=target_tone,
        target_lang=target_lang,
        context=context
    )

    return jsonify(response), 200

@ai_bp.route('/image-hashtags', methods=['POST'])
def image_hashtags():
    """
    Recibe una imagen en Base64 y devuelve hashtags generados con IA.
    """
    data = request.get_json() or {}
    image_base64 = data.get('image') or data.get('image_base64') or ''
    mime_type = data.get('mime_type', 'image/jpeg')

    if not image_base64:
        return jsonify({
            "status": "error",
            "message": "Se requiere la imagen en formato base64"
        }), 400

    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)

    response = service.generate_image_hashtags(image_base64=image_base64, mime_type=mime_type)
    return jsonify(response), 200

@ai_bp.route('/audit-profile', methods=['POST'])
def audit_profile():
    """
    Audita un perfil profesional del Banco de Talentos con IA de CiPress.
    Devuelve score, veredicto, puntos fuertes, mejoras y keywords.
    """
    data = request.get_json() or {}
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)
    response = service.audit_profile(data)
    return jsonify(response), 200

@ai_bp.route('/suggest-titles', methods=['POST'])
def suggest_titles():
    """
    Genera sugerencias concisas (<= 8 palabras) de títulos profesionales con IA.
    """
    data = request.get_json() or {}
    skills = data.get('skills', [])
    current_title = data.get('current_title', '')
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)
    response = service.suggest_profile_titles(skills, current_title)
    return jsonify(response), 200

@ai_bp.route('/matchmaking', methods=['POST'])
def matchmaking():
    """
    Realiza emparejamiento semántico entre un encargo urgente y perfiles de talento.
    """
    data = request.get_json() or {}
    collaboration = data.get('collaboration') or {}
    candidate_profiles = data.get('candidate_profiles')
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)
    response = service.matchmaking(collaboration, candidate_profiles)
    return jsonify(response), 200

@ai_bp.route('/matchmaking/job-to-talents', methods=['POST'])
def matchmaking_job_to_talents():
    """
    Realiza emparejamiento semántico entre una oferta laboral (Job) y la base de talentos.
    """
    data = request.get_json() or {}
    job = data.get('job') or {}
    candidate_profiles = data.get('candidate_profiles')
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)
    response = service.matchmaking_job_to_talents(job, candidate_profiles)
    return jsonify(response), 200

@ai_bp.route('/matchmaking/talent-to-jobs', methods=['POST'])
def matchmaking_talent_to_jobs():
    """
    Realiza emparejamiento semántico entre el perfil de un periodista y las ofertas laborales activas.
    """
    data = request.get_json() or {}
    talent_profile = data.get('talent_profile') or {}
    jobs = data.get('jobs')
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)
    response = service.matchmaking_talent_to_jobs(talent_profile, jobs)
    return jsonify(response), 200

@ai_bp.route('/matchmaking/talent-to-collaborations', methods=['POST'])
def matchmaking_talent_to_collaborations():
    """
    Realiza emparejamiento semántico entre el perfil de un periodista y las colaboraciones urgentes activas.
    """
    data = request.get_json() or {}
    talent_profile = data.get('talent_profile') or {}
    collaborations = data.get('collaborations')
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    service = AIService(api_key)
    response = service.matchmaking_talent_to_collaborations(talent_profile, collaborations)
    return jsonify(response), 200
