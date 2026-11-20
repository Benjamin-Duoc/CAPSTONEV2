def test_health_check_endpoint(client):
    """CP-INT-01: Verificar que el endpoint de salud responde 200 y status healthy."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_api_standardization_verify(client):
    """CP-INT-02: Validar estandarización de rutas bajo el prefijo /api."""
    response = client.get('/api/verify')
    assert response.status_code == 200
    data = response.get_json()
    assert "API is standardized under /api" in data["message"]

def test_non_existent_route_returns_404(client):
    """CP-INT-03: Validar que rutas no registradas retornen 404 Not Found."""
    response = client.get('/api/ruta_no_existente_404')
    assert response.status_code == 404
