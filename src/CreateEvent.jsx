import React, { useState, useEffect } from 'react';
import { createEvent } from './EventFunctions';
import { auth, onAuthStateChanged } from './firebase';
import { useNavigate } from "react-router-dom";
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState({
    title: '',
    type: '',
    description: '',
    longDescription: '',
    date: '',
    time: '',
    location: '',
    host: '',
    tags: '',
    image: '',
  });

  const [user, setUser] = useState(null); // Current user
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Fetch current user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log('Logged-in user:', currentUser.email);
      } else {
        setUser(null);
        console.warn('No user logged in.');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to create an event.');
      return;
    }

    try {
      setLoading(true);

      // Prepare event data
      const eventData = {
        ...eventDetails,
        host: user.email,
        createdAt: new Date().toISOString(),
        tags: eventDetails.tags.split(',').map((tag) => tag.trim()),
      };

      // Call createEvent function to handle backend logic
      const eventId = await createEvent(eventData);

      console.log('Event created successfully:', eventId);
      alert('Event created successfully!');
      navigate("/Home");


    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-wrapper">
      <div className="create-event-card">
         <div className="backArrow" onClick={() => navigate('/Home')}>
          ←
        </div>
        <h2>Create Event</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Event Title */}
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter event title"
              value={eventDetails.title}
              onChange={handleChange}
              required
            />
          </div>


          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Short description"
              value={eventDetails.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Long Description */}
          <div className="form-group">
            <label>Long Description</label>
            <textarea
              name="longDescription"
              placeholder="Detailed description"
              value={eventDetails.longDescription}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={eventDetails.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Time */}
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={eventDetails.time}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter event location"
              value={eventDetails.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="Tags (comma-separated)"
              value={eventDetails.tags}
              onChange={handleChange}
            />
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={eventDetails.image}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
