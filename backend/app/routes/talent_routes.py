from flask import Blueprint, request, jsonify, session
from app.models.all_models import TalentProfile, User
from app.schemas.all_schemas import TalentProfileSchema
from app.extensions import db
from sqlalchemy import case

talent_bp = Blueprint('talent', __name__, url_prefix='/api/talent-profiles')
profile_schema = TalentProfileSchema()
profiles_schema = TalentProfileSchema(many=True)

def _is_premium_or_admin(role):
    r = (role or '').lower()
    return ('premium' in r) or ('administrador' in r)

@talent_bp.route('', methods=['GET'])
def get_all_profiles():
    # JOIN with User to get the role for sorting and identification
    # Role priority: 'Colaborador Premium' (0), 'Colaborador Gratis' (1), Others (2)
    query = db.session.query(TalentProfile, User.role).join(
        User, TalentProfile.user_id == User.id
    )

    # Sorted result setup (Case statement remains for sorting)
    query = query.order_by(
        case(
            (User.role == 'Colaborador Premium', 0),
            (User.role == 'Colaborador Gratis', 1),
            else_=2
        ),
        TalentProfile.created_at.desc()
    )
    
    results = query.all()
    
    # Manually inject is_premium flag into the serialized data
    list_data = []
    for profile, role in results:
        data = profile_schema.dump(profile)
        data['isPremium'] = _is_premium_or_admin(role)
        list_data.append(data)
        
    return jsonify(list_data), 200

@talent_bp.route('/my', methods=['GET'])
def get_my_profile():
    # Obtener user_id desde sesión o query param (fallback para recargas)
    user_id = session.get('user_id') or request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "No hay sesión activa"}), 401
    
    profile = TalentProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify(None), 200
    
    data = profile_schema.dump(profile)
    # Check if user is premium to inform the frontend
    user = User.query.get(user_id)
    data['isPremium'] = _is_premium_or_admin(user.role) if user else False
    
    return jsonify(data), 200

@talent_bp.route('/my', methods=['POST'])
def save_my_profile():
    data = request.get_json() or {}
    # Obtener user_id desde sesión activa o desde el cuerpo de la petición
    user_id = session.get('user_id') or data.get('user_id')
    if not user_id:
        return jsonify({"error": "No hay sesión activa de usuario"}), 401
    
    profile = TalentProfile.query.filter_by(user_id=user_id).first()
    
    try:
        # Limpiar atributos no persistibles o protegidos
        data.pop('id', None)
        data.pop('is_premium', None)
        data.pop('isPremium', None)
        data.pop('created_at', None)

        if profile:
            # Actualizar existente
            data.pop('user_id', None)
            profile = profile_schema.load(data, instance=profile, session=db.session, partial=True)
        else:
            # Crear nuevo perfil vinculado
            data['user_id'] = user_id
            profile = profile_schema.load(data, session=db.session)
            db.session.add(profile)
            
        db.session.commit()
        
        # Devolver perfil enriquecido
        res_data = profile_schema.dump(profile)
        user = User.query.get(user_id)
        res_data['isPremium'] = _is_premium_or_admin(user.role) if user else False
        
        return jsonify(res_data), 200
    except Exception as e:
        print("ERROR GUARDANDO TALENT PROFILE:", str(e), "Payload:", data)
        db.session.rollback()
        return jsonify({"error": f"Error al procesar los datos: {str(e)}"}), 400
