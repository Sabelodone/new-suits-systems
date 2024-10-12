#app/routes/users.py

from flask import Blueprint, request, jsonify
from app.models import User, db

users_blueprint = Blueprint('users', __name__)

@users_blueprint.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    user = User(email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@users_blueprint.route('/login', methods=['POST'])
def login_user():
    data = request.get__json()
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({'message': 'User logged in successfully'}), 200
    else:
         return jsonify({'error': 'invalid email or password'}), 401

@users_blueprint.route('/logout', methods=['POST'])
def logout_user():
    return jsonify({'message': 'User logged out successfully'}), 200
