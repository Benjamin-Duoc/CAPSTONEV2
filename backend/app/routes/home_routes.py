from flask import Blueprint, jsonify, request
from datetime import datetime
from app.models.all_models import PressRelease, User
from app.schemas.all_schemas import PressReleaseSchema

home_bp = Blueprint('home_routes', __name__)

@home_bp.route('/api/featured-content', methods=['GET'])
@home_bp.route('/featured-content', methods=['GET'])
def get_featured_content():
    """
    Returns exactly 4 featured news/press releases for the home page
    based on the strict time-of-day and role business rules:
    - PRIME TIME (Horarios Estipulados de Alta Audiencia): 
        08:00 a 12:00 hrs y 18:00 a 22:00 hrs.
        -> PRIORIDAD ABSOLUTA a Colaboradores Premium.
    - HORARIOS MENOS VISTOS (Horario Valle / Noche / Madrugada):
        00:00 a 08:00 hrs y 22:00 a 24:00 hrs.
        -> PRIORIDAD a Colaboradores Gratuitos (exhibición nocturna rotativa).
    - HORARIO REGULAR / INTERMEDIO (12:00 a 18:00 hrs):
        -> Rotación mixta equilibrada (Premium y Gratis).
    """
    now = datetime.now()
    sim_hour = request.args.get('sim_hour', type=int)
    current_hour = sim_hour if (sim_hour is not None and 0 <= sim_hour <= 23) else now.hour

    # Query base: PressReleases activas con join a User
    base_query = PressRelease.query.outerjoin(
        User, PressRelease.author_user_id == User.id
    ).filter(PressRelease.is_deleted == False)

    # Franjas horarias:
    # 1. PRIME TIME ESTIPULADO: 08:00 a 12:00 hrs y 18:00 a 22:00 hrs
    is_prime_time = (8 <= current_hour < 12) or (18 <= current_hour < 22)

    # 2. HORARIOS MENOS VISTOS (Valle / Noche): 00:00 a 08:00 hrs y 22:00 a 24:00 hrs
    is_off_peak = (0 <= current_hour < 8) or (22 <= current_hour < 24)

    results = []

    if is_prime_time:
        # PRIME TIME: Prioridad estricta para Colaboradores Premium
        premium_posts = base_query.filter(
            User.role != None,
            User.role.ilike('%premium%')
        ).order_by(PressRelease.created_at.desc()).limit(4).all()
        results.extend(premium_posts)

        # Si hay menos de 4 Premium, complementar con otros artículos
        if len(results) < 4:
            already_ids = [r.id for r in results]
            backfill_count = 4 - len(results)
            backfill = base_query.filter(
                ~PressRelease.id.in_(already_ids) if already_ids else True
            ).order_by(PressRelease.created_at.desc()).limit(backfill_count).all()
            results.extend(backfill)

    elif is_off_peak:
        # HORARIOS MENOS VISTOS: Prioridad para Colaboradores Gratuitos
        free_posts = base_query.filter(
            User.role != None,
            User.role.ilike('%gratis%')
        ).order_by(PressRelease.created_at.desc()).limit(4).all()
        results.extend(free_posts)

        # Si hay menos de 4 Gratuitos, complementar con artículos de otros colaboradores o admins
        if len(results) < 4:
            already_ids = [r.id for r in results]
            backfill_count = 4 - len(results)
            backfill = base_query.filter(
                ~PressRelease.id.in_(already_ids) if already_ids else True
            ).order_by(PressRelease.created_at.desc()).limit(backfill_count).all()
            results.extend(backfill)

    else:
        # HORARIO REGULAR (12:00 a 18:00): Rotación equilibrada
        # Tomar 2 Premium y 2 Gratuitos para vitrina compartida
        premium_items = base_query.filter(
            User.role != None,
            User.role.ilike('%premium%')
        ).order_by(PressRelease.created_at.desc()).limit(2).all()
        
        free_items = base_query.filter(
            User.role != None,
            User.role.ilike('%gratis%')
        ).order_by(PressRelease.created_at.desc()).limit(2).all()

        results.extend(premium_items)
        results.extend(free_items)

        # Si aún faltan para completar 4
        if len(results) < 4:
            already_ids = [r.id for r in results]
            backfill_count = 4 - len(results)
            backfill = base_query.filter(
                ~PressRelease.id.in_(already_ids) if already_ids else True
            ).order_by(PressRelease.created_at.desc()).limit(backfill_count).all()
            results.extend(backfill)

    schema = PressReleaseSchema(many=True)
    return jsonify(schema.dump(results[:4])), 200

@home_bp.route('/api/featured-content/status', methods=['GET'])
@home_bp.route('/featured-content/status', methods=['GET'])
def get_prime_time_status():
    """
    Devuelve el estado en tiempo real del algoritmo Prime Time para la interfaz.
    """
    now = datetime.now()
    sim_hour = request.args.get('sim_hour', type=int)
    current_hour = sim_hour if (sim_hour is not None and 0 <= sim_hour <= 23) else now.hour

    is_prime_time = (8 <= current_hour < 12) or (18 <= current_hour < 22)
    is_off_peak = (0 <= current_hour < 8) or (22 <= current_hour < 24)

    mode = "prime_time" if is_prime_time else ("off_peak" if is_off_peak else "regular")
    label = (
        "Prime Time Activo (08:00 - 12:00 / 18:00 - 22:00) · Prioridad Colaboradores Premium"
        if is_prime_time
        else (
            "Horario Valle (00:00 - 08:00 / 22:00 - 24:00) · Vitrina Colaboradores Gratuitos"
            if is_off_peak
            else "Horario Regular (12:00 - 18:00) · Rotación Mixta Equitativa"
        )
    )

    return jsonify({
        "current_hour": current_hour,
        "is_prime_time": is_prime_time,
        "is_off_peak": is_off_peak,
        "mode": mode,
        "label": label,
        "simulated": sim_hour is not None
    }), 200
