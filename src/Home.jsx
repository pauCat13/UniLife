import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged } from './firebase'; // Import from firebase.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
/**
 *Import components from 'Components' folder. 
 *All components that are building blocks are kept in a separate folder for neatness
 *All files that contain pages for the app are in 'src' folder.
*/

import NavBar from './Components/NavBar';
import SearchBar from './Components/SearchBar';
import TypeSearchHome from './Components/TypeSearchHome';
import EventGrid from './Components/EventGridDiscover';

// Import CSS file for looks
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);
  //State to store fetched events
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();


  //Fetch user account type on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('No user logged in, redirecting to login.');
        navigate('/LoginForm');
      } else {
        console.log('Logged-in user email:', user.email);

        try {
          // Create a query to search for the document by the email field
          const q = query(
            collection(db, 'users'),  // The "users" collection
            where('email', '==', user.email)  // Search for matching email
          );

          // Get documents that match the query
          const querySnapshot = await getDocs(q);

          // Check if any documents were returned
          if (!querySnapshot.empty) {
            // Since emails are unique, we can safely get the first document
            const userDoc = querySnapshot.docs[0];
            const accountType = userDoc.data().accountType;
            console.log('Fetched accountType:', accountType);
            setAccountType(accountType);
          } else {
            console.warn('User document not found.');
            setAccountType(null);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setAccountType(null);
        }
      }

      setLoading(false);
    });

  
    return () => unsubscribe();
  }, [navigate]);

  //Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched events:', eventsList);
        //Update state with fetched events
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator
  }


  return (
    <div className="home">
      {/* Navbar as Header */}
      <NavBar accountType={accountType} />
      <div className="description">
        {/* Title */}
        <h1>Discover</h1>
      </div>
       {/* Searching mechanisms */}
      <span className="search-header">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <TypeSearchHome selectedType={selectedType} setSelectedType={setSelectedType} />
      </span>
      {/* Event Grid Section where Event Cards are shown*/}
      <EventGrid searchQuery={searchQuery} selectedType={selectedType} events={events} />
    </div>
  );
};

export default Home;
