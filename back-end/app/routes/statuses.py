from flask import Blueprint, request, jsonify
from app.models.case_status import CaseStatus
from app.extentions import db

statuses_blueprint = Blueprint('statuses', __name__)

@statuses_blueprint.route('', methods=['POST'])
def create_status():
    data = request.get_json()
    status = CaseStatus(name=data['name'], workflow_id=data['workflow_id'])
    db.session.add(status)
    db.session.commit()
    return jsonify(status.to_dict()), 201

@statuses_blueprint.route('/<int:workflow_id>', methods=['GET'])
def get_statuses(workflow_id):
    statuses = CaseStatus.query.filter_by(workflow_id=workflow_id).all()
    return jsonify([status.to_dict() for status in statuses]), 200

