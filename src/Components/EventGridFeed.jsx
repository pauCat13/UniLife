import React, { useState } from 'react';
//Import CSS file for looks.
import './EventGridFeed.css';
import EventsDetails from '../EventDetails';

/**
 *Functional component Events; 
 * TEMPORARY - will be pulled from database collection
 * Dynamically displays events 
 */ 


/**
 * Functional component EventGrid; 
 * Shows a grid of all offered events as event cards
 * Will map the events according to query search
 */
const EventGrid = ({ events = [], searchQuery = '', selectedType = ''}) => {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const filteredEvents = events.filter((event) => {
    // Combine title with tags to create a searchable array
    const searchableTags = [...(event.tags || []), event.title?.toLowerCase() || ''];
    // Check if event matches the search query
    const matchesSearch = searchableTags.some((tag) => tag.includes(searchQuery.toLowerCase()));

      // Match selected type to hostAccountType
      let matchesType = true;
      if (selectedType === 'Society Event') {
        matchesType = event.hostAccountType === 'Society';
      } else if (selectedType === 'Student Led') {
        matchesType = event.hostAccountType === 'Student';
      } else if (selectedType === 'SU Event') {
        matchesType = event.hostAccountType === 'Union';
      }
    return matchesSearch & matchesType;
  });
  
  const handleCardClick = (eventId) => {
    setSelectedEventId(eventId); // Save the selected event ID
    setIsPopupOpen(true); // Open the popup
  };

  const handleClosePopup = () => {
    setSelectedEventId(null); // Clear the selected event ID
    setIsPopupOpen(false); // Close the popup
  };


  return (
    <div className="container">
      <div className="grid">
        {filteredEvents.length > 0 ? (filteredEvents.map((event) => ( //Use event filtering when mapping and update
          // Ensure eventId is unique && exists
          <div key={event.id} onClick={() => handleCardClick(event.eventId)} className="eventCard">
            {event.image && (
            <img src={event.image} alt={event.title} className="eventImage" /> )}
            <h3>{event.title}</h3>
            <p>Host: {event.host}</p>
            <p>Description: {event.description}</p>
            <p>Type: {event.hostAccountType}</p>
          </div>
        ))
      ) : (
        <p>No events found matching your search criteria.</p>
      )}
      </div>
      {/*ONLY OPEN POPUP IF CLICKED*/}
      {isPopupOpen && selectedEventId && (
        <EventsDetails eventId={selectedEventId} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default EventGrid;
