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
import SocietiesGrid from './Components/SocietiesGrid';

//Import CSS file for looks.
import './ListSocieties.css';

/**
 *Functional component ListSocieties; 
 * Page that shows the different societies that can be joined. 
 * Search bar can be used to find societies quicker.
 * When society card is clicked, it will redirect you to the society's profile.
 */

const ListSocieties = () => {
  // Reference to use 'useState' to pass on queries https://react.dev/reference/react/useState
  const [searchQuery, setSearchQuery] = useState('');
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [societies, setSocieties] = useState([]);

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

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const societySnapshot = await getDocs(collection(db, 'societies'));
        const societies = [];
  
        for (const doc of societySnapshot.docs) {
          const society = { id: doc.id, ...doc.data() };
  
          // Fetch the user document to get the image
          const userQuery = query(
            collection(db, 'users'),
            where('email', '==', society.email) // Match email to fetch user data
          );
          const userSnapshot = await getDocs(userQuery);
  
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0]; // Fetch the first matching document
            society.image = userDoc.data().image; // Add image to the society object
          } else {
            society.image = ''; // Fallback in case no image is found
          }
  
          societies.push(society);
        }
  
        console.log('Fetched societies with images:', societies);
        setSocieties(societies);
      } catch (error) {
        console.error('Error fetching societies:', error);
      }
    };
  
    fetchSocieties();
  }, []);
  

  if (loading) {
    return <div>Loading...</div>; // Display a loading indicator
  }

  return (
    <div className="listsocieties">
      {/* Navbar as Header */}
      <NavBar accountType={accountType} />
      <div className="description">
        {/* Title */}
        <h1>Societies</h1>
      {/* Search bar and societies grid. */}
      </div>
      <span className="header">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
      </span>
      <SocietiesGrid searchQuery={searchQuery} societies={societies}/>
    </div>
  );
};

export default ListSocieties;
