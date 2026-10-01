from app.extensions import db
from app.models.all_models import User
from werkzeug.security import generate_password_hash, check_password_hash

class UserService:
    def register_user(self, user_data):
        email = user_data.get('email')
        password = user_data.get('password')
        first_name = user_data.get('firstName') or user_data.get('first_name')
        last_name = user_data.get('lastName') or user_data.get('last_name')
        region = user_data.get('region')

        if not email or not email.strip():
            raise Exception("El correo es requerido")
        if '@' not in email:
            raise Exception("Formato de correo no válido")
        if not password or len(password.strip()) < 6:
            raise Exception("La contraseña debe tener al menos 6 caracteres")
        if not first_name or not first_name.strip():
            raise Exception("El nombre es requerido")
        if not last_name or not last_name.strip():
            raise Exception("El apellido es requerido")
        if not region or not region.strip():
            raise Exception("La región es requerida")

        if User.query.filter_by(email=email).first():
            raise Exception("El correo ya está registrado")
        
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            region=user_data.get('region'),
            email=user_data.get('email'),
            password_hash=generate_password_hash(user_data.get('password')),
            role=user_data.get('role', 'Colaborador Gratis'),
            avatar_url=user_data.get('avatarUrl') or user_data.get('avatar_url')
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user

    def authenticate(self, email, password):
        if not email or not password:
            raise Exception("Se requiere correo y contraseña")

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            return user
        raise Exception("Credenciales inválidas")

    def get_all_users(self):
        return User.query.all()

    def get_user_by_id(self, user_id):
        return User.query.get(user_id)


    def update_user(self, user_id, user_data):
        user = User.query.get(user_id)
        if not user:
            raise Exception("User not found")
        
        # Handle both camelCase and snake_case
        if 'firstName' in user_data:
            user.first_name = user_data['firstName']
        elif 'first_name' in user_data:
            user.first_name = user_data['first_name']
            
        if 'lastName' in user_data:
            user.last_name = user_data['lastName']
        elif 'last_name' in user_data:
            user.last_name = user_data['last_name']
            
        if 'region' in user_data:
            user.region = user_data['region']
        if 'email' in user_data:
            existing = User.query.filter_by(email=user_data['email']).first()
            if existing and existing.id != user.id:
                raise Exception("Email already in use")
            user.email = user_data['email']
        if 'role' in user_data:
            user.role = user_data['role']
        if 'password' in user_data and user_data['password']:
            user.password_hash = generate_password_hash(user_data['password'])
            
        if 'avatarUrl' in user_data:
            user.avatar_url = user_data['avatarUrl']
        elif 'avatar_url' in user_data:
            user.avatar_url = user_data['avatar_url']

        db.session.commit()
        return user

    def delete_user(self, user_id):
        user = User.query.get(user_id)
        if not user:
            raise Exception("User not found")
        db.session.delete(user)
        db.session.commit()
