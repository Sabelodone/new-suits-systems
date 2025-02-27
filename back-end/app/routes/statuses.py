from flask import Blueprint, request, jsonify
from app.models.workflow_status import WorkflowStatus
from app.extentions import db

statuses_blueprint = Blueprint('statuses', __name__)

@statuses_blueprint.route('', methods=['POST'])
def create_status():
    data = request.get_json()
    status = WorkflowStatus(name=data['name'], workflow_id=data['workflow_id'])
    db.session.add(status)
    db.session.commit()
    return jsonify(status.to_dict()), 201

@statuses_blueprint.route('/<int:workflow_id>', methods=['GET'])
def get_statuses(workflow_id):
    statuses = WorkflowStatus.query.filter_by(workflow_id=workflow_id).all()
    return jsonify([status.to_dict() for status in statuses]), 200
