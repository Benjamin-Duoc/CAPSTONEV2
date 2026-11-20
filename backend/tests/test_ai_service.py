from app.services.ai_service import AIService

def test_ai_service_initialization():
    """CP-UNIT-03: Validar inicialización de AIService y configuración de modelos."""
    service = AIService()
    assert service is not None
    assert len(service.MODELS_TO_TRY) >= 1
    assert "gemini-2.5-flash" in service.MODELS_TO_TRY

def test_ai_service_local_fallback():
    """CP-UNIT-04: Validar fallback heurístico local cuando Gemini API está desconectada."""
    # Instanciamos sin API key para forzar el motor local resiliente
    service = AIService(api_key=None)
    response = service.assist(
        text="Este es un reporte urgente sobre innovación y medios digitales en Santiago.",
        action="summarize"
    )
    assert response["status"] == "success"
    assert response["source"] == "cipress_local_engine"
    assert len(response["result"]) > 0

def test_ai_image_hashtags_generation():
    """CP-UNIT-05: Validar generación de hashtags fotoperiodísticos (CU-01)."""
    service = AIService(api_key=None)
    # Simular una imagen en base64 de prueba
    dummy_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP"
    result = service.generate_image_hashtags(dummy_base64)
    
    assert result["status"] == "success"
    assert "hashtags" in result
    assert isinstance(result["hashtags"], list)
    assert len(result["hashtags"]) > 0
    # Todos los hashtags deben comenzar con '#'
    for tag in result["hashtags"]:
        assert tag.startswith("#")
