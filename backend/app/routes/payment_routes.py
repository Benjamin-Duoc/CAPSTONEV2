from flask import Blueprint, request, jsonify, current_app
from app.utils.flow import FlowClient
from app.models.all_models import User
from app.extensions import db
import time
import logging

logger = logging.getLogger(__name__)

payment_bp = Blueprint('payment_routes', __name__, url_prefix='/api/payments')

@payment_bp.route('/create', methods=['POST'])
def create_payment():
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        flow = FlowClient()
        if not flow.is_configured():
            logger.error("Flow credentials missing in configuration")
            return jsonify({
                "status": "error", 
                "message": "La pasarela de pagos no está configurada en el servidor (faltan llaves API)."
            }), 500
    
        # Configuration for the payment
        # Use time.time() instead of SQL functions for the order_id to avoid Python-level errors
        timestamp = int(time.time())
        order_id = f"PREMIUM_{user_id}_{timestamp}"
        subject = "Suscripcion Premium CiPress"
        amount = 3000
        email = user.email
        
        # URLs for redirection and confirmation
        url_return = current_app.config.get('FRONTEND_URL', "https://www.cipress.cl/") 
        
        backend_url = current_app.config.get('BACKEND_URL', request.host_url).rstrip('/')
        url_confirmation = f"{backend_url}/api/payments/confirm"
        
        result = flow.create_payment(
            order_id=order_id,
            subject=subject,
            amount=amount,
            email=email,
            url_return=url_return,
            url_confirmation=url_confirmation
        )
        
        # Si Flow nos responde con la URL y el Token, ¡fue un éxito!
        if "url" in result and "token" in result:
            url_pago = f"{result['url']}?token={result['token']}"
            return jsonify({
                "status": "success", 
                "message": "Link de cobro generado",
                "payment_url": url_pago,
                "url": url_pago, # Maintain compatibility with previous frontend if needed
                "token": result['token']
            }), 200
        else:
            # ¡El Paracaídas de Errores!
            codigo_error = result.get('code')
            mensaje_original = result.get('message', 'Error desconocido en Flow')
            
            mensaje_amigable = "No pudimos conectar con la pasarela de pagos en este momento."
            
            # Si detectamos el error 1620 de Sandbox
            if codigo_error == 1620:
                mensaje_amigable = "El correo de tu cuenta no es válido para transacciones de prueba. Al estar en modo Sandbox, por favor intenta usar el correo asociado a tu cuenta de desarrollador."
            
            logger.error(f"Error de Flow [{codigo_error}]: {mensaje_original}")
            return jsonify({
                "status": "error", 
                "message": mensaje_amigable,
                "technical_details": mensaje_original,
                "error": mensaje_amigable # Maintain compatibility
            }), 400

    except Exception as e:
        logger.exception("Error critico en create_payment")
        return jsonify({
            "status": "error", 
            "message": "Error interno al procesar el pago.",
            "details": str(e)
        }), 500

@payment_bp.route('/confirm', methods=['POST'])
def confirm_payment():
    # Flow sends token via POST 'token' field in form-data or raw
    token = request.form.get('token')
    
    if not token:
        return jsonify({"error": "No token provided"}), 400
    
    flow = FlowClient()
    status_data = flow.get_payment_status(token)
    
    # Status 2 = Paid
    if status_data.get('status') == 2:
        order_id = status_data.get('commerceOrder', '')
        if order_id.startswith('PREMIUM_'):
            # Extract user_id from PREMIUM_USERID_TIMESTAMP
            try:
                parts = order_id.split('_')
                user_id = int(parts[1])
                user = User.query.get(user_id)
                if user:
                    user.role = 'Colaborador Premium'
                    db.session.commit()
                    return "OK", 200
            except Exception as e:
                db.session.rollback()
                return f"Error updating user: {str(e)}", 500
                
    return "Status not updated", 200

@payment_bp.route('/status/<token>', methods=['GET'])
def get_payment_status(token):
    """
    Polling endpoint for frontend to check if a payment was successful.
    This acts as a fallback for webhooks on localhost.
    """
    if not token or token == 'undefined':
        return jsonify({"error": "Invalid token"}), 400
        
    flow = FlowClient()
    try:
        logger.info(f"Checking status for token: {token}")
        status_data = flow.get_payment_status(token)
        
        if "error" in status_data:
            logger.error(f"Flow error for token {token}: {status_data['error']}")
            return jsonify({"status": "error", "message": status_data['error']}), 400
            
        status = status_data.get('status')
        
        # Status 2 = Pagado
        if status == 2:
            order_id = status_data.get('commerceOrder', '')
            if order_id.startswith('PREMIUM_'):
                try:
                    user_id = int(order_id.split('_')[1])
                    user = User.query.get(user_id)
                    if user and user.role != 'Colaborador Premium':
                        user.role = 'Colaborador Premium'
                        db.session.commit()
                        logger.info(f"User {user.email} updated to Premium via Polling")
                except Exception as ex:
                    logger.error(f"Error updating user role: {str(ex)}")

            return jsonify({
                "status": "success",
                "paid": True,
                "role": "Colaborador Premium"
            }), 200
        
        return jsonify({
            "status": "success",
            "paid": False,
            "flow_status": status,
            "message": "Payment pending or not found"
        }), 200
        
    except Exception as e:
        logger.error(f"Critical error checking payment status for {token}: {str(e)}")
        return jsonify({"error": "Internal server error checking payment"}), 500
