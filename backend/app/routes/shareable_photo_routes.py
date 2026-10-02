from flask import Blueprint, request, jsonify
from datetime import datetime, time
from app.models.all_models import ShareablePhoto, User
from app.schemas.all_schemas import ShareablePhotoSchema
from app.extensions import db

shareable_photo_bp = Blueprint('shareable_photo_custom_routes', __name__, url_prefix='/api/shareable-photos')
single_schema = ShareablePhotoSchema()
list_schema = ShareablePhotoSchema(many=True)

@shareable_photo_bp.route('', methods=['GET'])
def get_all():
    author_id = request.args.get('author_id')
    
    query = ShareablePhoto.query.filter_by(is_deleted=False)
    
    if author_id:
        items = query.filter_by(user_id=author_id).order_by(ShareablePhoto.id.desc()).all()
    else:
        # Fetch items sorted by ID (descending)
        items = query.order_by(ShareablePhoto.id.desc()).all()

    return jsonify(list_schema.dump(items))

@shareable_photo_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    item = ShareablePhoto.query.filter_by(id=id, is_deleted=False).first()
    if item:
        return jsonify(single_schema.dump(item))
    return jsonify({"error": "Not found"}), 404

@shareable_photo_bp.route('', methods=['POST'])
def save():
    data = request.get_json()
    try:
        user_id = data.get('user_id')
        item_id = data.get('id')
        
        # Check quota limit for NEW photos (only if user_id is provided)
        if not item_id and user_id:
            user = User.query.get(user_id)
            if user and (not user.role or 'premium' not in user.role.lower() and 'administrador' not in user.role.lower()):
                today_start = datetime.utcnow().strftime('%Y-%m-%dT00:00:00')
                # Wait, date_added is a String in ISO format according to DB schema in `all_models.py`!
                # Actually checking `date_added` >= today_start works if it's stored as ISO strings.
                
                # Check the count
                count_today = ShareablePhoto.query.filter(
                    ShareablePhoto.user_id == user_id,
                    ShareablePhoto.date_added >= today_start
                ).count()
                
                if count_today >= 3:
                    return jsonify({
                        "error": "limit_reached",
                        "message": "Has alcanzado el límite de 3 fotos hoy. ¡Pásate a Premium para subir tu portafolio sin límites!"
                    }), 403

        if item_id:
            existing = ShareablePhoto.query.get(item_id)
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

@shareable_photo_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update(id):
    data = request.get_json()
    item = ShareablePhoto.query.get(id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    try:
        item = single_schema.load(data, instance=item, session=db.session, partial=True)
        db.session.commit()
        return jsonify(single_schema.dump(item)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@shareable_photo_bp.route('/<int:id>', methods=['DELETE'])
def delete(id):
    item = ShareablePhoto.query.get(id)
    if item:
        # Soft delete instead of db.session.delete(item)
        item.is_deleted = True
        db.session.commit()
        return '', 204
    return jsonify({"error": "Not found"}), 404
