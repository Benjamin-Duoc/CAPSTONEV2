from datetime import datetime
from app.extensions import db

# -----------------------------------------------------------------------------
# Core & Auth
# -----------------------------------------------------------------------------

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String)

class User(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    region = db.Column(db.String)
    email = db.Column(db.String, unique=True, nullable=False)
    role = db.Column(db.String, db.ForeignKey('roles.name')) # Using name as FK for simplicity or ID? Usually ID. But let's stick to string role for now to minimize refactor if other parts use string role. Or maybe safer to just have Role table and user has role string that matches. The prompt says "tabla de usuarios debe tener los registros de usuarios asociados a un rol". 
    # Let's use ID for cleaner normalization, but that breaks existing 'role' string usage if any.
    # Actually, let's keep 'role' as string column in User for backward compat if needed, but make it FK to Role.name if possible. 
    # SQLite supports FKs. 
    password_hash = db.Column(db.String, nullable=False)
    avatar_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    role_rel = db.relationship('Role', backref=db.backref('users', lazy=True))

# -----------------------------------------------------------------------------
# Configuration & Stats
# -----------------------------------------------------------------------------

class AppConfig(db.Model):
    __tablename__ = 'app_config'
    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.String)
    description = db.Column(db.String)

class SiteStat(db.Model):
    __tablename__ = 'site_stats'
    id = db.Column(db.String, primary_key=True)
    label = db.Column(db.String)
    end_value = db.Column(db.Integer)
    prefix = db.Column(db.String)

class HeroHeading(db.Model):
    __tablename__ = 'hero_heading'
    id = db.Column(db.Integer, primary_key=True)
    main_text = db.Column(db.String) # "Texto Principal"
    highlighted_text = db.Column(db.String) # "Texto Destacado"
    featured_title = db.Column(db.String) # "Subtítulo (opcional)" -> e.g. "La Pública"
    featured_description = db.Column(db.String) # "Etiqueta del Emprendimiento Destacado"
    featured_label = db.Column(db.String) # "DESTACADO"
    text_color = db.Column(db.String) # "Color del Texto Sobre la Foto"
    image_url = db.Column(db.String) # "Imagen de Fondo (Hero)"

# -----------------------------------------------------------------------------
# News & Press
# -----------------------------------------------------------------------------

class DestacadoArticle(db.Model):
    __tablename__ = 'destacado_article'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    category = db.Column(db.String)
    author = db.Column(db.String)
    date = db.Column(db.String)
    image_url = db.Column(db.String)
    summary = db.Column(db.Text)
    report_content = db.Column(db.Text)

class NewsArticle(db.Model):
    __tablename__ = 'news_article'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    category = db.Column(db.String)
    author = db.Column(db.String)
    date = db.Column(db.String)
    image_url = db.Column(db.String)
    summary = db.Column(db.Text)
    report_content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PressRelease(db.Model):
    __tablename__ = 'press_release'
    id = db.Column(db.Integer, primary_key=True)
    author_user_id = db.Column(db.Integer, nullable=True)
    title = db.Column(db.String)
    institution = db.Column(db.String)
    author = db.Column(db.String)
    date = db.Column(db.String)
    image_url = db.Column(db.String)
    summary = db.Column(db.Text)
    report_content = db.Column(db.Text)
    report_author = db.Column(db.String)
    report_date = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

class PhotojournalismPost(db.Model):
    __tablename__ = 'photojournalism_posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True) # Linked User
    title = db.Column(db.String)
    image_url = db.Column(db.String)
    caption = db.Column(db.String)
    photographer_name = db.Column(db.String)
    photographer_avatar_url = db.Column(db.String)
    date_taken = db.Column(db.String)
    whatsapp_contact = db.Column(db.String)
    date_added = db.Column(db.DateTime)
    created_by = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------------------------------
# Community & Social
# -----------------------------------------------------------------------------

class CommunityPost(db.Model):
    __tablename__ = 'community_posts'
    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String)
    author_avatar_url = db.Column(db.String)
    post_title = db.Column(db.String)
    post_url = db.Column(db.String)
    comment = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CommunityAd(db.Model):
    __tablename__ = 'community_ads'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)
    category = db.Column(db.String)
    author_name = db.Column(db.String)
    author_avatar_url = db.Column(db.String)
    whatsapp_contact = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ShortCollaboration(db.Model):
    __tablename__ = 'short_collaborations'
    id = db.Column(db.Integer, primary_key=True)
    author_user_id = db.Column(db.Integer, nullable=True)
    title = db.Column(db.String)
    deadline = db.Column(db.String)
    budget = db.Column(db.String)
    author = db.Column(db.String)
    author_avatar_url = db.Column(db.String)
    whatsapp_contact = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    date_display = db.Column(db.String)
    full_date = db.Column(db.String)
    location = db.Column(db.String)
    type = db.Column(db.String)
    link = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------------------------------
# Education & Training
# -----------------------------------------------------------------------------

class Course(db.Model):
    __tablename__ = 'course'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    category = db.Column(db.String)
    level = db.Column(db.String)
    format = db.Column(db.String)
    cost = db.Column(db.String)
    rating = db.Column(db.Float)
    review_count = db.Column(db.Integer)
    image_url = db.Column(db.String)
    description = db.Column(db.Text)
    instructor_name = db.Column(db.String)
    instructor_title = db.Column(db.String)
    instructor_avatar_url = db.Column(db.String)
    duration = db.Column(db.String)
    enrollment_start_date = db.Column(db.String)
    enrollment_end_date = db.Column(db.String)
    course_start_date = db.Column(db.String)
    course_end_date = db.Column(db.String)
    access_link = db.Column(db.String)
    # Using a simple JSON column for topics in SQLite to simplify exact replication
    topics = db.Column(db.JSON)

