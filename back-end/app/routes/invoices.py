#app/routes/invoices.py

from flask import Blueprint, request, jsonify
from app import db
from app.models import Invoice
from flask_login import login_required

invoices_blueprint = Blueprint('invoices', __name__)

@invoices_blueprint.route('/invoices', methods=['POST'])
@login_required
def create_invoice():
    data = request.get_json()
    # Validation
    if not data or not data.get('customer_id') or not data.get('amount'):
        return jsonify({'error': 'Please provide all required fields'}), 400
    try:
        new_invoice = Invoice(
            customer_id=data['customer_id'],
            amount=data['amount']
        )
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@invoices_blueprint.route('/invoices', methods=['GET'])
@login_required
def get_invoices():
    invoices = Invoice.query.all()
    return jsonify([invoice.to_dict() for invoice in invoices]), 200
@invoices_blueprint.route('/invoices/<int:invoice_id>', methods=['GET'])
@login_required
def get_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if invoice:
        return jsonify(invoice.to_dict()), 200
    else:
        return jsonify({'error': 'Invoice not found'}), 404

@invoices_blueprint.route('/invoices/<int:invoice_id>', methods=['PUT'])
@login_required
def update_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if invoice:
        data = request.get_json()
        # Validation
        if not data or not data.get('customer_id') or not data.get('amount'):
            return jsonify({'error': 'Please provide all required fields'}), 400
        try:
            invoice.customer_id = data['customer_id']
            invoice.amount = data['amount']
            db.session.commit()
            return jsonify({'message': 'Invoice updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Invoice not found'}), 404

@invoices_blueprint.route('/invoices/<int:invoice_id>', methods=['DELETE'])
@login_required
def delete_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if invoice:
        try:
            db.session.delete(invoice)
            db.session.commit()
            return jsonify({'message': 'Invoice deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred: ' + str(e)}), 500
    else:
        return jsonify({'error': 'Invoice not found'}), 404



