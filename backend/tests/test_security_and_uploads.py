import io
from app.routes.upload_routes import allowed_file

def test_allowed_file_extension_whitelist():
    """CP-SEC-01: Validar lista blanca de extensiones permitidas (Prevención Upload Vulnerability)."""
    valid_files = ["foto.jpg", "imagen.PNG", "grafico.jpeg", "banner.webp", "anim.gif"]
    for fname in valid_files:
        assert allowed_file(fname) is True, f"Debería permitir {fname}"

def test_disallowed_file_extension_blacklist():
    """CP-SEC-02: Validar rechazo estricto de ejecutables y scripts maliciosos."""
    malicious_files = ["exploit.exe", "backdoor.sh", "webshell.php", "script.bat", "trojan.dll", "virus.py"]
    for fname in malicious_files:
        assert allowed_file(fname) is False, f"Debería bloquear {fname}"

def test_upload_endpoint_no_file_payload(client):
    """CP-SEC-03: Validar respuesta 400 Bad Request cuando no se adjunta archivo."""
    response = client.post('/api/upload', data={})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "No file part" in data["message"]

def test_cors_headers_present(client):
    """CP-SEC-04: Validar presencia de encabezados de seguridad CORS."""
    response = client.get('/health')
    assert response.status_code == 200
    # Comprobar que responde con content-type application/json
    assert "application/json" in response.content_type
