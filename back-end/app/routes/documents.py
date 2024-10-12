#app/routes/documents.py

from flask import Blueprint, request, jsonify
from app import db
from app.models import Document
from flask_login import login_required

documents_blueprint = Blueprint('documents', __name__)

@documents_blueprint.route('/documents', methods=['POST'])
@login_required
def create_document():
    data = request.get_json()
    # Validation
    if not data or not data.get('file_name') or not data.get('file_content'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    try:
        new_document = Document(
            file_name=data['file_name'],
            file_content=data['file_content']
        )
        db.session.add(new_document)
        db.session.commit()
        return jsonify({'message': 'Document created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@documents_blueprint.route('/documents', methods=['GET'])
@login_required
def get_documents():
    documents = Document.query.all()
    return jsonify([document.to_dict() for document in documents]), 200


@documents_blueprint.route('/documents/<int:document_id>', methods=['GET'])
@login_required
def get_document(document_id):
    document = Document.query.get(document_id)
    if document:
        return jsonify(document.to_dict()), 200
    else:
        return jsonify({'error': 'Document not found'}), 404

@documents_blueprint.route('/documents/<int:document_id>', methods=['PUT'])
@login_required
def update_document(document_id):
    document = Document.query.get(document_id)
    if document:
        data = request.get_json()
        # Validation
        if not data or not data.get('file_name') or not data.get('file_content'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        try:
            document.file_name = data['file_name']
            document.file_content = data['file_content']
            db.session.commit()
            return jsonify({'message': 'Document updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Document not found'}), 404

@documents_blueprint.route('/documents/<int:document_id>', methods=['DELETE'])
@login_required
def delete_document(document_id):
    document = Document.query.get(document_id)
    if document:
        try:
            db.session.delete(document)
            db.session.commit()
            return jsonify({'message': 'Document deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Document not found'}), 404

