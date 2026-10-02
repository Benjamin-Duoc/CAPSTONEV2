from flask import Blueprint, request, jsonify
from datetime import datetime, time
from app.models.all_models import PressRelease, User
from app.schemas.all_schemas import PressReleaseSchema
from app.extensions import db

press_release_bp = Blueprint('press_release_custom_routes', __name__, url_prefix='/api/press-releases')
single_schema = PressReleaseSchema()
list_schema = PressReleaseSchema(many=True)

@press_release_bp.route('', methods=['GET'])
def get_all():
    items = PressRelease.query.filter_by(is_deleted=False).order_by(PressRelease.created_at.desc()).all()
    return jsonify(list_schema.dump(items))

@press_release_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    item = PressRelease.query.filter_by(id=id, is_deleted=False).first()
    if item:
        return jsonify(single_schema.dump(item))
    return jsonify({"error": "Not found"}), 404

@press_release_bp.route('', methods=['POST'])
def save():
    data = request.get_json()
    try:
        author_user_id = data.get('author_user_id')
        item_id = data.get('id')
        
        # Only check limit for NEW press releases
        if not item_id and author_user_id:
            user = User.query.get(author_user_id)
            # If user is not Premium, check daily limit
            if user and (not user.role or 'premium' not in user.role.lower()):
                # Get start of current day (midnight)
                today_start = datetime.combine(datetime.utcnow().date(), time.min)
                
                # Count releases by this user today
                count_today = PressRelease.query.filter(
                    PressRelease.author_user_id == author_user_id,
                    PressRelease.created_at >= today_start
                ).count()
                
                if count_today >= 3:
                    return jsonify({
                        "error": "limit_reached",
                        "message": "Has alcanzado el límite de 3 comunicados hoy. ¡Pásate a Premium para publicar sin límites!"
                    }), 403

        if item_id:
            existing = PressRelease.query.get(item_id)
            if existing:
                item = single_schema.load(data, instance=existing, session=db.session, partial=True)
            else:
                item = single_schema.load(data, session=db.session)
        else:
            item = single_schema.load(data, session=db.session)
        
        db.session.add(item)
        db.session.commit()
        return jsonify(single_schema.dump(item)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@press_release_bp.route('/<int:id>', methods=['DELETE'])
def delete(id):
    item = PressRelease.query.get(id)
    if item:
        item.is_deleted = True
        db.session.commit()
        return '', 204
    return jsonify({"error": "Not found"}), 404
