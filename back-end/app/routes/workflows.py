from flask import Blueprint, request, jsonify
from app.models import Workflow, db

workflows_blueprint = Blueprint('workflows', __name__)

@workflows_blueprint.route('', methods=['POST'])
#@login_requred
def create_workflow():
    data = request.get_json()
    workflow = Workflow(name=data['name'])
    db.session.add(workflow)
    db.session.commit()
    return jsonify(workflow.to_dict()), 201

@workflows_blueprint.route('', methods=['GET'])
#@login_required
def get_workflows():
    workflows = Workflow.query.all()
    return jsonify([workflow.to_dict() for workflow in workflows]), 200

