import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged } from './firebase'; // Import from firebase.js
import { collection, query, where, setDoc, getDoc, doc, getDocs } from 'firebase/firestore';
import './EventDetails.css';

const EventsDetails = ({ eventId, onClose ,isMyTicketsPage  }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
      const fetchEventDetails = async () => {
        try {
          const eventDoc = await getDoc(doc(db, 'events', eventId));
          if (eventDoc.exists()) {
            setEvent({ id: eventId, ...eventDoc.data() });
          } else {
            console.warn('Event not found');
            setEvent(null);
          }
        } catch (error) {
          console.error('Error fetching event details:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchEventDetails();
    }, [eventId]);
  

  // Get the logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

    // Block scrolling when the popup is open
  useEffect(() => {
    document.body.classList.add('no-scroll'); // Add class to body

    const checkIfUserJoined = async () => {
      if (userEmail) {
        const q = query(collection(db, 'joinedEvents'), where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          // If the event is in the eventsJoined array, set hasJoined to true
          if (userData.eventsJoined && userData.eventsJoined.includes(eventId)) {
            setHasJoined(true);
          }
        }
      }
    };

    checkIfUserJoined();

    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('no-scroll'); // Remove class from body
    };
  }, [userEmail, eventId]);

  const handleJoinEvent = async () => {
    if (!userEmail) {
      alert('Please log in to join the event.');
      return;
    }
  
    try {
      // Query the "joinedEvents" collection for a document where email matches the logged-in user's email
      const q = query(collection(db, 'joinedEvents'), where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If a document is found with the matching email
        const userDoc = querySnapshot.docs[0]; // Assuming there's only one document with that email
        const userData = userDoc.data();
  
        // Check if the user has already joined the event
        if (userData.eventsJoined && userData.eventsJoined.includes(eventId)) {
          alert('You have already joined this event.');
        } else {
          // Update the eventsJoined array to include the new eventId
          await setDoc(userDoc.ref, {
            eventsJoined: [...userData.eventsJoined, eventId], // Append the new eventId
          }, { merge: true });
  
          setHasJoined(true);
          alert('Event joined successfully!');
        }
      } else {
        // If no document is found for the user, create a new document with email and eventsJoined
        const newUserDocRef = doc(collection(db, 'joinedEvents'));
        await setDoc(newUserDocRef, {
          email: userEmail,
          eventsJoined: [eventId], // Add the first event to the eventsJoined array
        });
  
        setHasJoined(true);
        alert('Event joined successfully!');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join the event. Please try again.');
    }
  };


    if (loading) {
        return <div>Loading...</div>; // Display a loading indicator
      }

    if (!event) {
        return (
          <div className="popup">
            <p>Event not found.</p>
            <button className="popup-close-btn" onClick={onClose}>Close</button>
          </div>
        );
      }
    

  return (
  <div className="container2">
    <div className="popup">
      <div className="popup-content">
        <h2>{event.title}</h2>
    <p>Host: {event.host}</p>
    {/* Event image */}
    <div className="image-container">
      <img src={event.image} alt={event.title} />
    </div>
    {/* Event description */}
    <p>Description: {event.longDescription}</p>
    <div className="event-information">
      <p>Date: {event.date}</p>
      <p>Time: {event.time}</p>
      <p>Location: {event.location}</p>
    </div>
    <div className="buttonsContainer">
      {isMyTicketsPage ? (
        <button onClick={onClose} className="back-btn">
          Back
        </button>
      ) : (
        <>
          <button onClick={onClose} className="back-btn">
            Back
          </button>
          <button
            onClick={handleJoinEvent}
            className="buy-ticket-btn"
            disabled={hasJoined}
          >
            {hasJoined ? "Joined" : "Buy Ticket"}
          </button>
        </>
      )}
    </div>
  </div>
</div>

  </div>
  );
};

export default EventsDetails;
