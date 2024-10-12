#app/routes/payments.py

from flask import Blueprint, request, jsonify
from app import db
from app.models import Payment
from flask_login import login_required

payments_blueprint = Blueprint('payments', __name__)

@payments_blueprint.route('/payments', methods=['POST'])
@login_required
def create_payment():
    data = request.get_json()
    # Validation
    if not data or not data.get('invoice_id') or not data.get('amount'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    try:
        new_payment = Payment(
            invoice_id=data['invoice_id'],
            amount=data['amount']
        )
        db.session.add(new_payment)
        db.session.commit()
        return jsonify({'message': 'Payment created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@payments_blueprint.route('/payments', methods=['GET'])
@login_required
def get_payments():
    payments = Payment.query.all()
    return jsonify([payment.to_dict() for payment in payments]), 200

@payments_blueprint.route('/payments/<int:payment_id>', methods=['GET'])
@login_required
def get_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment:
        return jsonify(payment.to_dict()), 200
    else:
        return jsonify({'error': 'Payment not found'}), 404

@payments_blueprint.route('/payments/<int:payment_id>', methods=['PUT'])
@login_required
def update_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment:
        data = request.get_json()
        # Validation
        if not data or not data.get('invoice_id') or not data.get('amount'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        try:
            payment.invoice_id = data['invoice_id']
            payment.amount = data['amount']
            db.session.commit()
            return jsonify({'message': 'Payment updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Payment not found'}), 404

@payments_blueprint.route('/payments/<int:payment_id>', methods=['DELETE'])
@login_required
def delete_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment:
        try:
            db.session.delete(payment)
            db.session.commit()
            return jsonify({'message': 'Payment deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Payment not found'}), 404

