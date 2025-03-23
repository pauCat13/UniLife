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
import EventGrid from './Components/EventGridFeed';

//Import CSS file for looks.
import './MyFeed.css';

/**
 *Functional component MyFeed; 
 * It is the mirror of Home, only difference is that grid is prefiltered with only
 * showing the societies the student has joined. 
 * It shows a header below the navBar containing the title of the page. Below the search bar and the filtering button.
 * Underneath I built an Event grid, showing all event cards for all events in the platform. 
 */
const MyFeed = () => {
  // Reference to use 'useState' to pass on queries https://react.dev/reference/react/useState
  const [searchQuery, setSearchQuery] = useState(''); 
  const [selectedType, setSelectedType] = useState('');
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('No user logged in, redirecting to login.');
        navigate('/LoginForm');
        return;
      }  
      
        console.log('Logged-in user email:', user.email);

        try {
          // Create a query to search for the document by the email field
          const userQuery= query(
            collection(db, 'users'),  // The "users" collection
            where('email', '==', user.email)); // Search for matching email
            // Get documents that match the query
            const userSnapshot = await getDocs(userQuery);
          

          // Check if any documents were returned
          if (!userSnapshot.empty) {
            // Since emails are unique, we can safely get the first document
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            setAccountType(userData.accountType);

            //fetch the subbed profiles
            const subscribedProfiles = userData.subscribedProfiles || [];
            console.log('Subscribed Profiles:', subscribedProfiles);

            if (subscribedProfiles.length > 0){
              //here we fetch events created by subscribed Profiles
              const eventsQuery = query(
                collection(db, 'events'),
                where('host', 'in', subscribedProfiles)
              );
              const eventsSnapshot = await getDocs(eventsQuery);

              const fetchedEvents = eventsSnapshot.docs.map((doc) => ({
                id: doc.id, //Use firestore document ID
                ...doc.data(),
              }));
              setEvents(fetchedEvents);
            } else {
              //no subscriptions
              setEvents([]);
            }
        } else {
          console.warn('User document not found.');
          setAccountType(null);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAccountType(null);
        setEvents([]);
      } 
      finally {
      setLoading(false);
      }

    });

  
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator
  }

  return (
    <div className="MyFeed">
      {/* Navbar as Header */}
      <NavBar accountType={accountType} />
      <div className="description">
        {/* Title */}
        <h1>MyFeed</h1>
      </div>
      {/* Searching mechanisims */}
      <span className="search-header">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
        <TypeSearchHome selectedType={selectedType} setSelectedType={setSelectedType}/>
      </span>
      {/* Event Grid Section where Event Cards are shown*/}
      <EventGrid events = {events} searchQuery={searchQuery} selectedType={selectedType}/>
    </div>
  );
};

export default MyFeed;
