from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from app.models.all_models import PressRelease, User
from app.schemas.all_schemas import PressReleaseSchema

home_bp = Blueprint('home_routes', __name__)

@home_bp.route('/api/featured-content', methods=['GET'])
def get_featured_content():
    """
    Returns exactly 4 featured news/press releases for the home page
    based on the strict time-of-day and role business rules.
    """
    now = datetime.now()
    current_hour = now.hour
    
    # Query base: PressReleases joined with User
    query = PressRelease.query.outerjoin(User, PressRelease.author_user_id == User.id).filter(PressRelease.is_deleted == False)
    
    results = []
    
    if 0 <= current_hour < 8:
        # FREE ROTATION (00:00 - 07:59 AM)
        # Display 4 Free posts explicitly, or fallback to any posts
        free_posts = query.filter(
            (User.role == 'Colaborador Gratis') | (User.role.is_(None))
        ).order_by(PressRelease.created_at.desc()).limit(4).all()
        results.extend(free_posts)
    else:
        # PREMIUM ONLY (04:00 AM - 23:59)
        premium_posts = query.filter(
            User.role != None,
            User.role.ilike('%premium%')
        ).order_by(PressRelease.created_at.desc()).limit(4).all()
        results.extend(premium_posts)
        
    # Dump exactly 4 (or less if not enough in DB)
    if len(results) < 4:
        # Backfill with anything randomly to ensure 4 spots are filled
        from sqlalchemy.sql.expression import func
        already_have_ids = [r.id for r in results]
        backfill_count = 4 - len(results)
        
        backfill_query = query.filter(
            ~PressRelease.id.in_(already_have_ids) if already_have_ids else True
        )
             
        backfill_items = backfill_query.order_by(func.random()).limit(backfill_count).all()
        results.extend(backfill_items)

    schema = PressReleaseSchema(many=True)
    return jsonify(schema.dump(results[:4])), 200
