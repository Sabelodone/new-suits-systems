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

    <div className="container mt-5 time-management-container">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/tasks" className="text-indigo">Tasks</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
        <Nav.Link as={Link} to="/documents" className="text-indigo">Documents</Nav.Link>
      </Nav>

      <h1 className="mb-4 text-center">Schedular</h1>

      {/* Accordion Filter Section */}
      <Accordion>
        <Card>
          <Card.Header>
            <Button
              onClick={toggleAccordion}
              aria-controls="filter-accordion"
              aria-expanded={isOpen}
              variant="light"
              className="d-flex align-items-center"
            >
              Filters {isOpen ? <FaChevronUp className="ms-auto" /> : <FaChevronDown className="ms-auto" />}
            </Button>
          </Card.Header>
          <Accordion.Collapse in={isOpen}>
            <Card.Body id="filter-accordion">
              <Form>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="filterDate">
                      <Form.Label>Filter by Date</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaCalendarAlt /> {/* Icon inside the InputGroup */}
                        </InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group controlId="filterParticipant">
                      <Form.Label>Filter by Participant</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaUser /> {/* Icon inside the InputGroup */}
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Enter participant name"
                          value={filterParticipant}
                          onChange={(e) => setFilterParticipant(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <div className="table-responsive mt-4">
        <Table striped bordered hover className="shadow-sm custom-table">
          <thead className="bg-primary text-white">
            <tr>
              <th>Entry ID</th>
              <th>Task</th>
              <th>Hours Worked</th>
              <th>Date</th>
              <th>Participant</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.task}</td>
                  <td>{renderHoursBadge(entry.hours)}</td>
                  <td>{entry.date}</td>
                  <td>{entry.participant}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No entries found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

 //   <div>
 //     <h1>Time Management</h1>
 //     {loading ? ( // Show loading state
 //       <p>Loading events...</p>
 //     ) : (
 //       <Calendar
 //         localizer={localizer}
 //         events={events}
 //         startAccessor="start"
  //        endAccessor="end"
  //        style={{ height: 500, margin: '50px' }}
 //         selectable
 //         onSelectSlot={handleSelectSlot} // Enable event creation on slot selection
//        />
//      )}

//    </div>
  );
};

export default TimeManagement;

