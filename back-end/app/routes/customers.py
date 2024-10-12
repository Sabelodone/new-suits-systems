#app/routes/customers.py

from flask import Blueprint, request, jsonify
from app import db
from app.models import Customer
from flask_login import login_required

customers_blueprint = Blueprint('customers', __name__)

@customers_blueprint.route('/customers', methods=['POST'])
@login_required
def create_customer():
    data = request.get_json()
    # Validation
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    try:
        new_customer = Customer(
            name=data['name'],
            email=data['email']
        )
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({'message': 'Customer created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@customers_blueprint.route('/customers', methods=['GET'])
@login_required
def get_customers():
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers]), 200

@customers_blueprint.route('/customers/<int:customer_id>', methods=['GET'])
@login_required
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if customer:
        return jsonify(customer.to_dict()), 200
    else:
        return jsonify({'error': 'Customer not found'}), 404

@customers_blueprint.route('/customers/<int:customer_id>', methods=['PUT'])
@login_required
def update_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if customer:
        data = request.get_json()
        # Validation
        if not data or not data.get('name') or not data.get('email'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        try:
            customer.name = data['name']
            customer.email = data['email']
            db.session.commit()
            return jsonify({'message': 'Customer updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Customer not found'}), 404

@customers_blueprint.route('/customers/<int:customer_id>', methods=['DELETE'])
@login_required
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if customer:
        try:
            db.session.delete(customer)
            db.session.commit()
            return jsonify({'message': 'Customer deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Customer not found'}), 404


