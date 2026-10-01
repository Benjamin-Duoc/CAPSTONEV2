from flask import Blueprint, request, jsonify
from app.services.generic_service import GenericService
from .. import db

def create_crud_blueprint(name, model, schema, url_prefix):
    bp = Blueprint(name, __name__, url_prefix=url_prefix)
    service = GenericService(model)
    single_schema = schema()
    list_schema = schema(many=True)

    @bp.route('', methods=['GET'])
    def get_all():
        items = service.get_all()
        return jsonify(list_schema.dump(items))

    @bp.route('/<int:id>', methods=['GET'])
    @bp.route('/<id>', methods=['GET'])
    def get_by_id(id):
        item = service.get_by_id(id)
        if item:
            return jsonify(single_schema.dump(item))
        return jsonify({"error": "Not found"}), 404

    @bp.route('', methods=['POST'])
    def save():
        data = request.get_json()
        try:
            item_id = data.get('id')
            if item_id:
                existing = service.get_by_id(item_id)
                if existing:
                    item = single_schema.load(data, instance=existing, session=db.session, partial=True)
                else:
                    item = single_schema.load(data, session=db.session)
            else:
                item = single_schema.load(data, session=db.session)
            
            db.session.add(item)
            db.session.commit()
            return jsonify(single_schema.dump(item)), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @bp.route('/<int:id>', methods=['PUT', 'PATCH'])
    @bp.route('/<id>', methods=['PUT', 'PATCH'])
    def update(id):
        data = request.get_json()
        item = service.get_by_id(id)
        if not item:
            return jsonify({"error": "Not found"}), 404
        try:
            item = single_schema.load(data, instance=item, session=db.session, partial=True)
            db.session.commit()
            return jsonify(single_schema.dump(item)), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400

    @bp.route('/<int:id>', methods=['DELETE'])
    @bp.route('/<id>', methods=['DELETE'])
    def delete(id):
        if service.delete(id):
            return '', 204
        return jsonify({"error": "Not found"}), 404

    return bp
