# run.py
from app import create_app
from app.config import current_config
import os

# Crear aplicacion a nivel de modulo para Passenger/cPanel
app = create_app()

def print_banner():
    env = os.environ.get('FLASK_ENV', 'development')
    print(f"--- Cipress Backend ---")
    print(f"Environment: {env}")

def print_routes(app_instance):
    print("Routes:")
    for rule in app_instance.url_map.iter_rules():
        if rule.endpoint != 'static':
            methods = ','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
            print(f"  - {methods:6} {rule.rule}")
    print()

if __name__ == '__main__':
    # Mostrar banner antes de iniciar
    print_banner()
    
    # Mostrar rutas
    print_routes(app)
    
    # Iniciar servidor (Solo para desarrollo local)
    app.run(
        host=current_config.HOST,
        port=current_config.PORT,
        debug=current_config.DEBUG
    )
   