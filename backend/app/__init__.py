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
    
    # Sembrado automatico DESACTIVADO (Usar create-db.py)
    # run_seed(app)
    
    # Configuración Global
    app.url_map.strict_slashes = False
    
    # CORS Configuration - Use environment-specific origins
    cors_origins = app.config.get('CORS_ORIGINS', ['*'])
    CORS(app, 
         resources={r"/api/*": {"origins": cors_origins}}, 
         supports_credentials=True)
    
    Migrate(app, db)

    # Auto-compatibilidad de esquema SQLite para nuevas columnas (Docker y Local)
    with app.app_context():
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if 'talent_profiles' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('talent_profiles')]
                if 'bio' not in cols:
                    with db.engine.connect() as conn:
                        conn.execute(text("ALTER TABLE talent_profiles ADD COLUMN bio TEXT"))
                        conn.commit()
                    app.logger.info("Migración automática: Columna 'bio' añadida a talent_profiles")

            if 'freelance_services' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('freelance_services')]
                with db.engine.connect() as conn:
                    if 'user_id' not in cols:
                        conn.execute(text("ALTER TABLE freelance_services ADD COLUMN user_id INTEGER REFERENCES usuario(id)"))
                    if 'price' not in cols:
                        conn.execute(text("ALTER TABLE freelance_services ADD COLUMN price VARCHAR"))
                    if 'delivery_time' not in cols:
                        conn.execute(text("ALTER TABLE freelance_services ADD COLUMN delivery_time VARCHAR"))
                    if 'whatsapp_contact' not in cols:
                        conn.execute(text("ALTER TABLE freelance_services ADD COLUMN whatsapp_contact VARCHAR"))
                    if 'email' not in cols:
                        conn.execute(text("ALTER TABLE freelance_services ADD COLUMN email VARCHAR"))
                    if 'created_at' not in cols:
                        conn.execute(text("ALTER TABLE freelance_services ADD COLUMN created_at DATETIME"))

                    # Reconciliación automática de registros huérfanos preexistentes (Docker y Local)
                    conn.execute(text("UPDATE freelance_services SET user_id = 4 WHERE user_id IS NULL AND (email = 'premium@colab.com' OR provider LIKE '%Juan%' OR service LIKE '%Investigación%')"))
                    conn.execute(text("UPDATE freelance_services SET user_id = 5 WHERE user_id IS NULL AND (email = 'gratis@colab.com' OR provider LIKE '%Pedro%' OR service LIKE '%Prensa%')"))
                    conn.execute(text("UPDATE freelance_services SET user_id = 6 WHERE user_id IS NULL AND (email = 'gaby@gratis.cl' OR provider LIKE '%Gaby%' OR service LIKE '%Fotoperiodismo%')"))
                    conn.execute(text("UPDATE freelance_services SET user_id = 1 WHERE user_id IS NULL AND (email = 'ana@administrador.cl' OR provider LIKE '%Ana%' OR service LIKE '%Corrección%')"))
                    conn.commit()
                app.logger.info("Migración automática: Columnas verificadas para freelance_services")

            if 'jobs' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('jobs')]
                with db.engine.connect() as conn:
                    if 'user_id' not in cols:
                        conn.execute(text("ALTER TABLE jobs ADD COLUMN user_id INTEGER REFERENCES usuario(id)"))
                    if 'created_at' not in cols:
                        conn.execute(text("ALTER TABLE jobs ADD COLUMN created_at DATETIME"))

                    # Reconciliación automática de ofertas laborales huérfanas preexistentes (Docker y Local)
                    conn.execute(text("UPDATE jobs SET user_id = 3 WHERE user_id IS NULL AND (apply_email = 'ely@empresa.cl' OR id IN (1, 2, 3, 5))"))
                    conn.execute(text("UPDATE jobs SET user_id = 1 WHERE user_id IS NULL AND (apply_email = 'ana@administrador.cl' OR id = 7)"))
                    conn.commit()
                app.logger.info("Migración automática: Columnas verificadas para jobs")

            if 'specialists' in inspector.get_table_names():
                cols = [c['name'] for c in inspector.get_columns('specialists')]
                with db.engine.connect() as conn:
                    if 'user_id' not in cols:
                        conn.execute(text("ALTER TABLE specialists ADD COLUMN user_id INTEGER REFERENCES usuario(id)"))
                    if 'institution' not in cols:
                        conn.execute(text("ALTER TABLE specialists ADD COLUMN institution VARCHAR"))
                    if 'category' not in cols:
                        conn.execute(text("ALTER TABLE specialists ADD COLUMN category VARCHAR"))
                    if 'coverage_notes' not in cols:
                        conn.execute(text("ALTER TABLE specialists ADD COLUMN coverage_notes TEXT"))
                    if 'reliability_level' not in cols:
                        conn.execute(text("ALTER TABLE specialists ADD COLUMN reliability_level VARCHAR"))
                    if 'is_public' not in cols:
                        conn.execute(text("ALTER TABLE specialists ADD COLUMN is_public BOOLEAN DEFAULT 1"))

                    # Reconciliación automática de fuentes huérfanas preexistentes
                    conn.execute(text("UPDATE specialists SET user_id = 1 WHERE user_id IS NULL AND id IN (1, 2)"))
                    conn.execute(text("UPDATE specialists SET user_id = 3 WHERE user_id IS NULL AND id = 3"))
                    conn.execute(text("UPDATE specialists SET user_id = 4 WHERE user_id IS NULL AND id = 4"))
                    conn.execute(text("UPDATE specialists SET user_id = 5 WHERE user_id IS NULL AND id = 5"))
                    conn.commit()
                app.logger.info("Migración automática: Columnas verificadas para specialists")
        except Exception as e:
            app.logger.warning(f"Aviso de compatibilidad de esquema: {e}")


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
        """Serve media files from the media folder"""
        media_folder = os.path.join(os.path.dirname(__file__), '..', app.config.get('MEDIA_FOLDER', 'media'))
        return send_from_directory(media_folder, filename)
    
    
    
    # =========================================================================
    # REGISTRAR LOS BLUEPRINTS EXISTENTES (tu código original)
    # =========================================================================
    
    from .routes.user_routes import user_bp
    app.register_blueprint(user_bp)

    from .routes.upload_routes import upload_bp
    app.register_blueprint(upload_bp)

    from .routes.sponsor_routes import sponsor_bp
    app.register_blueprint(sponsor_bp)

    from .routes.home_routes import home_bp
    app.register_blueprint(home_bp)

    from .routes.talent_routes import talent_bp
    app.register_blueprint(talent_bp)

    from .routes.shareable_photo_routes import shareable_photo_bp
    app.register_blueprint(shareable_photo_bp)

    from .routes.photojournalism_routes import photojournalism_bp
    app.register_blueprint(photojournalism_bp)

    from .routes.press_release_routes import press_release_bp
    app.register_blueprint(press_release_bp)

    from .routes.short_collaboration_routes import short_collab_bp
    app.register_blueprint(short_collab_bp)

    from .routes.payment_routes import payment_bp
    app.register_blueprint(payment_bp)

    from .routes.ai_routes import ai_bp
    app.register_blueprint(ai_bp)

    from .routes.route_factory import create_crud_blueprint
    from app.models.all_models import (
        User, Role, AppConfig, SiteStat, HeroHeading,
        NewsArticle, PressRelease, PhotojournalismPost, DestacadoArticle,
        CommunityPost, CommunityAd, ShortCollaboration,
        Course, Entrepreneurship, EntrepreneurshipTip, Event, FundingOpportunity,
        Job, FreelanceService,
        LegalTopic, LegalFAQ, PromoVideo, NgoSpotlight,
        ShareablePhoto, PartnerLogo, SponsoredAd, PremiumSponsor,
        TalentProfile, Specialist, SpecialAd, Resource
    )

    from app.schemas.all_schemas import (
        UserSchema, AppConfigSchema, SiteStatSchema, HeroHeadingSchema,
        NewsArticleSchema, PressReleaseSchema, PhotojournalismPostSchema, DestacadoArticleSchema,
        CommunityPostSchema, CommunityAdSchema, ShortCollaborationSchema,
        CourseSchema, EntrepreneurshipSchema, EntrepreneurshipTipSchema, EventSchema, FundingOpportunitySchema,
        JobSchema, FreelanceServiceSchema,
        LegalTopicSchema, LegalFAQSchema, PromoVideoSchema, NgoSpotlightSchema,
        ShareablePhotoSchema, PartnerLogoSchema, SponsoredAdSchema, PremiumSponsorSchema,
        TalentProfileSchema, SpecialistSchema, SpecialAdSchema, ResourceSchema
    )

    modules = [
        ('app_config', AppConfig, AppConfigSchema, '/api/app-configs'),
        ('community_ads', CommunityAd, CommunityAdSchema, '/api/community-ads'),
        ('community_posts', CommunityPost, CommunityPostSchema, '/api/community-posts'),
        ('courses', Course, CourseSchema, '/api/courses'),
        ('entrepreneurship', Entrepreneurship, EntrepreneurshipSchema, '/api/entrepreneurships'),
        ('entrepreneurship_tips', EntrepreneurshipTip, EntrepreneurshipTipSchema, '/api/entrepreneurship-tips'),
        ('events', Event, EventSchema, '/api/events'),
        ('freelance_services', FreelanceService, FreelanceServiceSchema, '/api/freelance-services'),
        ('funding_opportunities', FundingOpportunity, FundingOpportunitySchema, '/api/funding-opportunities'),
        ('hero_heading', HeroHeading, HeroHeadingSchema, '/api/hero-headings'),
        ('jobs', Job, JobSchema, '/api/jobs'),
        ('legal_faqs', LegalFAQ, LegalFAQSchema, '/api/legal-faqs'),
        ('legal_topics', LegalTopic, LegalTopicSchema, '/api/legal-topics'),
        ('destacados', DestacadoArticle, DestacadoArticleSchema, '/api/destacados'),
        ('news_articles', NewsArticle, NewsArticleSchema, '/api/news-articles'),
        ('ngo_spotlights', NgoSpotlight, NgoSpotlightSchema, '/api/ngo-spotlights'),
        ('partner_logos', PartnerLogo, PartnerLogoSchema, '/api/partner-logos'),
        # ('photojournalism_posts', PhotojournalismPost, PhotojournalismPostSchema, '/api/photojournalism-posts'),
        # ('press_releases', PressRelease, PressReleaseSchema, '/api/press-releases'), # Replaced by custom press_release_bp
        ('promo_videos', PromoVideo, PromoVideoSchema, '/api/promo-videos'),
        ('resources', Resource, ResourceSchema, '/api/resources'),
        # ('shareable_photos', ShareablePhoto, ShareablePhotoSchema, '/api/shareable-photos'), # Replaced by custom
        # ('short_collaborations', ShortCollaboration, ShortCollaborationSchema, '/api/short-collaborations'), # Replaced by custom short_collab_bp
        ('site_stats', SiteStat, SiteStatSchema, '/api/site-stats'),
        ('special_ads', SpecialAd, SpecialAdSchema, '/api/special-ads'),
        ('specialists', Specialist, SpecialistSchema, '/api/specialists'),
        ('sponsored_ads', SponsoredAd, SponsoredAdSchema, '/api/sponsored-ads'),
        # ('talent_profiles', TalentProfile, TalentProfileSchema, '/api/talent-profiles'), # Replaced by custom talent_bp
    ]

    for name, model, schema, prefix in modules:
        app.register_blueprint(create_crud_blueprint(name, model, schema, prefix))
    
    # =========================================================================
    # CONSOLE LOG PARA DEBUG (se muestra al iniciar)
    # =========================================================================
    
    print("\n" + "="*60)
    print(">>> CIPRESS BACKEND INICIADO")
    print("="*60)
    print(f"Hora de inicio: {datetime.utcnow().isoformat()}")
    print(f"URL Backend: http://127.0.0.1:5000")
    print(f"URL Frontend: http://127.0.0.1:3000")
    print("\nENDPOINTS SINGULARES (para frontend):")
    print("  * GET  /hero-heading")
    print("  * GET  /app-config")
    print("  * GET  /freelance-services")
    print("  * GET  /ngo-spotlights")
    print("  * GET  /courses")
    print("  * GET  /jobs")
    print("  * GET  /community-ads")
    print("  * GET  /community-posts")
    print("  * GET  /events")
    print("  * GET  /legal-faqs")
    print("  * GET  /legal-topics")
    print("  * GET  /news-articles")
    print("  * GET  /press-releases")
    print("  * GET  /resources")
    print("\nENDPOINTS API (plural con /api/):")
    print("  * GET  /api/users")
    print("  * GET  /api/hero-headings")
    print("  * GET  /api/app-configs")
    print("  * ... y todos los demas modelos")
    print("="*60 + "\n")

    return app