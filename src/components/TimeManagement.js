// TimeManagement

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { addHours } from 'date-fns';
import moment from 'moment'; // Import moment for date formatting

const TimeManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const localizer = momentLocalizer(moment); // Use moment.js for date localization

  const fetchEvents = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const response = await axios.get('http://34.35.32.197/api/events'); // Backend URL API
      const formattedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.start_time), // Ensure date is in Date format
        end: new Date(event.end_time), // Adjust end time as needed
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to load events. Please try again later.'); // User-friendly error message
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectSlot = async ({ start, end }) => {
    const title = prompt('New Event name');
    if (title) {
      try {
        await axios.post('http://34.35.32.197/api/events', {
          title,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        });
        // Refresh events after creating a new one
        fetchEvents();
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.'); // User-friendly error message
      }
    }
  };

  return (
    <div>
      <h1>Time Management</h1>
      {loading ? ( // Show loading state
        <p>Loading events...</p>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, margin: '50px' }}
          selectable
          onSelectSlot={handleSelectSlot} // Enable event creation on slot selection
        />
      )}
    </div>
  );
};

export default TimeManagement;

