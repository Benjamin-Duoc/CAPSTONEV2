"""
CiPress - Database Creation & Seed Script
Sprint 0 + Sprint 1 (100%) + Sprint 2 (Parcial: Semanas 9-10)
"""
import os
import sys
import json
from datetime import datetime, date

# Ensure backend folder is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.all_models import (
    Role, User, AppConfig, SiteStat, HeroHeading,
    NewsArticle, PressRelease, DestacadoArticle,
    Job, ShortCollaboration, PhotojournalismPost, ShareablePhoto,
    Specialist, TalentProfile, PremiumSponsor, FreelanceService,
    CommunityPost, SpecialAd, PartnerLogo, LegalTopic, LegalFAQ
)


def create_db():
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    app = create_app()
    with app.app_context():
        print(">>> Eliminando tablas existentes...")
        db.drop_all()
        
        print(">>> Creando esquema de base de datos...")
        db.create_all()
        
        print(">>> Sembrando datos (Sprint 0, Sprint 1 y Sprint 2 parcial)...")

        # =====================================================================
        # 1. ROLES (Sprint 0)
        # =====================================================================
        roles_data = [
            {"name": "Administrador", "description": "Control total del sitio, portada, secciones editoriales, avisos laborales y moderación."},
            {"name": "Cliente", "description": "Empresa con acceso estricto a editar el bloque Confían en CiPress. Max 3."},
            {"name": "Colaborador Premium", "description": "Colaborador con acceso a Dashboard, Home Prime Time (08:00 a 12:00) y duración de 3 hrs."},
            {"name": "Colaborador Gratis", "description": "Publica gratis pero su visualización en Home es nocturna, rotativa o backup."},
            {"name": "Empresa", "description": "Publica contenidos pagados (noticias auspiciadas, avisos comerciales)."}
        ]
        for r_data in roles_data:
            db.session.add(Role(**r_data))
        db.session.commit()

        # =====================================================================
        # 2. USUARIOS (Sprint 0)
        # =====================================================================
        default_pwd = generate_password_hash("123", method="pbkdf2:sha256")
        admin_pwd = generate_password_hash("admin123", method="pbkdf2:sha256")

        users_to_create = [
            {"first_name": "Admin", "last_name": "CiPress", "email": "admin@cipress.cl", "role": "Administrador", "region": "Metropolitana de Santiago", "password_hash": admin_pwd},
            {"first_name": "Ana", "last_name": "Sanz", "email": "ana@administrador.cl", "role": "Administrador", "region": "Metropolitana de Santiago", "password_hash": default_pwd},
            {"first_name": "Cliente", "last_name": "Test", "email": "vip@cliente.com", "role": "Cliente", "region": "Metropolitana de Santiago", "password_hash": default_pwd},
            {"first_name": "Empresa", "last_name": "Test", "email": "ely@empresa.cl", "role": "Empresa", "region": "Metropolitana de Santiago", "password_hash": default_pwd},
            {"first_name": "Juan", "last_name": "Premium", "email": "premium@colab.com", "role": "Colaborador Premium", "region": "Valparaíso", "password_hash": default_pwd},
            {"first_name": "Pedro", "last_name": "Gratis", "email": "gratis@colab.com", "role": "Colaborador Gratis", "region": "Biobío", "password_hash": default_pwd},
        ]
        for u in users_to_create:
            db.session.add(User(**u))
        db.session.commit()

        # =====================================================================
        # 3. CONFIGURACIÓN Y PORTADA (Sprint 0)
        # =====================================================================
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

        stats = [
            {"id": "subscribers", "label": "suscritos entre los 18 y 64 años de edad", "end_value": 10000, "prefix": "+ de "},
            {"id": "visits", "label": "Visitas Diarias", "end_value": 6500, "prefix": ""},
            {"id": "regions", "label": "Regiones de Chile presentes entre suscritos y usuarios, diariamente", "end_value": 16, "prefix": ""}
        ]
        for s in stats:
            db.session.add(SiteStat(**s))

        partners = [
            {"name": "Colegio de Periodistas", "logo_url": "/assets/images/logo_colegio_periodistas_2021_web.png", "website_url": "https://www.colegiodeperiodistas.cl/"},
            {"name": "INMA", "logo_url": "/assets/images/inma-logo-test-01.svg", "website_url": "https://www.inma.org/"}
        ]
        for pl in partners:
            db.session.add(PartnerLogo(**pl))

        legal_topics = [
            {"title": "Protección de Fuentes", "description": "Entiende el marco legal que ampara el secreto profesional."},
            {"title": "Derecho a la Imagen", "description": "Conoce los límites y permisos necesarios."},
            {"title": "Calumnias e Injurias", "description": "Diferencias clave y cómo evitar riesgos legales."}
        ]
        for lt in legal_topics:
            db.session.add(LegalTopic(**lt))

        legal_faqs = [
            {"question": "¿Estoy obligado a revelar mis fuentes?", "answer": "En general, no puedes ser obligado a revelar tus fuentes bajo la ley chilena."},
            {"question": "¿Puedo tomar una foto a cualquier persona?", "answer": "En lugares públicos, generalmente sí, si es contexto noticioso."}
        ]
        for lf in legal_faqs:
            db.session.add(LegalFAQ(**lf))

        special_ads = [
            {"id": "legal", "title": "Asesoría Legal y Ética", "description": "Recurso gratuito para suscriptores.", "cta_text": "Consultar Beneficio"},
            {"id": "entrepreneurship", "title": "¿Quieres emprender?", "description": "Te asesoramos con iniciación de actividades.", "cta_text": "Saber Más"}
        ]
        for spa in special_ads:
            db.session.add(SpecialAd(**spa))

        db.session.add(AppConfig(key='rotationInterval', value='1', description='Intervalo de rotación en horas'))
        db.session.add(AppConfig(key='INITIAL_SEED_DONE', value='true', description='Sembrado inicial completado'))

        # =====================================================================
        # 4. SPRINT 1: NOTICIAS, COMUNICADOS Y DESTACADOS
        # =====================================================================
        destacados = [
            {
                "title": "Cipress Lanza Nueva Plataforma para Periodismo Emprendedor",
                "category": "Institucional",
                "author": "Equipo Cipress",
                "date": "24 Oct, 2024",
                "image_url": "https://picsum.photos/seed/destacado1/800/600",
                "summary": "Una nueva era para el periodismo independiente y la colaboración entre profesionales de la comunicación en Chile y Latinoamérica.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "El Círculo de Periodistas Emprendedores e Innovadores de Chile (CiPress) anunció hoy la puesta en marcha de su plataforma digital integral."},
                    {"type": "quote", "text": "Nuestro propósito es crear un ecosistema donde la calidad periodística y la sostenibilidad profesional caminen de la mano.", "author": "Directorio CiPress"},
                    {"type": "paragraph", "text": "Con herramientas que van desde la bolsa de empleo especializado hasta la comercialización de fotografías con derechos de uso, CiPress busca dotar a cada profesional de capacidades reales para emprender."}
                ])
            },
            {
                "title": "Investigación Revela el Impacto de la Sequía en Zonas Rurales",
                "category": "Reportaje",
                "author": "Isidora Paz",
                "date": "22 Oct, 2024",
                "image_url": "https://picsum.photos/seed/destacado2/800/600",
                "summary": "Reportaje de largo aliento documenta las transformaciones socioambientales en valles de la zona central.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "A través de un exhaustivo levantamiento de datos satelitales y testimonios locales, este reportaje analiza la situación hídrica..."},
                    {"type": "quote", "text": "La crisis del agua no es solo climática, también es de gestión y gobernanza.", "author": "Dra. Carolina Vera"}
                ])
            }
        ]
        for dest in destacados:
            db.session.add(DestacadoArticle(**dest))

        articles = [
            {
                "title": "La IA Generativa y su Impacto en las Salas de Redacción Chilenas",
                "category": "Tecnología",
                "author": "Equipo Editorial",
                "date": "15 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/news1/400/225",
                "summary": "Un análisis profundo sobre cómo herramientas como Gemini y ChatGPT están transformando la producción de noticias.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "La inteligencia artificial generativa ha irrumpido en las salas de redacción, transformando flujos de trabajo tradicionales."},
                    {"type": "quote", "text": "La IA no es una amenaza para el buen periodismo, sino una palanca para profundizar la investigación.", "author": "Directora de Innovación"},
                    {"type": "paragraph", "text": "Medios chilenos comienzan a experimentar con automatización de resúmenes, apoyo en transcripciones y procesamiento de grandes volúmenes de documentos."}
                ])
            },
            {
                "title": "Nuevos Modelos de Suscripción Ganan Terreno en Medios Digitales",
                "category": "Industria",
                "author": "Isidora Paz",
                "date": "12 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/news2/400/225",
                "summary": "Exploramos casos de éxito de micromedios chilenos que apuestan por comunidades de lectores comprometidas.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "La dependencia de la publicidad programática está dando paso a modelos de membresía más cercanos a la audiencia."}
                ])
            },
            {
                "title": "Avanza Proyecto de Ley sobre Protección y Secreto Profesional de Periodistas",
                "category": "Legislación",
                "author": "Tomás Reyes",
                "date": "10 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/news3/400/225",
                "summary": "Las claves del nuevo marco legal que se debate en el Congreso para garantizar el libre ejercicio de la profesión.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "El proyecto busca reforzar la inmunidad legal frente a presiones para revelar fuentes y sancionar ataques a reporteros en terreno."}
                ])
            },
            {
                "title": "Periodismo de Soluciones: Informando más allá del Problema",
                "category": "Tendencias",
                "author": "Valentina Camus",
                "date": "8 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/news4/400/225",
                "summary": "Cómo los enfoques constructivos en la reportería están generando mayor impacto cívico y mejor interacción.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "Lejos de ser relaciones públicas o noticias felices, el periodismo de soluciones investiga rigurosamente respuestas a problemas sociales."}
                ])
            }
        ]
        for a in articles:
            db.session.add(NewsArticle(**a))

        press_releases = [
            {
                "author_user_id": 1,
                "title": "Gobierno Regional Lanza Nueva Plataforma de Transparencia Activa",
                "institution": "Gobierno Regional Metropolitano",
                "author": "Comunicaciones GORE",
                "date": "20 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/pr1/400/225",
                "summary": "La nueva herramienta digital busca acercar la gestión de recursos públicos a la ciudadanía con datos abiertos.",
                "report_author": "Equipo GORE",
                "report_date": "20 de Julio, 2024",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "El Gobierno Regional Metropolitano ha dado un paso significativo hacia la modernización institucional al presentar su nuevo portal de rendición de cuentas."},
                    {"type": "quote", "text": "La confianza de la ciudadanía se construye con hechos y acceso irrestricto a los datos.", "author": "Gobernador Regional"},
                    {"type": "paragraph", "text": "El portal incluye visualizadores de ejecución presupuestaria por comuna y estado de avance de proyectos de infraestructura."}
                ])
            },
            {
                "author_user_id": 1,
                "title": "Start-Up Chile Abre Convocatoria para su Generación 2024",
                "institution": "CORFO",
                "author": "Prensa CORFO",
                "date": "19 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/pr2/400/225",
                "summary": "El programa busca atraer a los mejores emprendimientos tecnológicos de Latinoamérica con fondos de hasta $50 millones.",
                "report_author": "Prensa CORFO",
                "report_date": "19 de Julio, 2024",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "La aceleradora pública de CORFO abrió postulaciones para sus programas Build, Ignite y Growth."}
                ])
            },
            {
                "author_user_id": 2,
                "title": "Museo de la Memoria Inaugura Exposición 'La Tinta no se Borra'",
                "institution": "Museo de la Memoria",
                "author": "Cultura y Prensa MMDH",
                "date": "18 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/pr3/400/225",
                "summary": "La muestra recorre la historia de los medios clandestinos e independientes durante las décadas de los 70 y 80.",
                "report_author": "Cultura MMDH",
                "report_date": "18 de Julio, 2024",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "Con más de un centenar de ejemplares originales, panfletos y fotografías de época, la exposición rinde tributo a los reporteros que mantuvieron viva la verdad."}
                ])
            },
            {
                "author_user_id": 1,
                "title": "Festival de Innovación Social fiiS 2024 Reúne a Creadores de Contenido",
                "institution": "Festival fiiS",
                "author": "Equipo fiiS",
                "date": "17 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/pr4/400/225",
                "summary": "Líderes de opinión, periodistas y activistas se darán cita para debatir el rol de la comunicación en la sostenibilidad.",
                "report_author": "Equipo fiiS",
                "report_date": "17 de Julio, 2024",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "El festival contará con charlas magistrales, talleres prácticos de narrativa digital y espacios de networking."}
                ])
            },
            {
                "author_user_id": 2,
                "title": "Informe Revela Brecha Digital en Zonas Rurales de Chile",
                "institution": "Fundación Datos Protegidos",
                "author": "Comunicaciones FDP",
                "date": "16 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/pr5/400/225",
                "summary": "El estudio revela que un 30% de las escuelas rurales carece de conectividad adecuada para fines pedagógicos.",
                "report_author": "Comunicaciones FDP",
                "report_date": "16 de Julio, 2024",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "El informe exhorta a las autoridades del sector telecomunicaciones a acelerar los proyectos de última milla."}
                ])
            }
        ]
        for pr in press_releases:
            db.session.add(PressRelease(**pr))

        # =====================================================================
        # 5. SPRINT 2 (PARCIAL): OPORTUNIDADES, FOTOPERIODISMO, FUENTES Y TALENTO
        # =====================================================================
        jobs_data = [
            {"title": "Periodista de Investigación", "company": "CIPER Chile", "location": "Santiago", "type": "Completo", "area": "Prensa", "date": "Hace 2 días", "logo_url": "https://picsum.photos/seed/logo1/100/100", "description": "Buscamos a un periodista riguroso y apasionado por la investigación para unirse a nuestro equipo.", "apply_email": "postulaciones@ciperchile.cl"},
            {"title": "Productor Periodístico Matinal", "company": "Canal 13", "location": "Santiago", "type": "Completo", "area": "TV", "date": "Hace 5 días", "logo_url": "https://picsum.photos/seed/logo2/100/100", "description": "El matinal 'Tu Día' busca un productor periodístico con capacidad para proponer temas ciudadanos de alto interés.", "apply_email": "talento@canal13.cl"},
            {"title": "Redactor de Contenidos Web (Freelance)", "company": "Agencia Digital XYZ", "location": "Remoto", "type": "Freelance", "area": "Digital", "date": "Hace 1 semana", "logo_url": "https://picsum.photos/seed/logo3/100/100", "description": "Necesitamos un redactor freelance con experiencia en SEO y optimización editorial.", "apply_email": "contacto@agenciaxyz.com"},
            {"title": "Periodista Deportivo", "company": "Radio Cooperativa", "location": "Santiago", "type": "Parcial", "area": "Radio", "date": "Hace 1 semana", "logo_url": "https://picsum.photos/seed/logo4/100/100", "description": "Se busca periodista para cobertura de eventos deportivos los fines de semana en transmisiones radiales.", "apply_email": "deportes@cooperativa.cl"},
            {"title": "Community Manager de Prensa", "company": "El Diario de Valparaíso", "location": "Valparaíso", "type": "Completo", "area": "Digital", "date": "Hace 10 días", "logo_url": "https://picsum.photos/seed/logo5/100/100", "description": "Responsable de gestionar las redes sociales del diario y optimizar la distribución de noticias.", "apply_email": "rrhh@diariovalparaiso.cl"},
            {"title": "Editor de Contenido Digital", "company": "La Lupa Media", "location": "Remoto", "type": "Completo", "area": "Digital", "date": "Hace 12 días", "logo_url": "https://picsum.photos/seed/logo6/100/100", "description": "Micromedio digital busca editor/a para liderar la pauta diaria de temas de medio ambiente e innovación.", "apply_email": "hola@lalupamedia.com"},
            {"title": "Periodista de Datos (Junior)", "company": "Observatorio Fiscal", "location": "Santiago", "type": "Parcial", "area": "Prensa", "date": "Hace 2 semanas", "logo_url": "https://picsum.photos/seed/logo7/100/100", "description": "Buscamos un periodista recién egresado con interés en bases de datos, visualización y compras públicas.", "apply_email": "talento@observatoriofiscal.cl"}
        ]
        for j in jobs_data:
            db.session.add(Job(**j))

        collabs = [
            {"author_user_id": 1, "title": "Periodista para cubrir seminario internacional", "deadline": "Postular antes del 30/07", "budget": "$150.000 CLP", "author": "Agencia Comms", "whatsapp_contact": "56911223344"},
            {"author_user_id": 2, "title": "Redactor para serie de 5 notas de innovación", "deadline": "Entrega en 1 semana", "budget": "$200.000 CLP", "author": "ONG Verde Chile", "whatsapp_contact": "56922334455"}
        ]
        for col in collabs:
            db.session.add(ShortCollaboration(**col))

        photos = [
            {
                "user_id": 5,
                "title": "El Espejo Roto de Aculeo",
                "image_url": "https://picsum.photos/seed/photojournalism1/800/450",
                "caption": "La sequía avanza implacable en la zona central dejando al descubierto las grietas del lecho lacustre.",
                "photographer_name": "Ignacio Paredes",
                "photographer_avatar_url": "https://i.pravatar.cc/40?u=ignacio",
                "date_taken": "15 de Julio, 2024",
                "whatsapp_contact": "56987654321",
                "date_added": datetime(2024, 7, 26)
            },
            {
                "user_id": 5,
                "title": "Murales que Hablan en Valparaíso",
                "image_url": "https://picsum.photos/seed/photojournalism2/800/450",
                "caption": "Un muralista da los toques finales a su obra en los cerros porteños, rescatando la identidad popular.",
                "photographer_name": "Javiera Latorre",
                "photographer_avatar_url": "https://i.pravatar.cc/40?u=javiera",
                "date_taken": "20 de Julio, 2024",
                "whatsapp_contact": "56944445555",
                "date_added": datetime(2024, 7, 25)
            }
        ]
        for p in photos:
            db.session.add(PhotojournalismPost(**p))

        shareable = [
            {
                "user_id": 5,
                "image_url": "https://picsum.photos/seed/gallery1/600/400",
                "original_image_url": "https://picsum.photos/seed/gallery1/600/400",
                "watermarked_image_url": "https://picsum.photos/seed/gallery1/600/400",
                "price": "$15.000 CLP",
                "is_sold": False,
                "caption": "Protestas ciudadanas en Plaza Baquedano.",
                "photographer_name": "Javiera Latorre",
                "keywords": ["protesta", "santiago", "ciudad"],
                "date_added": "2024-07-26",
                "text_color": "#FFFFFF"
            },
            {
                "user_id": 5,
                "image_url": "https://picsum.photos/seed/gallery2/600/400",
                "original_image_url": "https://picsum.photos/seed/gallery2/600/400",
                "watermarked_image_url": "https://picsum.photos/seed/gallery2/600/400",
                "price": "$25.000 CLP",
                "is_sold": False,
                "caption": "Combate al incendio forestal en la precordillera.",
                "photographer_name": "Ignacio Paredes",
                "keywords": ["incendio", "bomberos", "emergencia"],
                "date_added": "2024-07-25",
                "text_color": "#FFFFFF"
            }
        ]
        for sh in shareable:
            db.session.add(ShareablePhoto(**sh))

        specialists = [
            {"name": "Dra. Carolina Vera", "title": "Climatóloga, U. de Chile", "image_url": "https://picsum.photos/seed/spec1/400/400", "specialty_description": "Experta en cambio climático, recursos hídricos y sequía en Chile.", "whatsapp_contact": "56911112222", "date_added": date(2024, 7, 25), "text_color": "#FFFFFF"},
            {"name": "Marcos Sánchez", "title": "Analista Económico Senior", "image_url": "https://picsum.photos/seed/spec2/400/400", "specialty_description": "Especialista en macroeconomía, inflación, tasas de interés y mercado laboral.", "whatsapp_contact": "56922223333", "date_added": date(2024, 7, 24), "text_color": "#FFFFFF"},
            {"name": "Ricardo Núñez", "title": "Experto en Ciberseguridad", "image_url": "https://picsum.photos/seed/spec4/400/400", "specialty_description": "Analiza tendencias en ciberataques, privacidad de datos y protección digital.", "whatsapp_contact": "56944445555", "date_added": date(2024, 7, 22), "text_color": "#FFFFFF"}
        ]
        for sp in specialists:
            db.session.add(Specialist(**sp))

        talents = [
            {"user_id": 5, "name": "Juan Premium", "title": "Periodista de Investigación Senior", "skills": ["Investigación Corrupción", "Data Mining", "Reporteo Local"], "availability": "Remoto", "region": "Valparaíso", "expected_salary": "$2.200.000 CLP", "experience_years": 12, "avatar_url": "https://i.pravatar.cc/150?u=4"},
            {"user_id": 6, "name": "Pedro Gratis", "title": "Redactor Junior", "skills": ["SEO", "Redacción Creativa", "Redes Sociales"], "availability": "Híbrido", "region": "Biobío", "expected_salary": "$800.000 CLP", "experience_years": 2, "avatar_url": "https://i.pravatar.cc/150?u=5"},
            {"name": "Javiera Latorre", "title": "Periodista de Datos (Demo)", "skills": ["Análisis de Datos", "Python", "Flourish"], "availability": "Remoto", "region": "Metropolitana", "expected_salary": "$1.500.000 CLP", "experience_years": 5, "avatar_url": "https://i.pravatar.cc/150?u=10"}
        ]
        for tp in talents:
            db.session.add(TalentProfile(**tp))

        sponsors = [
            {
                "name": "Tech Solutions",
                "tagline": "Impulsando la transformación digital de las comunicaciones",
                "image_url": "https://picsum.photos/seed/premium1/1200/800",
                "cta_text": "Descubre Nuestras Herramientas",
                "cta_link": "#",
                "name_color": "#FFFFFF",
                "cta_color": "#FFC300",
                "report_author": "Equipo Tech Solutions",
                "report_date": "25 de Julio, 2024",
                "report_content": json.dumps([{"type": "paragraph", "text": "En Tech Solutions creemos que el futuro del periodismo radica en la tecnología aplicada con sentido ético."}])
            },
            {
                "user_id": 3,
                "name": "Banco Futuro",
                "tagline": "La banca para los profesionales que innovan",
                "image_url": "https://picsum.photos/seed/premium2/500/300",
                "cta_text": "Conoce nuestros planes",
                "cta_link": "#",
                "name_color": "#FFFFFF",
                "cta_color": "#FFC300",
                "report_author": "Daniela Vega",
                "report_date": "24 de Julio, 2024",
                "report_content": json.dumps([{"type": "paragraph", "text": "Banco Futuro ofrece soluciones de financiamiento diseñadas para emprendimientos independientes."}])
            },
            {
                "user_id": 4,
                "name": "Innovate Latam",
                "tagline": "Conectando startups y medios con el mundo",
                "image_url": "https://picsum.photos/seed/premium3/500/300",
                "cta_text": "Únete al ecosistema",
                "cta_link": "#",
                "name_color": "#FFFFFF",
                "cta_color": "#FFC300"
            }
        ]
        for sp in sponsors:
            db.session.add(PremiumSponsor(**sp))

        services = [
            {"service": "Gestión de Redes Sociales para Medios", "provider": "Laura Valdés", "category": "Marketing", "image_url": "https://picsum.photos/seed/freelance4/400/225", "description": "Estrategias de crecimiento de comunidad y distribución orgánica de contenido en plataformas digitales.", "linkedin_url": "https://www.linkedin.com/in/laura-valdes-ejemplo"},
            {"service": "Edición de Video en Premiere Pro", "provider": "Carlos Mena", "category": "Audiovisual", "image_url": "https://picsum.photos/seed/freelance5/400/225", "description": "Edición rápida de notas informativas, entrevistas y micro-documentales para plataformas sociales.", "linkedin_url": "https://www.linkedin.com/in/carlos-mena-ejemplo"},
            {"service": "Traducción de Artículos Inglés-Español", "provider": "Sofia Castillo", "category": "Traducción", "image_url": "https://picsum.photos/seed/freelance6/400/225", "description": "Traductora periodística bilingüe orientada a coyuntura internacional y reportajes de investigación.", "linkedin_url": "https://www.linkedin.com/in/sofia-castillo-ejemplo"}
        ]
        for s in services:
            db.session.add(FreelanceService(**s))

        c_posts = [
            {"author_name": "Javiera Latorre", "author_avatar_url": "https://i.pravatar.cc/40?u=javiera", "post_title": "The Guardian launches new paid-for ‘digital experience’", "comment": "Interesante evolución del modelo de suscripción británica hacia formatos por app.", "post_url": "https://www.theguardian.com"},
            {"author_name": "Ricardo Núñez", "author_avatar_url": "https://i.pravatar.cc/40?u=ricardo", "post_title": "How Axios is using AI to streamline editorial workflows", "comment": "El uso prudente de IA para optimizar la redacción sin sustituir el criterio humano.", "post_url": "https://www.axios.com"},
            {"author_name": "Carolina Soto", "author_avatar_url": "https://i.pravatar.cc/40?u=carolina", "post_title": "SembraMedia report on Latin American digital native media", "comment": "Datos fundamentales sobre la resiliencia económica de los medios independientes.", "post_url": "https://sembramedia.org"}
        ]
        for cp in c_posts:
            db.session.add(CommunityPost(**cp))

        db.session.commit()
        print(">>> Proceso finalizado. Base de datos inicializada y sembrada con éxito.")


if __name__ == '__main__':
    create_db()
