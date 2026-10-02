from flask import Blueprint, request, jsonify
from datetime import datetime, time
from app.models.all_models import PhotojournalismPost, User
from app.schemas.all_schemas import PhotojournalismPostSchema
from app.extensions import db

photojournalism_bp = Blueprint('photojournalism_custom_routes', __name__, url_prefix='/api/photojournalism-posts')
single_schema = PhotojournalismPostSchema()
list_schema = PhotojournalismPostSchema(many=True)

@photojournalism_bp.route('', methods=['GET'])
def get_all():
    author_id = request.args.get('author_id')
    
    query = PhotojournalismPost.query
    
    if author_id:
        items = query.filter_by(user_id=author_id).order_by(PhotojournalismPost.id.desc()).all()
    else:
        # Fetch items sorted by ID (descending)
        items = query.order_by(PhotojournalismPost.id.desc()).all()

    return jsonify(list_schema.dump(items))

@photojournalism_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    item = PhotojournalismPost.query.filter_by(id=id).first()
    if item:
        return jsonify(single_schema.dump(item))
    return jsonify({"error": "Not found"}), 404

@photojournalism_bp.route('', methods=['POST'])
def save():
    data = request.get_json()
    try:
        user_id = data.get('user_id')
        item_id = data.get('id')
        
        # We enforce the 3 photo limit on Photojournalism as well
        if not item_id and user_id:
            user = User.query.get(user_id)
            if user and (not user.role or 'premium' not in user.role.lower() and 'administrador' not in user.role.lower()):
                today_start = datetime.utcnow().strftime('%Y-%m-%dT00:00:00')
                count_today = PhotojournalismPost.query.filter(
                    PhotojournalismPost.user_id == user_id,
                    PhotojournalismPost.date_added >= today_start
                ).count()
                
                if count_today >= 3:
                    return jsonify({
                        "error": "limit_reached",
                        "message": "Has alcanzado el límite de 3 fotos de fotoperiodismo hoy. ¡Pásate a Premium para subir tu portafolio sin límites!"
                    }), 403

        if item_id:
            existing = PhotojournalismPost.query.get(item_id)
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

@photojournalism_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update(id):
    data = request.get_json()
    item = PhotojournalismPost.query.get(id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    try:
        item = single_schema.load(data, instance=item, session=db.session, partial=True)
        db.session.commit()
        return jsonify(single_schema.dump(item)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@photojournalism_bp.route('/<int:id>', methods=['DELETE'])
def delete(id):
    item = PhotojournalismPost.query.get(id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return '', 204
    return jsonify({"error": "Not found"}), 404
