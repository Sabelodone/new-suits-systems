# app/routes/events.py

from flask import Blueprint, jsonify, request
from app import db
from app.models.event import Event
from flask_login import login_required
from datetime import datetime
from dateutil import parser #converting time format

events_blueprint = Blueprint('events', __name__)

@events_blueprint.route('', methods=['GET'])
# @login_required
def get_events():
    try:
        events = Event.query.all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        print(f"Error fetching events: {e}")  # Error logging on the server
        return jsonify({'error': 'Unable to fetch events'}), 500

@events_blueprint.route('', methods=['POST'])
# @login_required
def create_event():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('start_time') or not data.get('end_time'):
        return jsonify({'error': 'Please provide all required fields'}), 400

    try:
        # Convert strings to datetime objects
        start_time = parser.isoparse(data['start_time'])  # converting start time
        end_time = parser.isoparse(data['end_time'])      # converting end time

        print(f"Parsed start_time: {start_time}, Parsed end_time: {end_time}")  # Log parsed times

        new_event = Event(
            title=data['title'],
            start_time=start_time,
            end_time=end_time
        )

        print(f"Parsed start_time: {start_time}, Parsed end_time: {end_time}")
        
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201

    except ValueError as ve:
        print(f"ValueError: {ve}")  # Log parsing issues
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        print(f"Error creating event: {e}")  # Error logging on the server
        return jsonify({'error': 'Unable to create event'}), 500

