#app/routes/tasks.py

from flask import Blueprint, request, jsonify
from app import db
from app.models import Task
from flask_login import login_required

tasks_blueprint = Blueprint('tasks', __name__)

@tasks_blueprint.route('/tasks', methods=['POST'])
@login_required
def create_task():
    data = request.get_json()
    # Validation
    if not data or not data.get('title') or not data.get('description'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    try:
        new_task = Task(
            title=data['title'],
            description=data['description']
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@tasks_blueprint.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks]), 200

@tasks_blueprint.route('/tasks/<int:task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    task = Task.query.get(task_id)
    if task:
        return jsonify(task.to_dict()), 200
    else:
        return jsonify({'error': 'Task not found'}), 404
@tasks_blueprint.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.get(task_id)
    if task:
        data = request.get_json()
        # Validation
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        try:
            task.title = data['title']
            task.description = data['description']
            db.session.commit()
            return jsonify({'message': 'Task updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Task not found'}), 404

@tasks_blueprint.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        try:
            db.session.delete(task)
            db.session.commit()
            return jsonify({'message': 'Task deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Task not found'}), 404

