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
