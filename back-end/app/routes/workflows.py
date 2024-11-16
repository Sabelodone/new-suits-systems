# back-end/app/routes/workflows.py

from flask import Blueprint, request, jsonify
from app.models.workflow import Workflow, WorkflowStep
from app.extentions import db
import logging

workflows_blueprint = Blueprint('workflows', __name__)

@workflows_blueprint.route('', methods=['POST'])
def create_workflow():
    data = request.get_json()
    try:
        if not data or 'name' not in data:
            return jsonify({"error": "Invalid input"}), 400
        workflow = Workflow(name=data['name'])
        workflow.save()
        return jsonify(workflow.to_dict()), 201
    except Exception as e:
        logging.error(f"Error creating workflow: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@workflows_blueprint.route('/<int:workflow_id>/steps', methods=['POST'])
def create_workflow_step(workflow_id):
    data = request.get_json()
    try:
        if not data or 'name' not in data or 'step_order' not in data:
            return jsonify({"error": "Invalid input"}), 400
        step = WorkflowStep(
            workflow_id=workflow_id,
            step_order=data['step_order'],
            name=data['name'],
            requires_payment=data.get('requires_payment', False)
        )
        step.save()
        return jsonify(step.to_dict()), 201
    except Exception as e:
        logging.error(f"Error creating workflow step: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@workflows_blueprint.route('', methods=['GET'])
def get_workflows():
    workflows = Workflow.query.all()
    return jsonify([workflow.to_dict() for workflow in workflows]), 200

@workflows_blueprint.route('/<int:workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        db.session.delete(workflow)
        db.session.commit()
        return jsonify({"message": "Workflow deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting workflow: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@workflows_blueprint.route('/<int:workflow_id>/steps/<int:step_id>', methods=['DELETE'])
def delete_workflow_step(workflow_id, step_id):
    try:
        step = WorkflowStep.query.filter_by(workflow_id=workflow_id, id=step_id).first()
        if not step:
            return jsonify({"error": "Workflow step not found"}), 404
        db.session.delete(step)
        db.session.commit()
        return jsonify({"message": "Workflow step deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting workflow step: {str(e)}")
        return jsonify({"error": "Server error"}), 500

