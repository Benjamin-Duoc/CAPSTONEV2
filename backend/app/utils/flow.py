import hmac
import hashlib
import requests
import logging
from flask import current_app

logger = logging.getLogger(__name__)

class FlowClient:
    def __init__(self):
        self.api_key = current_app.config.get('FLOW_API_KEY')
        self.secret_key = current_app.config.get('FLOW_SECRET_KEY')
        self.api_url = current_app.config.get('FLOW_API_URL')

    def is_configured(self):
        return all([self.api_key, self.secret_key, self.api_url])

    def generate_signature(self, params):
        if not self.secret_key:
            raise ValueError("FLOW_SECRET_KEY is not configured")
            
        # 1. Sort parameters alphabetically by key
        sorted_keys = sorted(params.keys())
        
        # 2. Concatenate key and value (ensure values are stringified)
        to_sign = "".join(f"{key}{params[key]}" for key in sorted_keys)
        
        logger.debug(f"String to sign: {to_sign}")
        
        # 3. Generate HMAC-SHA256
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            to_sign.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return signature

    def create_payment(self, order_id, subject, amount, email, url_return, url_confirmation):
        endpoint = f"{self.api_url}/payment/create"
        
        params = {
            "apiKey": self.api_key,
            "commerceOrder": order_id,
            "subject": subject,
            "amount": amount,
            "email": email,
            "urlReturn": url_return,
            "urlConfirmation": url_confirmation
        }
        
        # Add signature
        params["s"] = self.generate_signature(params)
        
        try:
            response = requests.post(endpoint, data=params, timeout=10)
            res_json = response.json()
            if response.status_code != 200:
                logger.error(f"Flow API error response: {res_json}")
            return res_json
        except Exception as e:
            logger.exception("Flow API connection failed")
            return {"error": str(e)}

    def get_payment_status(self, token):
        endpoint = f"{self.api_url}/payment/getStatus"
        
        params = {
            "apiKey": self.api_key,
            "token": token
        }
        
        # Add signature
        params["s"] = self.generate_signature(params)
        
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
