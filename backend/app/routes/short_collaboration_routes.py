from flask import Blueprint, request, jsonify, session
from app.models.all_models import ShortCollaboration, User
from app.schemas.all_schemas import ShortCollaborationSchema
from app.extensions import db

short_collab_bp = Blueprint('short_collab_custom_routes', __name__, url_prefix='/api/short-collaborations')
single_schema = ShortCollaborationSchema()
list_schema = ShortCollaborationSchema(many=True)


def _resolve_acting_user(data=None):
    """Obtiene el usuario autenticado prioritariamente desde la sesión."""
    session_uid = session.get('user_id')
    if session_uid:
        return User.query.get(session_uid)
    if data and data.get('author_user_id'):
        return User.query.get(data.get('author_user_id'))
    return None


def _can_publish_urgent(user):
    """Solo Colaborador Premium, Empresa y Administrador pueden publicar colaboraciones urgentes."""
    if not user or not user.role:
        return False
    role_lower = user.role.lower()
    return ('premium' in role_lower) or ('administrador' in role_lower) or ('empresa' in role_lower)


@short_collab_bp.route('', methods=['GET'])
def get_all():
    items = ShortCollaboration.query.order_by(ShortCollaboration.id.desc()).all()
    return jsonify(list_schema.dump(items)), 200


@short_collab_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    item = ShortCollaboration.query.get(id)
    if item:
        return jsonify(single_schema.dump(item)), 200
    return jsonify({"error": "Not found"}), 404


@short_collab_bp.route('', methods=['POST'])
def save():
    data = request.get_json() or {}
    user = _resolve_acting_user(data)

    if not user:
        return jsonify({
            "error": "unauthorized",
            "message": "Debes iniciar sesión para publicar una colaboración urgente."
        }), 401

    if not _can_publish_urgent(user):
        return jsonify({
            "error": "premium_required",
            "message": "Las colaboraciones urgentes son una función exclusiva para cuentas Premium, Empresa o Administrador."
        }), 403

    role_lower = (user.role or '').lower()
    is_admin = 'administrador' in role_lower

    try:
        item_id = data.get('id')
        if item_id:
            existing = ShortCollaboration.query.get(item_id)
            if existing:
                if not is_admin and existing.author_user_id != user.id:
                    return jsonify({"error": "No tienes permiso para editar esta colaboración urgente."}), 403
                if not is_admin:
                    data.pop('author_user_id', None)
                item = single_schema.load(data, instance=existing, session=db.session, partial=True)
            else:
                if not is_admin:
                    data['author_user_id'] = user.id
                item = single_schema.load(data, session=db.session)
        else:
            if not is_admin or not data.get('author_user_id'):
                data['author_user_id'] = user.id
            item = single_schema.load(data, session=db.session)

        db.session.add(item)
        db.session.commit()
        return jsonify(single_schema.dump(item)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@short_collab_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
def update(id):
    data = request.get_json() or {}
    user = _resolve_acting_user(data)
    if not user:
        return jsonify({"error": "unauthorized", "message": "Sesión requerida."}), 401

    if not _can_publish_urgent(user):
        return jsonify({"error": "premium_required", "message": "Acceso exclusivo Premium."}), 403

    item = ShortCollaboration.query.get(id)
    if not item:
        return jsonify({"error": "Not found"}), 404

    is_admin = 'administrador' in (user.role or '').lower()
    if not is_admin and item.author_user_id != user.id:
        return jsonify({"error": "No tienes permiso para editar esta colaboración urgente."}), 403

    try:
        if not is_admin:
            data.pop('author_user_id', None)
        item = single_schema.load(data, instance=item, session=db.session, partial=True)
        db.session.commit()
        return jsonify(single_schema.dump(item)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@short_collab_bp.route('/<int:id>', methods=['DELETE'])
def delete(id):
    user = _resolve_acting_user()
    item = ShortCollaboration.query.get(id)
    if not item:
        return jsonify({"error": "Not found"}), 404

    if user:
        is_admin = 'administrador' in (user.role or '').lower()
        if not is_admin and item.author_user_id != user.id:
            return jsonify({"error": "No tienes permiso para eliminar esta colaboración urgente."}), 403
        if not _can_publish_urgent(user):
            return jsonify({"error": "premium_required", "message": "Acceso exclusivo Premium."}), 403

    db.session.delete(item)
    db.session.commit()
    return '', 204
