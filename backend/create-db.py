import os
import json
from datetime import datetime, date
from app import create_app
from app.extensions import db
from werkzeug.security import generate_password_hash
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

def create_db():
    os.makedirs(os.path.join(os.path.dirname(__file__), 'instance'), exist_ok=True)
    app = create_app()
    with app.app_context():
        print("WARNING: Se eliminaran todas las tablas y datos existentes.")
        print(">>> Eliminando base de datos actual...")
        db.drop_all()
        
        print(">>> Creando esquema de base de datos...")
        db.create_all()
        
        print(">>> Iniciando poblacion de datos de prueba...")

        # --- ROLES ---
        roles_data = [
            {"name": "Administrador", "description": "Control total del sitio, portada, secciones editoriales, avisos laborales y moderación."},
            {"name": "Cliente", "description": "Empresa con acceso estricto a editar el bloque Confían en CiPress. Max 3."},
            {"name": "Colaborador Premium", "description": "Colaborador con acceso a Dashboard, Home Prime Time (08:00 a 12:00) y duración de 3 hrs."},
            {"name": "Colaborador Gratis", "description": "Publica gratis pero su visualización en Home es nocturna, rotativa o backup."},
            {"name": "Empresa", "description": "Publica contenidos pagados (noticias auspiciadas, avisos comerciales)."}
        ]
        
        for r_data in roles_data:
            db.session.add(Role(**r_data))
        
        db.session.commit() # Commit roles first to be safe

        # --- USUARIOS ---
        password_123 = generate_password_hash("123")

        users_to_create = [
            # Administradores
            {"first_name": "Ana", "last_name": "Sanz", "email": "ana@administrador.cl", "role": "Administrador", "region": "Metropolitana de Santiago"},
            
            # Cliente 
            {"first_name": "Cliente", "last_name": "Test", "email": "vip@cliente.com", "role": "Cliente", "region": "Metropolitana de Santiago"},

            # Empresa
            {"first_name": "Empresa", "last_name": "Test", "email": "ely@empresa.cl", "role": "Empresa", "region": "Metropolitana de Santiago"},

            # Premium
            {"first_name": "Juan", "last_name": "Premium", "email": "premium@colab.com", "role": "Colaborador Premium", "region": "Valparaíso"},

            # Gratis
            {"first_name": "Pedro", "last_name": "Gratis", "email": "gratis@colab.com", "role": "Colaborador Gratis", "region": "Biobío"},
        ]

        for u_data in users_to_create:
            db.session.add(User(
                first_name=u_data["first_name"],
                last_name=u_data["last_name"],
                email=u_data["email"],
                role=u_data["role"],
                region=u_data["region"],
                password_hash=password_123
            ))

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

        # --- COURSES ---
        courses_data = [
            {
                "title": "Periodismo de Datos: De Cero a Experto",
                "category": "Periodismo de Datos",
                "level": "Básico",
                "format": "Video",
                "cost": "$45.000 CLP",
                "rating": 4.9,
                "review_count": 123,
                "image_url": "https://picsum.photos/seed/course1/1200/800",
                "description": "Sumérgete en el mundo del periodismo de datos y aprende a encontrar, analizar y visualizar información para contar historias de alto impacto.",
                "instructor_name": "Isidora Paz",
                "instructor_title": "Periodista de Datos, La Pública",
                "instructor_avatar_url": "https://i.pravatar.cc/80?u=isidora",
                "duration": "6 Semanas",
                "topics": json.dumps([
                    "Introducción al Periodismo de Datos y la mentalidad de datos.",
                    "Técnicas de Web Scraping y uso de APIs.",
                    "Limpieza y análisis de datos con Hojas de Cálculo y Python.",
                    "Visualización de datos efectiva con Flourish y Datawrapper.",
                    "Narrativa y Storytelling con datos.",
                    "Ética y responsabilidad en el manejo de datos."
                ]),
                "enrollment_start_date": "2024-07-01",
                "enrollment_end_date": "2024-07-31",
                "course_start_date": "2024-08-05",
                "course_end_date": "2024-09-13",
                "access_link": "#"
            },
            {
                "title": "SEO para Medios: Posiciona tus Noticias",
                "category": "SEO",
                "level": "Intermedio",
                "format": "Video",
                "cost": "$60.000 CLP",
                "rating": 4.8,
                "review_count": 98,
                "image_url": "https://picsum.photos/seed/course2/1200/800",
                "description": "Domina las técnicas de optimización para motores de búsqueda (SEO) aplicadas específicamente a medios de comunicación.",
                "instructor_name": "Javier Fuentes",
                "instructor_title": "Consultor SEO para Medios",
                "instructor_avatar_url": "https://i.pravatar.cc/80?u=javier",
                "duration": "8 Semanas",
                "topics": json.dumps([
                    "Fundamentos de SEO: Rastreo, Indexación y Ranking.",
                    "Investigación de Palabras Clave (Keywords) para noticias.",
                    "SEO On-Page para artículos periodísticos.",
                    "Optimización Técnica: Velocidad de carga, datos estructurados.",
                    "Estrategias de Link Building para medios.",
                    "Google News, Discover y otras plataformas de Google."
                ]),
                "enrollment_start_date": "2024-07-15",
                "enrollment_end_date": "2024-08-15",
                "course_start_date": "2024-08-19",
                "course_end_date": "2024-10-11",
                "access_link": "#"
            },
            {
                "title": "Crea tu Podcast Informativo Desde Cero",
                "category": "Podcast",
                "level": "Básico",
                "format": "Webinar",
                "cost": "Gratis",
                "rating": 4.7,
                "review_count": 250,
                "image_url": "https://picsum.photos/seed/course3/1200/800",
                "description": "Descubre el poder del formato audio. Este curso práctico te guiará paso a paso en la creación, producción, y distribución de tu propio podcast informativo.",
                "instructor_name": "Carolina Soto",
                "instructor_title": "Productora de Podcast, Relatos del Sur",
                "instructor_avatar_url": "https://i.pravatar.cc/80?u=carolina",
                "duration": "4 Webinars en vivo",
                "topics": json.dumps([
                    "Definiendo tu nicho y formato de podcast.",
                    "Equipamiento y software para grabar y editar.",
                    "Técnicas de guion y entrevista para audio.",
                    "Edición, mezcla y diseño de sonido.",
                    "Estrategias de distribución y monetización."
                ]),
                "enrollment_start_date": "2024-08-01",
                "enrollment_end_date": "2024-08-20",
                "course_start_date": "2024-08-22",
                "course_end_date": "2024-09-12",
                "access_link": "#"
            },
            # ... Otros cursos omitidos por brevedad pero estructura lista
        ]
        for c in courses_data:
            db.session.add(Course(**c))

        # --- JOBS ---
        jobs_data = [
            {"title": "Periodista de Investigación", "company": "CIPER Chile", "location": "Santiago", "type": "Completo", "area": "Prensa", "date": "Hace 2 días", "logo_url": "https://picsum.photos/seed/logo1/100/100", "description": "Buscamos a un periodista riguroso y apasionado por la investigación para unirse a nuestro equipo.", "apply_email": "postulaciones@ciperchile.cl"},
            {"title": "Productor Periodístico Matinal", "company": "Canal 13", "location": "Santiago", "type": "Completo", "area": "TV", "date": "Hace 5 días", "logo_url": "https://picsum.photos/seed/logo2/100/100", "description": "El matinal 'Tu Día' busca un productor periodístico con capacidad para proponer temas.", "apply_email": "talento@canal13.cl"},
            {"title": "Redactor de Contenidos Web (Freelance)", "company": "Agencia Digital XYZ", "location": "Remoto", "type": "Freelance", "area": "Digital", "date": "Hace 1 semana", "logo_url": "https://picsum.photos/seed/logo3/100/100", "description": "Necesitamos un redactor freelance con experiencia en SEO.", "apply_email": "contacto@agenciaxyz.com"},
            {"title": "Periodista Deportivo", "company": "Radio Cooperativa", "location": "Santiago", "type": "Parcial", "area": "Radio", "date": "Hace 1 semana", "logo_url": "https://picsum.photos/seed/logo4/100/100", "description": "Se busca periodista para cobertura de eventos deportivos los fines de semana.", "apply_email": "deportes@cooperativa.cl"},
            {"title": "Community Manager", "company": "El Diario de Valparaíso", "location": "Valparaíso", "type": "Completo", "area": "Digital", "date": "Hace 10 días", "logo_url": "https://picsum.photos/seed/logo5/100/100", "description": "Responsable de gestionar las redes sociales del diario.", "apply_email": "rrhh@diariovalparaiso.cl"},
            {"title": "Editor de Contenido Digital", "company": "La Lupa Media", "location": "Remoto", "type": "Completo", "area": "Digital", "date": "Hace 12 días", "logo_url": "https://picsum.photos/seed/logo6/100/100", "description": "Micromedio digital busca editor/a.", "apply_email": "hola@lalupamedia.com"},
            {"title": "Periodista de Datos (Junior)", "company": "Observatorio Fiscal", "location": "Santiago", "type": "Parcial", "area": "Prensa", "date": "Hace 2 semanas", "logo_url": "https://picsum.photos/seed/logo7/100/100", "description": "Buscamos un periodista recién egresado con interés en datos.", "apply_email": "talento@observatoriofiscal.cl"}
        ]
        for j in jobs_data:
            db.session.add(Job(**j))

        # --- ENTREPRENEURSHIP ---
        ents = [
            {
                "name": "Redacción de Artículos SEO", "type": "Agencia", "founder": "Equipo Central", "location": "Santiago",
                "specialty": "Redacción", "image_url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                "description": "Contenido optimizado para posicionar tu marca en buscadores de forma orgánica.",
                "portfolio_url": "#", "rating": 4.8, "review_count": 22
            },
            {
                "name": "Corrección de Estilo Académico", "type": "Corrección", "founder": "María Inés", "location": "Remoto", 
                "specialty": "Edición", "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead27d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", 
                "description": "Garantizamos claridad y coherencia en tus textos académicos y profesionales.",
                "portfolio_url": "#", "rating": 4.9, "review_count": 15
            },
            {
                "name": "Fotografía de Eventos Corporativos", "type": "Productora", "founder": "Estudio Luz", "location": "Concepción", 
                "specialty": "Fotografía", "image_url": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", 
                "description": "Capturamos los momentos clave de tus eventos para destacar la imagen de tu empresa.",
                "portfolio_url": "#", "rating": 5.0, "review_count": 31
            }
        ]
        for e in ents:
            db.session.add(Entrepreneurship(**e))

        # --- NEWS ARTICLES ---
        articles = [
            {
                "title": "La IA Generativa y su Impacto en las Salas de Redacción Chilenas",
                "category": "Tecnología", "author": "Equipo Editorial", "date": "15 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/news1/400/225",
                "summary": "Un análisis profundo sobre cómo herramientas como Gemini y ChatGPT están transformando la producción de noticias.",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "La inteligencia artificial generativa ha irrumpido en las salas de redacción..."},
                    {"type": "quote", "text": "La IA no es una amenaza para el periodismo, sino una oportunidad.", "author": "Directora de Innovación"}
                ])
            },
            {"title": "Nuevos Modelos de Suscripción Ganan Terreno", "category": "Industria", "author": "Isidora Paz", "date": "12 de Julio, 2024", "image_url": "https://picsum.photos/seed/news2/400/225", "summary": "Exploramos casos de éxito de medios chilenos."},
            {"title": "Avanza Proyecto de Ley sobre Protección a Periodistas", "category": "Legislación", "author": "Tomás Reyes", "date": "10 de Julio, 2024", "image_url": "https://picsum.photos/seed/news3/400/225", "summary": "Las claves del nuevo marco legal."},
            {"title": "Periodismo de Soluciones: Informando más allá del Problema", "category": "Tendencias", "author": "Valentina Camus", "date": "8 de Julio, 2024", "image_url": "https://picsum.photos/seed/news4/400/225", "summary": "Cómo los enfoques constructivos en la reportería están generando mayor impacto."}
        ]
        for a in articles:
            db.session.add(NewsArticle(**a))

        # --- PRESS RELEASES ---
        prs = [
            {
                "author_user_id": 1,
                "title": "Gobierno Regional Lanza Nueva Plataforma de Transparencia Activa",
                "institution": "Gobierno Regional Metropolitano", "author": "Comunicaciones GORE", "date": "20 de Julio, 2024",
                "image_url": "https://picsum.photos/seed/pr1/400/225",
                "summary": "La nueva herramienta digital busca acercar la gestión pública a la ciudadanía.",
                "report_author": "Equipo GORE", "report_date": "20 de Julio, 2024",
                "report_content": json.dumps([
                    {"type": "paragraph", "text": "El Gobierno Regional Metropolitano ha dado un paso significativo..."},
                    {"type": "quote", "text": "La confianza de la ciudadanía se construye con hechos.", "author": "Gobernador Regional"}
                ])
            },
            {"title": "Start-Up Chile Abre Convocatoria para su Generación 2024", "institution": "CORFO", "author": "Prensa CORFO", "date": "19 de Julio, 2024", "image_url": "https://picsum.photos/seed/pr2/400/225", "summary": "El programa busca atraer a los mejores emprendimientos tecnológicos."},
            {"title": "Museo de la Memoria Inaugura Exposición", "institution": "Museo de la Memoria", "author": "Cultura y Prensa MMDH", "date": "18 de Julio, 2024", "image_url": "https://picsum.photos/seed/pr3/400/225", "summary": "La muestra 'La Tinta no se Borra' recorre la historia de los medios."},
            {"title": "Festival de Innovación Social fiiS 2024", "institution": "Festival fiiS", "author": "Equipo fiiS", "date": "17 de Julio, 2024", "image_url": "https://picsum.photos/seed/pr4/400/225", "summary": "Líderes de opinión se darán cita en el evento."},
            {"title": "Informe sobre brecha digital en Chile", "institution": "Fundación Datos Protegidos", "author": "Comunicaciones FDP", "date": "16 de Julio, 2024", "image_url": "https://picsum.photos/seed/pr5/400/225", "summary": "El estudio revela que un 30% de los hogares rurales no tiene acceso a internet."}
        ]
        for pr in prs:
            db.session.add(PressRelease(**pr))

        # --- NGO SPOTLIGHT ---
        ngos = [
            {"title": "Reportaje sobre Acceso al Agua", "institution": "Fundación Terram", "author": "Difundido por Sofía Muñoz", "date_published": "22 de Julio, 2024", "image_url": "https://picsum.photos/seed/ngo1/400/225", "summary": "La investigación revela el impacto de la agroindustria."},
            {"title": "Plataforma 'Congreso Abierto'", "institution": "Ciudadanía Inteligente", "author": "Liderado por Javier Fuentes", "date_published": "21 de Julio, 2024", "image_url": "https://picsum.photos/seed/ngo2/400/225", "summary": "Busca aumentar la transparencia del poder legislativo."},
            {"title": "Talleres de Periodismo", "institution": "Comunica Derechos", "author": "Liderado por Andrea López", "date_published": "20 de Julio, 2024", "image_url": "https://picsum.photos/seed/ngo3/400/225", "summary": "Entrega herramientas de comunicación a dirigentes vecinales."},
            {"title": "Documental 'Memorias del Mar'", "institution": "Oceana Chile", "author": "Difundido por Ricardo Núñez", "date_published": "19 de Julio, 2024", "image_url": "https://picsum.photos/seed/ngo4/400/225", "summary": "Muestra los desafíos de la pesca sostenible."}
        ]
        for n in ngos:
            db.session.add(NgoSpotlight(**n))

        # --- FREELANCE SERVICES ---
        services = [
            {"service": "Gestión de Redes Sociales para Medios", "provider": "Laura Valdés", "category": "Marketing", "image_url": "https://picsum.photos/seed/freelance4/400/225", "description": "Estrategias de crecimiento de comunidad y distribución de contenido en plataformas digitales.", "linkedin_url": "https://www.linkedin.com/in/laura-valdes-ejemplo"},
            {"service": "Edición de Video en Premiere Pro", "provider": "Carlos Mena", "category": "Audiovisual", "image_url": "https://picsum.photos/seed/freelance5/400/225", "description": "Edición rápida de notas informativas, entrevistas y mini-documentales para plataformas sociales.", "linkedin_url": "https://www.linkedin.com/in/carlos-mena-ejemplo"},
            {"service": "Traducción de Artículos Inglés-Español", "provider": "Sofia Castillo", "category": "Traducción", "image_url": "https://picsum.photos/seed/freelance6/400/225", "description": "Traductora periodística bilingüe orientada a coyuntura internacional y reportajes de investigación.", "linkedin_url": "https://www.linkedin.com/in/sofia-castillo-ejemplo"}
        ]
        for s in services:
            db.session.add(FreelanceService(**s))

        # --- PREMIUM SPONSORS ---
        sponsors = [
            {
                "name": "Tech Solutions", "tagline": "Impulsando la transformación digital", "image_url": "https://picsum.photos/seed/premium1/1200/800",
                "cta_text": "Descubre Nuestras Herramientas", "cta_link": "#", "name_color": "#FFFFFF", "cta_color": "#FFC300",
                "report_author": "Equipo Tech Solutions", "report_date": "25 de Julio, 2024",
                "report_content": json.dumps([{"type": "paragraph", "text": "En Tech Solutions creemos que el futuro del periodismo es digital..."}])
            },
            {
                "user_id": 5,
                "name": "Cliente Prueba", "tagline": "La banca para los que innovan", "image_url": "https://picsum.photos/seed/premium2/500/300",
                "cta_text": "Conoce nuestros planes", "cta_link": "#", "name_color": "#FFFFFF", "cta_color": "#FFC300",
                "report_author": "Daniela Vega", "report_date": "24 de Julio, 2024",
                "report_content": json.dumps([{"type": "paragraph", "text": "Banco Futuro se establece como el aliado financiero..."}])
            },
            {
                "user_id": 6,
                "name": "Innovate Latam", "tagline": "Conectando startups con el mundo", "image_url": "https://picsum.photos/seed/premium3/500/300", "cta_text": "Únete al ecosistema", "cta_link": "#", "name_color": "#FFFFFF", "cta_color": "#FFC300"
            }
        ]
        for sp in sponsors:
            db.session.add(PremiumSponsor(**sp))

        # --- PROMO VIDEOS ---
        videos = [
            {"title": "Por qué unirte al Círculo", "description": "Descubre los beneficios.", "thumbnail_url": "https://picsum.photos/seed/video1/400/225"},
            {"title": "La Voz de la Industria", "description": "Líderes de opinión opinan.", "thumbnail_url": "https://picsum.photos/seed/video2/400/225"}
        ]
        for v in videos:
            db.session.add(PromoVideo(**v))

        # --- COMMUNITY POSTS ---
        c_posts = [
            {"author_name": "Javiera Latorre", "author_avatar_url": "https://i.pravatar.cc/40?u=javiera", "post_title": "The Guardian launches new paid-for ‘digital experience’", "comment": "Interesante el nuevo modelo...", "post_url": "#"},
            {"author_name": "Ricardo Núñez", "author_avatar_url": "https://i.pravatar.cc/40?u=ricardo", "post_title": "How Axios is using AI", "comment": "El uso de IA para potenciar el periodismo...", "post_url": "#"},
            {"author_name": "Carolina Soto", "author_avatar_url": "https://i.pravatar.cc/40?u=carolina", "post_title": "SembraMedia report on digital media", "comment": "El último reporte de SembraMedia tiene datos muy relevantes.", "post_url": "#"}
        ]
        for cp in c_posts:
            db.session.add(CommunityPost(**cp))

        # --- PHOTOJOURNALISM ---
        photos = [
            {
                "user_id": 3,
                "title": "El Espejo Roto de Aculeo",
                "image_url": "https://picsum.photos/seed/photojournalism1/800/450",
                "caption": "La sequía avanza implacable en la zona central...",
                "photographer_name": "Ignacio Paredes",
                "photographer_avatar_url": "https://i.pravatar.cc/40?u=ignacio",
                "date_taken": "15 de Julio, 2024",
                "whatsapp_contact": "56987654321",
                "date_added": datetime(2024, 7, 26)
            },
            {
                "user_id": 3,
                "title": "Murales que Hablan en Valparaíso",
                "image_url": "https://picsum.photos/seed/photojournalism2/800/450",
                "caption": "Un muralista da los toques finales a su obra...",
                "photographer_name": "Javiera Latorre",
                "photographer_avatar_url": "https://i.pravatar.cc/40?u=javiera",
                "date_taken": "20 de Julio, 2024",
                "whatsapp_contact": "56944445555",
                "date_added": datetime(2024, 7, 25)
            }
        ]
        for p in photos:
            db.session.add(PhotojournalismPost(**p))

        # --- SPECIALISTS ---
        specialists = [
            {"name": "Dra. Carolina Vera", "title": "Climatóloga, U. de Chile", "image_url": "https://picsum.photos/seed/spec1/400/400", "specialty_description": "Experta en cambio climático.", "whatsapp_contact": "56911112222", "date_added": date(2024, 7, 25), "text_color": "#FFFFFF"},
            {"name": "Marcos Sánchez", "title": "Analista Económico Senior", "image_url": "https://picsum.photos/seed/spec2/400/400", "specialty_description": "Especialista en macroeconomía.", "whatsapp_contact": "56922223333", "date_added": date(2024, 7, 24), "text_color": "#FFFFFF"},
            {"name": "Ricardo Núñez", "title": "Experto en Ciberseguridad", "image_url": "https://picsum.photos/seed/spec4/400/400", "specialty_description": "Analiza tendencias en ciberataques.", "whatsapp_contact": "56944445555", "date_added": date(2024, 7, 22), "text_color": "#FFFFFF"}
        ]
        for sp in specialists:
            db.session.add(Specialist(**sp))

        # --- SHAREABLE PHOTOS ---
        shareable = [
            {"user_id": 4, "image_url": "https://picsum.photos/seed/gallery1/600/400", "original_image_url": "https://picsum.photos/seed/gallery1/600/400", "watermarked_image_url": "https://picsum.photos/seed/gallery1/600/400", "price": "$15.000 CLP", "is_sold": False, "caption": "Protestas ciudadanas en Plaza Italia.", "photographer_name": "Javiera Latorre", "keywords": json.dumps(["protesta", "santiago"]), "date_added": "2024-07-26", "text_color": "#FFFFFF"},
            {"user_id": 4, "image_url": "https://picsum.photos/seed/gallery2/600/400", "original_image_url": "https://picsum.photos/seed/gallery2/600/400", "watermarked_image_url": "https://picsum.photos/seed/gallery2/600/400", "price": "$25.000 CLP", "is_sold": False, "caption": "Incendio forestal en Valparaíso.", "photographer_name": "Ignacio Paredes", "keywords": json.dumps(["incendio", "valparaiso"]), "date_added": "2024-07-25", "text_color": "#FFFFFF"}
        ]
        for sh in shareable:
            db.session.add(ShareablePhoto(**sh))

        # --- RESOURCES ---
        resources = [
            {"name": "Flourish", "category": "Visualización", "description": "Crea visualizaciones de datos sin código.", "link": "#", "type": "Herramienta"},
            {"name": "Otter.ai", "category": "Transcripción", "description": "Transcribe entrevistas automáticamente.", "link": "#", "type": "Software"},
            {"name": "Guía de Fact-Checking", "category": "Fact-Checking", "description": "Metodologías de verificación.", "link": "#", "type": "Guía"}
        ]
        for r in resources:
            db.session.add(Resource(**r))

        # --- FUNDING OPPORTUNITIES ---
        funding = [
            {"title": "Fondo de Apoyo a Medios Regionales", "organization": "Gobierno de Chile", "deadline": "31 de Agosto, 2024", "type": "Fondo", "link": "#"},
            {"title": "Beca de Periodismo de Investigación", "organization": "Fundación para la Prensa", "deadline": "15 de Septiembre, 2024", "type": "Beca", "link": "#"},
        ]
        for f in funding:
            db.session.add(FundingOpportunity(**f))

        # --- EVENTS ---
        events = [
            {"title": "Webinar: Cómo usar la IA", "date_display": "05 AGO", "full_date": "Lunes 05 de Agosto, 19:00 hrs.", "location": "Online", "type": "Webinar", "link": "#"},
            {"title": "Taller de Fotoperiodismo", "date_display": "17 AGO", "full_date": "Sábado 17 de Agosto, 10:00 hrs.", "location": "Santiago", "type": "Taller", "link": "#"},
        ]
        for ev in events:
            db.session.add(Event(**ev))

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
            {"question": "¿Puedo tomar una foto a cualquier persona?", "answer": "En lugares públicos, generalmente sí, si es contexto noticioso."},
        ]
        for lf in legal_faqs:
            db.session.add(LegalFAQ(**lf))

        # --- SHORT COLLABORATIONS ---
        collabs = [
            {"author_user_id": 1, "title": "Periodista para cubrir evento", "deadline": "Postular antes del 30/07", "budget": "$150.000 CLP", "author": "Agencia Comms", "whatsapp_contact": "56911223344"},
            {"author_user_id": 1, "title": "Redactor para 5 notas", "deadline": "Entrega en 1 semana", "budget": "$200.000 CLP", "author": "ONG Verde Chile", "whatsapp_contact": "56922334455"}
        ]
        for col in collabs:
            db.session.add(ShortCollaboration(**col))

        # --- ENTREPRENEURSHIP TIPS ---
        tips = [
            {"title": "Cómo Construir tu Marca Personal", "description": "Descubre las claves para posicionarte.", "expert_name": "Ana González", "thumbnail_url": "https://picsum.photos/seed/emprender-mundial-2/1200/600", "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
            {"title": "Los 3 Pilares para Monetizar", "description": "Aprende a construir un modelo de negocio.", "expert_name": "Javier Consuegra", "thumbnail_url": "https://picsum.photos/seed/emprender-mundial/1200/600", "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
        ]
        for t in tips:
            db.session.add(EntrepreneurshipTip(**t))

        # --- SPONSORED ADS ---
        sponsored = [
            {"image_url": "https://picsum.photos/seed/ad1/300/200", "title": "Transcripciones automáticas", "advertiser": "Verbo.AI", "cta_text": "Prueba Gratis", "cta_link": "#"},
            {"image_url": "https://picsum.photos/seed/ad2/300/200", "title": "Hosting rápido", "advertiser": "NubeVeloz", "cta_text": "Ver Planes", "cta_link": "#"}
        ]
        for sa in sponsored:
            db.session.add(SponsoredAd(**sa))

        # --- SPECIAL ADS ---
        special = [
            {"id": "legal", "title": "Asesoría Legal y Ética", "description": "Recurso gratuito para suscriptores.", "cta_text": "Consultar Beneficio"},
            {"id": "entrepreneurship", "title": "¿Quieres emprender?", "description": "Te asesoramos con iniciación de actividades.", "cta_text": "Saber Más"}
        ]
        for spa in special:
            db.session.add(SpecialAd(**spa))

        # --- PARTNER LOGOS ---
        partners = [
            {"name": "Colegio de Periodistas", "logo_url": "/assets/images/logo_colegio_periodistas_2021_web.png", "website_url": "https://www.colegiodeperiodistas.cl/"},
            {"name": "INMA", "logo_url": "/assets/images/inma-logo-test-01.svg", "website_url": "https://www.inma.org/"}
        ]
        for pl in partners:
            db.session.add(PartnerLogo(**pl))

        # --- TALENT PROFILES ---
        talents = [
            {"user_id": 4, "name": "Juan Premium", "title": "Periodista de Investigación Senior", "skills": ["Investigación Corrupción", "Data Mining", "Reporteo Local"], "availability": "Remoto", "region": "Valparaíso", "expected_salary": "$2.200.000 CLP", "experience_years": 12, "avatar_url": "https://i.pravatar.cc/150?u=4"},
            {"user_id": 5, "name": "Pedro Gratis", "title": "Redactor Junior", "skills": ["SEO", "Redacción Creativa"], "availability": "Híbrido", "region": "Biobío", "expected_salary": "$800.000 CLP", "experience_years": 2, "avatar_url": "https://i.pravatar.cc/150?u=5"},
            {"name": "Javiera Latorre", "title": "Periodista de datos (Demo)", "skills": ["Análisis de Datos", "Investigación"], "availability": "Remoto", "region": "Metropolitana", "expected_salary": "$1.500.000 CLP", "experience_years": 5, "avatar_url": "https://i.pravatar.cc/150?u=10"}
        ]
        for tp in talents:
            db.session.add(TalentProfile(**tp))

        # --- DESTACADO ARTICLES ---
        destacados = [
            {"title": "Cipress Lanza Nueva Plataforma", "category": "Institucional", "author": "Equipo Cipress", "date": "24 Oct, 2023", "image_url": "https://picsum.photos/seed/destacado1/800/600", "summary": "Una nueva era para el periodismo emprendedor en Chile y Latinoamérica.", "report_content": "Contenido completo de la noticia destacada..."}
        ]
        for dest in destacados:
            db.session.add(DestacadoArticle(**dest))

        # --- COMMUNITY ADS ---
        ads = [
            {"title": "Vendo cámara Sony A7 III", "description": "Poco uso...", "category": "Venta", "author_name": "Ignacio Paredes", "whatsapp_contact": "56987654321"},
            {"title": "Busco fuente experta", "description": "Para reportaje de crisis hídrica...", "category": "Búsqueda", "author_name": "Catalina Riquelme", "whatsapp_contact": "56912345678"}
        ]
        for ca in ads:
            db.session.add(CommunityAd(**ca))

        # --- APP CONFIG ---
        if not AppConfig.query.filter_by(key="rotationInterval").first():
            db.session.add(AppConfig(key="rotationInterval", value="1", description="Intervalo de rotación en horas"))
        
        # Mark legacy seed as done just in case
        seed_key = AppConfig.query.filter_by(key="INITIAL_SEED_DONE").first()
        if not seed_key:
            db.session.add(AppConfig(key="INITIAL_SEED_DONE", value="true", description="Sembrado inicial completado"))
        else:
            seed_key.value = "true"

        db.session.commit()
        print(">>> Proceso finalizado. La base de datos ha sido reiniciada y poblada.")

if __name__ == "__main__":
    create_db()
