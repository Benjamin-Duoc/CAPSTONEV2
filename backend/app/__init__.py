from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime
from .config import current_config

from .extensions import db, ma


def create_app(config_class=None):
    app = Flask(__name__)
    
    # Use provided config or current_config from environment
    if config_class is None:
        config_class = current_config
    
    app.config.from_object(config_class)
    
    # Initialize config-specific setup
    config_class.init_app(app)

    # Inicializar extensiones
    db.init_app(app)
    ma.init_app(app)
    
    # Configuración Global
    app.url_map.strict_slashes = False
    
    # CORS Configuration - Use environment-specific origins
    cors_origins = app.config.get('CORS_ORIGINS', ['*'])
    CORS(app, 
         resources={r"/api/*": {"origins": cors_origins}}, 
         supports_credentials=True)
    
    Migrate(app, db)


    # =========================================================================
    # RUTAS BASE (ESTANDARIZADAS)
    # =========================================================================
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "database": "connected"}), 200

    @app.route('/api/verify')
    def verify_api():
        return jsonify({"message": "API is standardized under /api"}), 200

    # =========================================================================
    # MEDIA FILES SERVING
    # =========================================================================
    from flask import send_from_directory
    import os
    
    @app.route('/media/<path:filename>')
    def serve_media(filename):
        media_folder = os.path.join(os.path.dirname(__file__), '..', app.config.get('MEDIA_FOLDER', 'media'))
        return send_from_directory(media_folder, filename)
    
    
    # =========================================================================
    # REGISTRAR BLUEPRINTS - Sprint 0-1
    # =========================================================================
    
    from .routes.user_routes import user_bp
    app.register_blueprint(user_bp)

    from .routes.upload_routes import upload_bp
    app.register_blueprint(upload_bp)

    from .routes.home_routes import home_bp
    app.register_blueprint(home_bp)

    # --- CRUD Genérico via Route Factory (Sprint 1 - Modelos base) ---
    from .routes.route_factory import create_crud_blueprint
    from app.models.all_models import (
        User, Role, AppConfig, SiteStat, HeroHeading,
        NewsArticle, PressRelease, DestacadoArticle,
        CommunityPost, CommunityAd,
        Course, Event,
        Job,
        LegalTopic, LegalFAQ,
        PartnerLogo, 
    )

    from app.schemas.all_schemas import (
        UserSchema, AppConfigSchema, SiteStatSchema, HeroHeadingSchema,
        NewsArticleSchema, PressReleaseSchema, DestacadoArticleSchema,
        CommunityPostSchema, CommunityAdSchema,
        CourseSchema, EventSchema,
        JobSchema,
        LegalTopicSchema, LegalFAQSchema,
        PartnerLogoSchema,
    )

    # Sprint 0-1: Only base configuration and content modules
    modules = [
        ('app_config', AppConfig, AppConfigSchema, '/api/app-configs'),
        ('hero_heading', HeroHeading, HeroHeadingSchema, '/api/hero-headings'),
        ('site_stats', SiteStat, SiteStatSchema, '/api/site-stats'),
        ('partner_logos', PartnerLogo, PartnerLogoSchema, '/api/partner-logos'),
        ('legal_topics', LegalTopic, LegalTopicSchema, '/api/legal-topics'),
        ('legal_faqs', LegalFAQ, LegalFAQSchema, '/api/legal-faqs'),
        # Sprint 1 - Base content models (structure ready, full UI in Sprint 2)
        ('news_articles', NewsArticle, NewsArticleSchema, '/api/news-articles'),
        ('destacados', DestacadoArticle, DestacadoArticleSchema, '/api/destacados'),
        ('courses', Course, CourseSchema, '/api/courses'),
        ('jobs', Job, JobSchema, '/api/jobs'),
        ('events', Event, EventSchema, '/api/events'),
        ('community_posts', CommunityPost, CommunityPostSchema, '/api/community-posts'),
        ('community_ads', CommunityAd, CommunityAdSchema, '/api/community-ads'),
    ]

    for name, model, schema, prefix in modules:
        app.register_blueprint(create_crud_blueprint(name, model, schema, prefix))
    
    # TODO: Sprint 2 - Register additional blueprints:
    # - sponsor_bp (Patrocinadores Premium)
    # - talent_bp (Banco de Talentos)
    # - shareable_photo_bp (Fotos compartibles)
    # - photojournalism_bp (Marketplace de fotoperiodismo)
    # - press_release_bp (Comunicados con autor)
    # - payment_bp (Pasarela Flow)
    # And additional CRUD modules:
    # - PremiumSponsor, Entrepreneurship, FreelanceService, FundingOpportunity,
    #   Resource, ShareablePhoto, Specialist, TalentProfile, etc.

    # =========================================================================
    # CONSOLE LOG PARA DEBUG
    # =========================================================================
    
    print("\n" + "="*60)
    print(">>> CIPRESS BACKEND INICIADO")
    print("="*60)
    print(f"Hora de inicio: {datetime.utcnow().isoformat()}")
    print(f"URL Backend: http://127.0.0.1:5000")
    print(f"URL Frontend: http://127.0.0.1:3000")
    print("\nSprint 0-1: Rutas base activas")
    print("  * GET  /health")
    print("  * GET  /api/verify")
    print("  * GET  /api/users")
    print("  * GET  /api/hero-headings")
    print("  * GET  /api/site-stats")
    print("  * GET  /api/partner-logos")
    print("="*60 + "\n")

    return app
