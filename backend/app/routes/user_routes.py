from flask import Blueprint, request, jsonify, session
from app.models.all_models import User
from app.services.user_service import UserService
from app.schemas.all_schemas import UserSchema

user_bp = Blueprint('user', __name__, url_prefix='/api/users')
service = UserService()
schema = UserSchema()
list_schema = UserSchema(many=True)


def _get_authenticated_user():
    session_uid = session.get('user_id')
    if not session_uid:
        return None
    return User.query.get(session_uid)


def _is_admin_user(user):
    return bool(user and user.role and 'admin' in user.role.lower())


@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    acting_user = _get_authenticated_user()
    is_admin = _is_admin_user(acting_user)
    try:
        # Solo un Administrador autenticado puede crear cuentas con rol Empresa, Cliente, Premium o Admin.
        user = service.register_user(data, allow_privileged_role=is_admin)
        if not is_admin:
            session['user_id'] = user.id
            session['user_role'] = user.role
            session.permanent = True
        return jsonify({
            "success": True,
            "message": "Usuario registrado exitosamente",
            "userId": user.id,
            "user": schema.dump(user)
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    try:
        user = service.authenticate(data.get('email'), data.get('password'))
        session['user_id'] = user.id
        session['user_role'] = getattr(user, 'role', None)
        session.permanent = True  # Para que la cookie persista si está configurada así
        return jsonify({
            "success": True,
            "message": "Login exitoso",
            "user": schema.dump(user)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 401

@user_bp.route('/<int:user_id>', methods=['PUT'])
def update(user_id):
    data = request.get_json() or {}
    acting_user = _get_authenticated_user()
    if not acting_user:
        return jsonify({"success": False, "message": "Debes iniciar sesión para actualizar un usuario"}), 401

    is_admin = _is_admin_user(acting_user)
    if not is_admin and acting_user.id != user_id:
        return jsonify({"success": False, "message": "No tienes permiso para modificar otro usuario"}), 403

    try:
        user = service.update_user(user_id, data, allow_role_change=is_admin)
        if acting_user.id == user_id:
            session['user_role'] = user.role
        return jsonify({
            "success": True,
            "message": "Usuario actualizado exitosamente",
            "user": schema.dump(user)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete(user_id):
    acting_user = _get_authenticated_user()
    if not acting_user:
        return jsonify({"success": False, "message": "Debes iniciar sesión para eliminar usuarios"}), 401
    if not _is_admin_user(acting_user):
        return jsonify({"success": False, "message": "Solo un Administrador puede eliminar usuarios"}), 403
    if acting_user.id == user_id:
        return jsonify({"success": False, "message": "No puedes eliminar tu propia cuenta activa"}), 400

    try:
        service.delete_user(user_id)
        return jsonify({
            "success": True,
            "message": "Usuario eliminado exitosamente"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@user_bp.route('', methods=['GET'])
def get_all():
    users = service.get_all_users()
    return jsonify(list_schema.dump(users)), 200

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_one(user_id):
    user = service.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    return jsonify(schema.dump(user)), 200


@user_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('user_role', None)
    return jsonify({"success": True, "message": "Logout exitoso"}), 200
