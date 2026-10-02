from flask import Blueprint, request, jsonify, session
import traceback
from app.models.all_models import PremiumSponsor
from app.schemas.all_schemas import PremiumSponsorSchema
from app.extensions import db

sponsor_bp = Blueprint('sponsor', __name__, url_prefix='/api/premium-sponsors')
schema = PremiumSponsorSchema()
list_schema = PremiumSponsorSchema(many=True)

@sponsor_bp.route('', methods=['GET'])
def get_all():
    items = PremiumSponsor.query.all()
    return jsonify(list_schema.dump(items)), 200

@sponsor_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    item = PremiumSponsor.query.get(id)
    if item:
        return jsonify(schema.dump(item)), 200
    return jsonify({"error": "Not found"}), 404

@sponsor_bp.route('', methods=['POST'])
def save():
    data = request.get_json()
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    try:
        item_id = data.get('id')
        if item_id:
            existing = PremiumSponsor.query.get(item_id)
            if existing:
                # Permitir editar si es admin o dueño
                if user_role != 'Administrador' and existing.user_id != user_id:
                    return jsonify({"error": "No tienes permiso para editar esta tarjeta"}), 403
                item = schema.load(data, instance=existing, session=db.session, partial=True)
            else:
                item = schema.load(data, session=db.session)
                # Al crear uno nuevo (incluso si se forzó ID), inyectar nuestro user_id:
                if user_role != 'Administrador' or not item.user_id:
                     item.user_id = user_id
        else:
            item = schema.load(data, session=db.session)
            # Inyectar user_id segurizado obligatoriamente
            if user_role != 'Administrador' or not item.user_id:
                 item.user_id = user_id

        db.session.add(item)
        db.session.commit()
        return jsonify(schema.dump(item)), 201
    except Exception as e:
        db.session.rollback()
        err_msg = str(getattr(e, 'messages', repr(e)))
        print("SAVE ERROR:", err_msg, traceback.format_exc())
        return jsonify({"error": err_msg}), 400

@sponsor_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update(id):
    data = request.get_json()
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    item = PremiumSponsor.query.get(id)
    if not item:
        return jsonify({"error": "Not found"}), 404
        
    if user_role != 'Administrador' and item.user_id != user_id:
         return jsonify({"error": "No tienes permiso para editar esta tarjeta"}), 403

    try:
        # Prevenimos que intente cambiarse el dueño a sí mismo maliciosamente
        if 'user_id' in data and user_role != 'Administrador':
             del data['user_id']
             
        item = schema.load(data, instance=item, session=db.session, partial=True)
        db.session.commit()
        return jsonify(schema.dump(item)), 200
    except Exception as e:
        db.session.rollback()
        err_msg = str(getattr(e, 'messages', repr(e)))
        print("UPDATE ERROR:", err_msg, traceback.format_exc())
        return jsonify({"error": err_msg}), 400

@sponsor_bp.route('/<int:id>', methods=['DELETE'])
def delete(id):
    user_role = session.get('user_role')
    user_id = session.get('user_id')
    
    item = PremiumSponsor.query.get(id)
    if not item:
        return jsonify({"error": "Not found"}), 404
        
    if user_role != 'Administrador' and item.user_id != user_id:
         return jsonify({"error": "No tienes permiso para eliminar esta tarjeta"}), 403

    try:
        db.session.delete(item)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
