import logging
from flask import Blueprint, request, jsonify
from app import db
from app.models.case import Case, CaseStatusHistory
from app.models.case_type import CaseType
from app.models.workflow import WorkflowStep
from flask_login import login_required

# Configure logging
logging.basicConfig(level=logging.DEBUG)

cases_blueprint = Blueprint('cases', __name__)

@cases_blueprint.route('', methods=['POST'])
#@login_required
def create_case():
    logging.info('Received request to create case') # Log request
    data = request.get_json()
    logging.debug(f'Request data: {data}') # Log data received

    if not all([data.get('title'), data.get('description'), data.get('case_type_id')]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Get first step of the workflow through case type
    case_type = CaseType.query.get(data['case_type_id'])
    if not case_type or not case_type.workflow.steps:
        return jsonify({'error': 'Invalid case type or workflow configuration'}), 400

    new_case = Case(
        title=data['title'],
        description=data['description'],
        case_type_id=data['case_type_id'],
        current_step_id=case_type.workflow.steps[0].id  # Set to first step
    )

    try:
        db.session.add(new_case)
        db.session.commit()
        logging.info(f'Case created successfully: {new_case}')
        return jsonify(new_case.to_dict()), 201
    except Exception as e:
        logging.error(f'Error creating case: {str(e)}')
        return jsonify({'error': str(e)}), 500

@cases_blueprint.route('', methods=['GET'])
#@login_required
def get_cases():
    cases = Case.query.all()
    return jsonify([case.to_dict() for case in cases]), 200

@cases_blueprint.route('/cases/<int:case_id>', methods=['GET'])
@login_required
def get_case(case_id):
    case = Case.query.get(case_id)
    if case:
        return jsonify(case.to_dict()), 200
    else:
        return jsonify({'error': 'Case not found'}), 404

@cases_blueprint.route('/cases/<int:case_id>', methods=['PUT'])
@login_required
def update_case(case_id):
    case = Case.query.get(case_id)
    if case:
        data = request.get_json()
        case.title = data.get('title', case.title)
        case.description = data.get('description', case.description)
        db.session.commit()
        return jsonify({'message': 'Case updated successfully', 'case': case.to_dict()}), 200
    else:
        return jsonify({'error': 'Case not found'}), 404

@cases_blueprint.route('/cases/<int:case_id>', methods=['DELETE'])
@login_required
def delete_case(case_id):
    case = Case.query.get(case_id)
    if case:
        db.session.delete(case)
        db.session.commit()
        return jsonify({'message': 'Case deleted successfully'}), 200
    else:
        return jsonify({'error': 'Case not found'}), 404
    
@cases_blueprint.route('/<string:case_id>/transition', methods=['POST'])
@login_required
def transition_case(case_id):
    try:
        case = Case.query.get_or_404(case_id)
        data = request.get_json()
        
        if not data.get('status_id'):
            return jsonify({'error': 'status_id required'}), 400

        # Get current step and validate status
        current_step = WorkflowStep.query.get(case.current_step_id)
        selected_status = next((s for s in current_step.statuses if s.id == data['status_id']), None)
        
        if not selected_status:
            return jsonify({'error': 'Invalid status for current step'}), 400

        # Record history
        history = CaseStatusHistory(
            case_id=case_id,
            step_id=current_step.id,
            status_id=selected_status.id
        )
        db.session.add(history)

        # Update current step
        case.current_step_id = selected_status.next_step_id
        db.session.commit()

        return jsonify(case.to_dict()), 200
    except Exception as e:
        logging.error(f'Transition error: {str(e)}')
        return jsonify({'error': 'Server error'}), 500

