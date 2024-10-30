from flask import Blueprint, request, jsonify
from app.models.workflow import Workflow
from app.extentions import db
import logging

workflows_blueprint = Blueprint('workflows', __name__)

@workflows_blueprint.route('', methods=['POST'])
#@login_requred
def create_workflow():
    data = request.get_json()
    try:
        if not data or 'name' not in data or not isinstance(data['name'], str):
            return jsonify({"error": "Invalid input"}), 400
        workflow = Workflow(name=data['name'])
        db.session.add(workflow)
        db.session.commit()
        return jsonify(workflow.to_dict()), 201
    except Exception as e:
        logging.error(f"Error creating workflow: {str(e)}")
        return jsonify(workflow.to_dict()), 201

@workflows_blueprint.route('', methods=['GET'])
#@login_required
def get_workflows():
    workflows = Workflow.query.all()
    return jsonify([workflow.to_dict() for workflow in workflows]), 200

