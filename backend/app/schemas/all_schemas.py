from app.extensions import ma
from app.models.all_models import *

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        exclude = ('password_hash',) # avatar_url is included automatically


class AppConfigSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = AppConfig
        load_instance = True

class SiteStatSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SiteStat
        load_instance = True

class HeroHeadingSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = HeroHeading
        load_instance = True
        unknown = 'exclude'

class NewsArticleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = NewsArticle
        load_instance = True

class DestacadoArticleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = DestacadoArticle
        load_instance = True

from marshmallow import fields
from datetime import datetime

class PressReleaseSchema(ma.SQLAlchemyAutoSchema):
    is_public_visible = fields.Method("get_is_public_visible")

    def get_is_public_visible(self, obj):
        from app.models.all_models import User
        user = User.query.get(obj.author_user_id) if getattr(obj, 'author_user_id', None) else None
        if user and user.role and ('premium' in user.role.lower() or 'administrador' in user.role.lower()):
            return True
        current_hour = datetime.now().hour
        if 0 <= current_hour < 8:
            return True
        return False

    class Meta:
        model = PressRelease
        load_instance = True
        unknown = 'exclude'

class PhotojournalismPostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PhotojournalismPost
        load_instance = True
        include_fk = True 

class CommunityPostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CommunityPost
        load_instance = True
        unknown = 'exclude'

class CommunityAdSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CommunityAd
        load_instance = True

class ShortCollaborationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ShortCollaboration
        load_instance = True

class CourseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Course
        load_instance = True

class EntrepreneurshipSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Entrepreneurship
        load_instance = True
        include_fk = True

class EntrepreneurshipTipSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = EntrepreneurshipTip
        load_instance = True

class EventSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Event
        load_instance = True

class FundingOpportunitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FundingOpportunity
        load_instance = True

class JobSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Job
        load_instance = True

class FreelanceServiceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FreelanceService
        load_instance = True

class LegalTopicSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LegalTopic
        load_instance = True

class LegalFAQSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LegalFAQ
        load_instance = True

class PromoVideoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PromoVideo
        load_instance = True

class NgoSpotlightSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = NgoSpotlight
        load_instance = True

class ShareablePhotoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ShareablePhoto
        load_instance = True
        include_fk = True

class PartnerLogoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PartnerLogo
        load_instance = True

class SponsoredAdSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SponsoredAd
        load_instance = True

class PremiumSponsorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PremiumSponsor
        load_instance = True
        include_fk = True

class TalentProfileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = TalentProfile
        load_instance = True
        include_fk = True
        unknown = 'exclude'

class SpecialistSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Specialist
        load_instance = True

class SpecialAdSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SpecialAd
        load_instance = True

class ResourceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Resource
        load_instance = True