# -----------------------------------------------------------------------------
# Entrepreneurship & Business
# -----------------------------------------------------------------------------

class Entrepreneurship(db.Model):
    __tablename__ = 'entrepreneurship'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    name = db.Column(db.String)
    type = db.Column(db.String)
    founder = db.Column(db.String)
    location = db.Column(db.String)
    specialty = db.Column(db.String)
    image_url = db.Column(db.String)
    description = db.Column(db.Text)
    portfolio_url = db.Column(db.String)
    rating = db.Column(db.Float)
    review_count = db.Column(db.Integer)

class EntrepreneurshipTip(db.Model):
    __tablename__ = 'entrepreneurship_tips'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)
    expert_name = db.Column(db.String)
    expert_title = db.Column(db.String)
    thumbnail_url = db.Column(db.String)
    video_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FundingOpportunity(db.Model):
    __tablename__ = 'funding_opportunities'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    organization = db.Column(db.String)
    deadline = db.Column(db.String)
    type = db.Column(db.String)
    link = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------------------------------
# Jobs & Services
# -----------------------------------------------------------------------------

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    company = db.Column(db.String)
    location = db.Column(db.String)
    type = db.Column(db.String)
    area = db.Column(db.String)
    date = db.Column(db.String)
    logo_url = db.Column(db.String)
    description = db.Column(db.String)
    apply_email = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FreelanceService(db.Model):
    __tablename__ = 'freelance_services'
    id = db.Column(db.Integer, primary_key=True)
    service = db.Column(db.String)
    provider = db.Column(db.String)
    category = db.Column(db.String)
    image_url = db.Column(db.String)
    description = db.Column(db.String)
    linkedin_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------------------------------
# Legal
# -----------------------------------------------------------------------------

class LegalTopic(db.Model):
    __tablename__ = 'legal_topics'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)

class LegalFAQ(db.Model):
    __tablename__ = 'legal_faqs'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String)
    answer = db.Column(db.String)

# -----------------------------------------------------------------------------
# Multimedia & Spotlight
# -----------------------------------------------------------------------------

class PromoVideo(db.Model):
    __tablename__ = 'promo_videos'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)
    thumbnail_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NgoSpotlight(db.Model):
    __tablename__ = 'ngo_spotlights'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    institution = db.Column(db.String)
    author = db.Column(db.String)
    date_published = db.Column(db.String)
    image_url = db.Column(db.String)
    summary = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ShareablePhoto(db.Model):
    __tablename__ = 'shareable_photo'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True) # Linked User
    image_url = db.Column(db.String)
    original_image_url = db.Column(db.String, nullable=True) # Full-res for buyers
    watermarked_image_url = db.Column(db.String, nullable=True) # Watermarked thumb
    price = db.Column(db.String, nullable=True) # e.g. "$15.000 CLP"
    is_sold = db.Column(db.Boolean, default=False)
    caption = db.Column(db.String)
    photographer_name = db.Column(db.String)
    photographer_avatar_url = db.Column(db.String)
    whatsapp_contact = db.Column(db.String)
    keywords = db.Column(db.JSON)
    date_added = db.Column(db.String)
    text_color = db.Column(db.String)
    is_deleted = db.Column(db.Boolean, default=False)

# -----------------------------------------------------------------------------
# Partners & Sponsors
# -----------------------------------------------------------------------------

class PartnerLogo(db.Model):
    __tablename__ = 'partner_logos'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    logo_url = db.Column(db.String)
    website_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SponsoredAd(db.Model):
    __tablename__ = 'sponsored_ads'
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String)
    title = db.Column(db.String)
    advertiser = db.Column(db.String)
    cta_text = db.Column(db.String)
    cta_link = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PremiumSponsor(db.Model):
    __tablename__ = 'premium_sponsor'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True) # Linked User
    name = db.Column(db.String)
    tagline = db.Column(db.String)
    image_url = db.Column(db.String)
    cta_text = db.Column(db.String)
    cta_link = db.Column(db.String)
    name_color = db.Column(db.String)
    cta_color = db.Column(db.String)
    report_content = db.Column(db.Text)
    report_author = db.Column(db.String)
    report_date = db.Column(db.String)

# -----------------------------------------------------------------------------
# Talent & Specialist
# -----------------------------------------------------------------------------

class TalentProfile(db.Model):
    __tablename__ = 'talent_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True) # Linked User
    name = db.Column(db.String)
    avatar_url = db.Column(db.String)
    title = db.Column(db.String)
    skills = db.Column(db.JSON)
    availability = db.Column(db.String)
    expected_salary = db.Column(db.String)
    region = db.Column(db.String)
    linkedin_url = db.Column(db.String)
    experience_years = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Specialist(db.Model):
    __tablename__ = 'specialists'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    title = db.Column(db.String)
    image_url = db.Column(db.String)
    specialty_description = db.Column(db.String)
    whatsapp_contact = db.Column(db.String)
    date_added = db.Column(db.Date)
    text_color = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------------------------------
# Miscelaneous
# -----------------------------------------------------------------------------

class SpecialAd(db.Model):
    __tablename__ = 'special_ads'
    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)
    cta_text = db.Column(db.String)

class Resource(db.Model):
    __tablename__ = 'resources'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    category = db.Column(db.String)
    description = db.Column(db.String)
    link = db.Column(db.String)
    type = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
