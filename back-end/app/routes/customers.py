# app/routes/customers.py

from flask import Blueprint, request, jsonify
from app import db
from app.models.client import Client
from flask_login import login_required

customers_blueprint = Blueprint('customers', __name__)

@customers_blueprint.route('', methods=['POST'])
# @login_required
def create_customer():
    data = request.get_json()
    # Validation
    if not data or not data.get('first_name') or not data.get('email') or not data.get('national_id'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    
    try:
        new_customer = Client(
            first_name=data['first_name'],
            last_name=data.get('last_name'),  # optional
            middle_name=data.get('middle_name'),  # optional
            email=data['email'],
            national_id=data['national_id'],
            gender_id=data.get('gender_id'),  # Ensure this field is provided in the request
            birthdate=data.get('birthdate')  # optional
        )
        db.session.add(new_customer)  # Add new customer to session
        db.session.commit()  # Commit the session
        return jsonify({'message': 'Customer created successfully', 'id': new_customer.id}), 201
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@customers_blueprint.route('', methods=['GET'])
# @login_required
def get_customers():
    customers = Client.query.all()  # Retrieve all customers
    return jsonify([customer.to_dict() for customer in customers]), 200

@customers_blueprint.route('/<string:customer_id>', methods=['GET'])
# @login_required
def get_customer(customer_id):
    customer = Client.query.get(customer_id)  # Use the id directly since it's a string
    if customer:
        return jsonify(customer.to_dict()), 200
    else:
        return jsonify({'error': 'Customer not found'}), 404

@customers_blueprint.route('/<string:customer_id>', methods=['PUT'])
@login_required
def update_customer(customer_id):
    customer = Client.query.get(customer_id)  # Use the id directly since it's a string
    if customer:
        data = request.get_json()
        # Validation
        if not data or not data.get('first_name') or not data.get('email') or not data.get('national_id'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        
        try:
            for key, value in data.items():
                setattr(customer, key, value)  # Update each field
            db.session.commit()  # Commit the session
            return jsonify({'message': 'Customer updated successfully'}), 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Customer not found'}), 404

@customers_blueprint.route('/<string:customer_id>', methods=['DELETE'])
@login_required
def delete_customer(customer_id):
    customer = Client.query.get(customer_id)  # Use the id directly since it's a string
    if customer:
        try:
            db.session.delete(customer)  # Delete the customer
            db.session.commit()  # Commit the session
            return jsonify({'message': 'Customer deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Customer not found'}), 404

