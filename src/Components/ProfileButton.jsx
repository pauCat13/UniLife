import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import Firebase Auth and Firestore
import { doc, getDoc } from 'firebase/firestore';
import './ProfileButton.css';

const ProfileButton = () => {
  const navigate = useNavigate();
  const [profilePath, setProfilePath] = useState(null); // Store the dynamic profile path

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          // Fetch the user's document from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            // Determine the profile path based on account type
            let path = '';
            if (userData.accountType === 'Student' && userData.studentNumber) {
              path = `MyProfile/${userData.studentNumber}`;
            } else if (userData.accountType === 'Society' && userData.societyId) {
              path = `MyProfile/${userData.societyId.toUpperCase()}`;
            } else if (userData.accountType === 'Union' && userData.name) {
              path = `MyProfile/${userData.name.replace(/\s+/g, '-')}`; 
            } else {
              console.error('Unable to determine profile path.');
            }

            setProfilePath(path);
          } else {
            console.error('User document does not exist.');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSwitch = () => {
    if (profilePath) {
      navigate(`/${profilePath}`); // Navigate to the determined profile path
    } else {
      alert('Unable to navigate to profile. Please try again.');
    }
  };

  return (
    <div className="ProfileButton-container">
      <button className="ProfileButton" onClick={handleSwitch} disabled={!profilePath}>
        <span className="ProfileButton-text">MyProfile</span>
      </button>
    </div>
  );
};

export default ProfileButton;
