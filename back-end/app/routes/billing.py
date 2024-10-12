#app/routes/billing.py

from flask import Blueprint, request, jsonify
from app import db
from app.models import Billing

billing_blueprint = Blueprint('billing', __name__)

@billing_blueprint.route('/customers/<int:customer_id>/billing', methods=['POST'])
@login_required
def update_billing(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    data = request.get_json()
    # Validation
    if not data or not data.get('billing_info'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    try:
        customer.billing_info = data['billing_info']
        db.session.commit()
        return jsonify({'message': 'Billing information updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@billing_blueprint.route('/customers/<int:customer_id>/billing', methods=['GET'])
@login_required
def get_billing(customer_id):
    customer = Customer.query.get(customer_id)
    if customer:
        return jsonify({'billing_info': customer.billing_info}), 200
    else:
        return jsonify({'error': 'Customer not found'}), 404


