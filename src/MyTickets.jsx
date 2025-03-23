import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged } from './firebase'; 
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MyTickets.css';
import NavBar from './Components/NavBar';
import EventsDetails from './EventDetails';


const MyTickets = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null); 
  const [isPopupOpen, setIsPopupOpen] = useState(false); 

  const handleCardClick = (eventId) => {
    setSelectedEventId(eventId); 
    setIsPopupOpen(true); 
  };
  const handleClosePopup = () => {
    setSelectedEventId(null);
    setIsPopupOpen(false); 
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('No user logged in, redirecting to login.');
        navigate('/LoginForm');
      } else {
        console.log('Logged-in user email:', user.email);

        try {
          const userQuery = query(
            collection(db, 'users'),
            where('email', '==', user.email)
          );
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            console.log('Fetched user document:', userData);

            setAccountType(userData.accountType);
          } else {
            console.warn('User document not found.');
          }

          const joinedQuery = query(
            collection(db, 'joinedEvents'),
            where('email', '==', user.email)
          );
          const joinedSnapshot = await getDocs(joinedQuery);

          if (!joinedSnapshot.empty) {
            const joinedEventIds = joinedSnapshot.docs
              .map((doc) => doc.data().eventsJoined)
              .flat(); 
          
            console.log('Joined event IDs:', joinedEventIds);
          
            try {
              const eventPromises = joinedEventIds.map(async (eventId) => {
                const eventDoc = await getDoc(doc(db, 'events', eventId)); 
                return eventDoc.exists() ? { id: eventId, ...eventDoc.data() } : null; 
              });
          
              const eventDetails = await Promise.all(eventPromises);
              setEvents(eventDetails.filter((event) => event !== null)); 
            } catch (error) {
              console.error('Error fetching event details:', error);
              setEvents([]); 
            }
          } else {
            console.warn('No joined events found for this user.');
            setEvents([]);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setEvents([]);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tickets">
      <NavBar accountType={accountType} />
      <div className="description">
        <h1>My Tickets</h1>
      </div>
        <div className="ticketsList">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="ticketRow"
                onClick={() => handleCardClick(event.id)}
              >
                <div className="ticketTitle">
                  <h3>{event.title}</h3>
                </div>
                <div className="ticketContent">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="ticketImage"
                    />
                  )}
                <div className="ticketInfo">
                  <p>Time: {event.time}</p>
                  <p>Location: {event.location}</p>
                  <p>Description: {event.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No tickets found.</p>
        )}
      </div>
      {isPopupOpen && selectedEventId && (
        <EventsDetails eventId={selectedEventId} onClose={handleClosePopup} isMyTicketsPage={true} />
      )}
    </div>
  );
};

export default MyTickets;