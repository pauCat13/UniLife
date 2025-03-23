import React, { useState } from 'react';
import './EventGridDiscover.css';
import EventsDetails from '../EventDetails';

/**
 * Functional component EventGridDiscover
 * Dynamically displays events passed as a prop and filters them based on query and type.
 */
const EventGridDiscover = ({ events = [], searchQuery = '', selectedType = '' }) => {
  const [selectedEventId, setSelectedEventId] = useState(null); // State to hold selected event ID
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to toggle popup visibility
  
  const filteredEvents = events.filter((event) => {
    const searchableTags = [
      ...(event.tags || []), // Ensure tags are handled
      event.title?.toLowerCase() || '', // Searchable by event name
    ];

    // Match search query
    const matchesSearch = searchableTags.some((tag) =>
      tag.includes(searchQuery.toLowerCase())
    );

    // Match selected type to hostAccountType
    let matchesType = true;
    if (selectedType === 'Society Event') {
      matchesType = event.hostAccountType === 'Society';
    } else if (selectedType === 'Student Led') {
      matchesType = event.hostAccountType === 'Student';
    } else if (selectedType === 'SU Event') {
      matchesType = event.hostAccountType === 'Union';
    }

    return matchesSearch && matchesType;
  });

  // When clicked send eventid to popup 
  const handleCardClick = (eventId) => {
    setSelectedEventId(eventId); // Save the selected event ID
    setIsPopupOpen(true); // Open the popup
  };

  //Close properly 
  const handleClosePopup = () => {
    setSelectedEventId(null); // Clear the selected event ID
    setIsPopupOpen(false); // Close the popup
  };

  return (
    <div className="container">
      <div className="grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => ( //Use event filtering when mapping and update 
            <div
              key={event.eventId} // Ensure eventId is unique && exists
              onClick={() => handleCardClick(event.eventId)} // handle click of event card 
              className="eventCard"
            >
              {event.image && <img src={event.image} alt={event.title} className="eventImage" />}
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

export default EventGridDiscover;

