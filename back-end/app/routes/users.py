# app/routes/users.py

from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.gender import Gender
from app.extentions import db
from flask import session

users_blueprint = Blueprint('users', __name__)

@users_blueprint.route('/api/genders', methods=['GET'])
def get_genders():
    genders = Gender.query.all()
    return jsonify([gender.to_dict() for gender in genders]), 200

@users_blueprint.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    
    if not data.get('email') or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Email, username, and password are required.'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists.'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists.'}), 400

    user = User(
        email=data['email'],
        username=data['username'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        gender_id=data['gender_id']
    )
    user.set_password(data['password'])  # Hash the password
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@users_blueprint.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    print("Received data", data) # For debugging
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        print("User not found.")  # Debugging line
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if user and user.check_password(data['password']):
        session['user_id'] = user.id  # Store user ID in session
        #session['email'] = user.email  # Optionally store the email
        #roles = [role.role.to_dict() for role in user.user_roles]  # Fetch user roles
        return jsonify({'message': 'User logged in successfully', 'email': user.email}), 200 #''''roles': roles'''}), 200
    else:
        print ("Password incorrect.") #Debugging line
        return jsonify({'error': 'Invalid email or password'}), 401

@users_blueprint.route('/logout', methods=['POST'])
def logout_user():
    # Handle logout logic (e.g., clearing session)
    session.clear()  # Clear the session
    return jsonify({'message': 'User logged out successfully'}), 200

