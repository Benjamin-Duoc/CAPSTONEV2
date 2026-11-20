import sys
import os
import pytest

# Asegurar que el directorio backend está en sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.config import TestingConfig
from app.extensions import db

@pytest.fixture(scope='session')
def app():
    """Crea y configura la instancia de la aplicación Flask para pruebas."""
    _app = create_app(TestingConfig)
    
    with _app.app_context():
        db.create_all()
        yield _app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """Cliente de prueba HTTP para simular solicitudes a la API."""
    return app.test_client()

@pytest.fixture(scope='function')
def db_session(app):
    """Sesión de base de datos aislada para pruebas unitarias."""
    with app.app_context():
        yield db.session
        db.session.rollback()
