# app/routes/documents.py

from flask import Blueprint, request, jsonify
from app import db
from app.models.document import Document
from flask_login import login_required
import base64

documents_blueprint = Blueprint('documents', __name__)

@documents_blueprint.route('', methods=['POST'])
#@login_required  # Uncomment if login is required for document creation
def create_document():
    data = request.get_json()
    print(f'Data received: {data}') # Log the incoming data
    
    # Validation
    if not data or not data.get('file_name') or not data.get('file_content'):
        return jsonify({'error': 'Please provide all required fields'}), 400


    try:
       # Decode the file content from base64
       # Extract the base64 string from the data
       # Check if 'file_content' exists and log the content
       base64_content = data.get('file_content', None)
       if base64_content is None:
           return jsonify({"error": "file_content is missing"}), 400

       # Log the length of the base64 content for debugging
       print(f"Base64 content length: {len(base64_content)}")
       #base64_content = data.get('file_content', '')

       # Adjust padding if necessary
       missing_padding = len(base64_content) % 4
       if missing_padding:
           base64_content += '=' * (4 - missing_padding)

       # Now decode the base64 content
       file_content = base64.b64decode(base64_content)

       # Create a new Document instance
       new_document = Document(
            file_name=data['file_name'],
            file_content=file_content
            # Add additional fields if required
            # case_id=data.get('case_id'),
            # document_type_id=data.get('document_type_id'),
            # document_status_id=data.get('document_status_id')
        )
       # Add the document to the session and commit
       db.session.add(new_document)
       db.session.commit()

       return jsonify({'message': 'Document created successfully'}), 201
    except Exception as e:
        db.session.rollback()  # Roll back the session on error
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@documents_blueprint.route('', methods=['GET'])
#@login_required  # Uncomment if login is required for retrieving documents
def get_documents():
    documents = Document.query.all()
    return jsonify([document.to_dict() for document in documents]), 200

@documents_blueprint.route('/<int:document_id>', methods=['GET'])
#@login_required
def get_document(document_id):
    document = Document.query.get(document_id)
    if document:
        return jsonify(document.to_dict()), 200
    else:
        return jsonify({'error': 'Document not found'}), 404

@documents_blueprint.route('/<int:document_id>', methods=['PUT'])
#@login_required
def update_document(document_id):
    document = Document.query.get(document_id)
    if document:
        data = request.get_json()
        
        # Validation
        if not data or not data.get('file_name') or not data.get('file_content'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        
        try:
            document.file_name = data['file_name']
            document.file_content = base64.b64decode(data['file_content'])  # Decode the content
            db.session.commit()
            return jsonify({'message': 'Document updated successfully'}), 200
        except Exception as e:
            db.session.rollback()  # Roll back the session on error
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Document not found'}), 404

@documents_blueprint.route('/<int:document_id>', methods=['DELETE'])
#@login_required
def delete_document(document_id):
    document = Document.query.get(document_id)
    if document:
        try:
            db.session.delete(document)
            db.session.commit()
            return jsonify({'message': 'Document deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()  # Roll back the session on error
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Document not found'}), 404

