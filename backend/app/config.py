import os
from dotenv import load_dotenv

# Determine environment
FLASK_ENV = os.environ.get('FLASK_ENV', 'development')

# Load environment-specific .env file
if FLASK_ENV == 'production':
    env_file = '.env.production'
else:
    env_file = '.env.development'

# Load the environment file
env_path = os.path.join(os.path.dirname(__file__), '..', env_file)
load_dotenv(env_path)

# Also load default .env if it exists (for backwards compatibility)
default_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(default_env_path):
    load_dotenv(default_env_path, override=False)

class Config:
    """Base configuration"""
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-cipress'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'instance', 'cipress.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API Keys
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    # Flow Payments
    FLOW_API_KEY = os.environ.get('FLOW_API_KEY')
    FLOW_SECRET_KEY = os.environ.get('FLOW_SECRET_KEY')
    FLOW_API_URL = os.environ.get('FLOW_API_URL', 'https://sandbox.flow.cl/api')
    
    # Server
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    BACKEND_URL = os.environ.get('BACKEND_URL', 'https://www.cipress.cl/backendcipress')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Frontend
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://127.0.0.1:3000')
    
    # Media Files
    MEDIA_FOLDER = os.environ.get('MEDIA_FOLDER', 'media')
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'media/uploads')
    
    # Environment
    ENV = FLASK_ENV
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        # Ensure media and instance folders exist
        media_path = os.path.join(os.path.dirname(__file__), '..', Config.MEDIA_FOLDER)
        upload_path = os.path.join(os.path.dirname(__file__), '..', Config.UPLOAD_FOLDER)
        instance_path = os.path.join(os.path.dirname(__file__), '..', 'instance')
        
        os.makedirs(media_path, exist_ok=True)
        os.makedirs(upload_path, exist_ok=True)
        os.makedirs(instance_path, exist_ok=True)
        
        # Log configuration
        if Config.DEBUG:
            print(f"\nConfiguration loaded:")
            print(f"   Environment: {Config.ENV}")
            print(f"   Debug: {Config.DEBUG}")
            print(f"   Host: {Config.HOST}:{Config.PORT}")
            print(f"   CORS Origins: {Config.CORS_ORIGINS}")
            print(f"   Media Folder: {Config.MEDIA_FOLDER}")
            print(f"   Upload Folder: {Config.UPLOAD_FOLDER}\n")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = 'development'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    ENV = 'production'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# Get current config
current_config = config.get(FLASK_ENV, config['default'])

