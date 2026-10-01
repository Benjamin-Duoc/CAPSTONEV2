from .. import db
from datetime import datetime, date
from sqlalchemy import Date, DateTime

class GenericService:
    def __init__(self, model):
        self.model = model

    def _normalize_dates(self, data_dict):
        normalized = dict(data_dict or {})

        for column in self.model.__table__.columns:
            key = column.name
            if key not in normalized:
                continue

            value = normalized[key]
            if value in (None, ''):
                continue

            if isinstance(column.type, Date) and not isinstance(value, date):
                if isinstance(value, str):
                    try:
                        normalized[key] = datetime.fromisoformat(value.replace('Z', '+00:00')).date()
                    except ValueError:
                        try:
                            normalized[key] = datetime.strptime(value[:10], '%Y-%m-%d').date()
                        except ValueError:
                            pass

            if isinstance(column.type, DateTime) and isinstance(value, str):
                try:
                    normalized[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except ValueError:
                    pass

        return normalized

    def get_all(self):
        if hasattr(self.model, 'id'):
            return self.model.query.order_by(self.model.id.desc()).all()
        return self.model.query.all()

    def get_by_id(self, id):
        return self.model.query.get(id)

    def save(self, data_dict):
        data_dict = self._normalize_dates(data_dict)
        # Handling the case where ID might be provided (update) or not (create)
        item_id = data_dict.get('id')
        if item_id:
            item = self.model.query.get(item_id)
            if item:
                for key, value in data_dict.items():
                    setattr(item, key, value)
            else:
                item = self.model(**data_dict)
                db.session.add(item)
        else:
            item = self.model(**data_dict)
            db.session.add(item)
        
        db.session.commit()
        return item

    def delete(self, id):
        item = self.model.query.get(id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return True
        return False
