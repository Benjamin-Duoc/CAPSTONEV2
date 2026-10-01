from flask import Blueprint, request, jsonify, session
from app.services.user_service import UserService
from app.schemas.all_schemas import UserSchema

user_bp = Blueprint('user', __name__, url_prefix='/api/users')
service = UserService()
schema = UserSchema()
list_schema = UserSchema(many=True)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        user = service.register_user(data)
        return jsonify({
            "success": True,
            "message": "Usuario registrado exitosamente",
            "userId": user.id
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
    data = request.get_json()
    try:
        user = service.update_user(user_id, data)
        return jsonify({
            "success": True,
            "message": "Usuario actualizado exitosamente",
            "user": schema.dump(user)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete(user_id):
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
    return jsonify({"success": True, "message": "Logout exitoso"}), 200
