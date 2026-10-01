"""
CiPress - Database Creation & Seed Script
Sprint 0-1: Base configuration, roles, users, and essential content.
"""
import os
import sys

# Ensure the app module is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.all_models import (
    Role, User, AppConfig, SiteStat, HeroHeading, PartnerLogo,
    LegalTopic, LegalFAQ,
)


def create_db():
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    app = create_app()
    with app.app_context():
        print(">>> Recreando esquema de base de datos...")
        db.drop_all()
        db.create_all()
        print(">>> Base de datos creada exitosamente.")

        # --- ROLES ---
        roles_data = [
            {"name": "Administrador", "description": "Control total del sitio, portada, secciones editoriales, avisos laborales y moderación."},
            {"name": "Cliente", "description": "Empresa o agencia empleadora con acceso para contratar y publicar ofertas."},
            {"name": "Colaborador Premium", "description": "Periodista con suscripción activa y acceso prioritario en portada."},
            {"name": "Colaborador Gratis", "description": "Periodista con acceso básico a la plataforma."},
            {"name": "Empresa", "description": "Publica contenidos auspiciados y avisos comerciales."}
        ]
        for r_data in roles_data:
            db.session.add(Role(**r_data))
        db.session.commit()

        # --- USERS (Admin + test accounts) ---
        default_pwd = generate_password_hash("123")
        admin_pwd = generate_password_hash("admin123")

        users_to_create = [
            {"first_name": "Admin", "last_name": "CiPress", "email": "admin@cipress.cl", "role": "Administrador", "region": "Metropolitana de Santiago", "password_hash": admin_pwd},
            {"first_name": "Ana", "last_name": "Sanz", "email": "ana@administrador.cl", "role": "Administrador", "region": "Metropolitana de Santiago", "password_hash": default_pwd},
            {"first_name": "Cliente", "last_name": "Test", "email": "vip@cliente.com", "role": "Cliente", "region": "Metropolitana de Santiago", "password_hash": default_pwd},
            {"first_name": "Juan", "last_name": "Premium", "email": "juan@premium.cl", "role": "Colaborador Premium", "region": "Valparaíso", "password_hash": default_pwd},
            {"first_name": "Pedro", "last_name": "Gratis", "email": "pedro@gratis.cl", "role": "Colaborador Gratis", "region": "Biobío", "password_hash": default_pwd},
        ]
        for u in users_to_create:
            db.session.add(User(**u))

        # --- HERO HEADING ---
        db.session.add(HeroHeading(
            id=1,
            main_text="Periodistas que",
            highlighted_text="emprenden",
            featured_title="La Pública",
            featured_description="Medio digital enfocado en investigación periodística de largo aliento sobre políticas públicas.",
            featured_label="DESTACADO",
            text_color="#FFFFFF",
            image_url="public-square-life.jpg"
        ))

        # --- SITE STATS ---
        stats = [
            {"id": "subscribers", "label": "suscritos entre los 18 y 64 años de edad", "end_value": 10000, "prefix": "+ de "},
            {"id": "visits", "label": "Visitas Diarias", "end_value": 6500, "prefix": ""},
            {"id": "regions", "label": "Regiones de Chile presentes entre suscritos y usuarios, diariamente", "end_value": 16, "prefix": ""}
        ]
        for s in stats:
            db.session.add(SiteStat(**s))

        # --- PARTNER LOGOS ---
        partners = [
            {"name": "Colegio de Periodistas", "logo_url": "/assets/images/logo_colegio_periodistas_2021_web.png", "website_url": "https://www.colegiodeperiodistas.cl/"},
            {"name": "INMA", "logo_url": "/assets/images/inma-logo-test-01.svg", "website_url": "https://www.inma.org/"}
        ]
        for pl in partners:
            db.session.add(PartnerLogo(**pl))

        # --- LEGAL TOPICS ---
        legal_topics = [
            {"title": "Protección de Fuentes", "description": "Entiende el marco legal que ampara el secreto profesional."},
            {"title": "Derecho a la Imagen", "description": "Conoce los límites y permisos necesarios."},
            {"title": "Calumnias e Injurias", "description": "Diferencias clave y cómo evitar riesgos legales."}
        ]
        for lt in legal_topics:
            db.session.add(LegalTopic(**lt))

        # --- LEGAL FAQS ---
        legal_faqs = [
            {"question": "¿Estoy obligado a revelar mis fuentes?", "answer": "En general, no puedes ser obligado a revelar tus fuentes bajo la ley chilena."},
            {"question": "¿Puedo tomar una foto a cualquier persona?", "answer": "En lugares públicos, generalmente sí, si es contexto noticioso."}
        ]
        for lf in legal_faqs:
            db.session.add(LegalFAQ(**lf))

        # --- APP CONFIG ---
        if not AppConfig.query.filter_by(key='rotationInterval').first():
            db.session.add(AppConfig(key='rotationInterval', value='1', description='Intervalo de rotación en horas'))
        
        seed_key = AppConfig.query.filter_by(key='INITIAL_SEED_DONE').first()
        if not seed_key:
            db.session.add(AppConfig(key='INITIAL_SEED_DONE', value='true', description='Sembrado inicial completado'))
        else:
            seed_key.value = 'true'

        db.session.commit()
        print(">>> Proceso finalizado. Base de datos inicializada con datos de Sprint 0-1.")


if __name__ == '__main__':
    create_db()
