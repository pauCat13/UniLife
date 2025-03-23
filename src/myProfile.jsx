import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {onAuthStateChanged } from './firebase'; // Import from firebase.js
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from "firebase/firestore";
import "./myProfile.css";
import NavBar from './Components/NavBar';
import EventsDetails from './EventDetails';

const defaultProfilePic = ""; // Placeholder for a gray circle

function MyProfile({ auth, db }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null); // Logged-in user's data
  const [activeTab, setActiveTab] = useState("Live Events"); // Tab state
  const [accountType, setAccountType] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [showProfilePicOptions, setShowProfilePicOptions] = useState(false);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [descriptionField, setDescriptionField] = useState(""); // For the description
  const [shortDescField, setShortDescField] = useState(""); // For the short description
  
  const [selectedEventId, setSelectedEventId] = useState(null); // State to hold selected event ID
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to toggle popup visibility

  const handleCardClick = (eventId) => {
    setSelectedEventId(eventId); // Save the selected event ID
    setIsPopupOpen(true); // Open the popup
  };

  const handleClosePopup = () => {
    setSelectedEventId(null); // Clear the selected event ID
    setIsPopupOpen(false); // Close the popup
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user logged in, redirecting to login.");
        navigate("/LoginForm");
      } else {
        console.log("Logged-in user email:", user.email);
  
        try {
          const q = query(collection(db, "users"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const fetchedAccountType = userData.accountType;
  
            console.log("Fetched accountType:", fetchedAccountType);
  
            // Ensure `subscribedProfiles` exists
            const initializedData = {
              ...userData,
              subscribedProfiles: userData.subscribedProfiles || [], // Initialize if undefined
            };
  
            setAccountType(fetchedAccountType);
            setLoggedInUser({ id: userDoc.id, uid: user.uid, ...initializedData });
          } else {
            console.warn("User document not found.");
            setAccountType(null);
            setLoggedInUser(null); // Clear loggedInUser if no user document is found
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setAccountType(null);
          setLoggedInUser(null); // Clear loggedInUser on error
        }
      }
  
      setLoading(false); // Ends the loading state
    });
  
    return () => unsubscribe();
  }, [auth, db, navigate]);
  
  

  useEffect(() => {
    const fetchHostedEvents = async () => {
      if (userData && userData.email) {
        try {
          const eventsQuery = query(
            collection(db, "events"),
            where("host", "==", userData.email)
          );
          const querySnapshot = await getDocs(eventsQuery);
          const events = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setHostedEvents(events);
        } catch (error) {
          console.error("Error fetching hosted events:", error);
        }
      }
    };
  
    fetchHostedEvents();
  }, [userData, db]);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
    
      try {
        let userDocSnap = null;
        let data = null;
    
        // Fetch as a Student Profile
        const studentQuery = query(
          collection(db, "users"),
          where("studentNumber", "==", id) // Match by studentNumber
        );
        const studentSnapshot = await getDocs(studentQuery);
    
        if (!studentSnapshot.empty) {
          userDocSnap = studentSnapshot.docs[0];
          data = userDocSnap.data();
        } else {
          // Fetch as a Society Profile
          const societyDocRef = doc(db, "societies", id.toUpperCase());
          const societyDocSnap = await getDoc(societyDocRef);
    
          if (societyDocSnap.exists()) {
            userDocSnap = societyDocSnap;
            data = societyDocSnap.data();
    
            // Fetch the corresponding user document to get the image
            const userQuery = query(
              collection(db, "users"),
              where("email", "==", data.email) // Match by email
            );
            const userSnapshot = await getDocs(userQuery);
    
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              data.image = userData.image || defaultProfilePic; // Merge image from users
            } else {
              console.warn("No corresponding user document found for society.");
              data.image = defaultProfilePic; // Fallback to default
            }
          } else {
            // Fetch as a Union Profile
            const unionName = id.replace(/-/g, " "); // Replace `-` with spaces
            console.log("Fetching union profile with name:", unionName);
    
            const unionQuery = query(
              collection(db, "users"),
              where("accountType", "==", "Union"),
              where("name", "==", unionName)
            );
            const unionSnapshot = await getDocs(unionQuery);
    
            if (!unionSnapshot.empty) {
              const unionDoc = unionSnapshot.docs[0];
              console.log("Union profile found:", unionDoc.data());
              userDocSnap = unionDoc;
              data = unionDoc.data();
            } else {
              console.error("No union profile found for name:", unionName);
            }
          }
        }
    
        if (data) {
          console.log("Fetched user data:", data);
          setUserData(data);
          setProfilePicUrl(data.image || defaultProfilePic); // Update profile picture dynamically
    
          // Determine if this profile belongs to the logged-in user
          auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
              setIsOwnProfile(
                currentUser.email === data.email || currentUser.uid === id
              );
            }
          });
        } else {
          console.error("No matching user, society, or union found.");
          setUserData(null);
          setProfilePicUrl(defaultProfilePic); // Fallback to default
          setIsOwnProfile(false);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchProfileData();
  }, [auth, db, id]); // Include `auth` and `id` in dependencies
  
  
  
  



  const handleProfilePicClick = () => {
    if (isOwnProfile) {
      setShowProfilePicOptions((prev) => !prev);
    }
  };

  const handleSaveProfilePic = async () => {
    if (loggedInUser) {
      try {
        const userDocRef = doc(db, "users", loggedInUser.uid);
        await updateDoc(userDocRef, {
          image: profilePicUrl,
        });
  
        // Update the userData state dynamically
        setUserData((prev) => ({
          ...prev,
          image: profilePicUrl,
        }));
  
        alert("Profile picture updated successfully!");
        setShowProfilePicOptions(false);
      } catch (error) {
        console.error("Error updating profile picture:", error);
      }
    }
  };
  

  const handleRemoveProfilePic = async () => {
    if (loggedInUser) {
      try {
        const userDocRef = doc(db, "users", loggedInUser.uid);
        await updateDoc(userDocRef, {
          image: defaultProfilePic,
        });
  
        // Update the userData state dynamically
        setUserData((prev) => ({
          ...prev,
          image: defaultProfilePic,
        }));
  
        setProfilePicUrl(defaultProfilePic);
        alert("Profile picture removed successfully!");
        setShowProfilePicOptions(false);
      } catch (error) {
        console.error("Error removing profile picture:", error);
      }
    }
  };
  

  const handleFollow = async () => {
    if (loggedInUser && loggedInUser.accountType === "Student") {
      try {
        const userDocRef = doc(db, "users", loggedInUser.id);
        const updatedSubscribedProfiles = [...(loggedInUser.subscribedProfiles || []), userData.email];
  
        await updateDoc(userDocRef, {
          subscribedProfiles: arrayUnion(userData.email),
        });
  
        alert("Followed successfully!");
        setLoggedInUser((prev) => ({
          ...prev,
          subscribedProfiles: updatedSubscribedProfiles, // Safely update subscribedProfiles
        }));
      } catch (error) {
        console.error("Error following profile:", error);
      }
    }
  };
  

  const deleteEvent = async (eventId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "events", eventId)); // Permanently delete the event
        setHostedEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        alert("Event deleted successfully.");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete the event.");
      }
    }
  };


  const handleUnfollow = async (profileEmail) => {
    if (loggedInUser && loggedInUser.accountType === "Student") {
      try {
        const userDocRef = doc(db, "users", loggedInUser.id);
  
        // Update Firestore
        await updateDoc(userDocRef, {
          subscribedProfiles: arrayRemove(profileEmail),
        });
  
        // Update local state
        setLoggedInUser((prev) => ({
          ...prev,
          subscribedProfiles: prev.subscribedProfiles.filter((email) => email !== profileEmail),
        }));
  
        // Update `userData` if viewing own profile
        if (isOwnProfile) {
          setUserData((prev) => ({
            ...prev,
            subscribedProfiles: prev.subscribedProfiles.filter((email) => email !== profileEmail),
          }));
        }
  
        alert("Unfollowed successfully!");
      } catch (error) {
        console.error("Error unfollowing profile:", error);
      }
    }
  };const handleSaveEdit = async () => {
    try {
      if (accountType === "Student") {
        const userDocRef = doc(db, "users", loggedInUser.id);
        await updateDoc(userDocRef, {
          bio: descriptionField,
        });
        setUserData((prev) => ({
          ...prev,
          bio: descriptionField,
        }));
      } else if (accountType === "Society") {
        if (descriptionField.length > 250) {
          alert("Description cannot exceed 250 characters!");
          return;
        }
        if (shortDescField.length > 50) {
          alert("Short Description cannot exceed 50 characters!");
          return;
        }
        const societyDocRef = doc(db, "societies", userData.societyId);
        await updateDoc(societyDocRef, {
          description: descriptionField,
          shortDescription: shortDescField,
        });
        setUserData((prev) => ({
          ...prev,
          description: descriptionField,
          shortDescription: shortDescField,
        }));
      }
      alert("Profile updated successfully!");
      setShowEditPopup(false);
    } catch (error) {
      console.error("Error saving profile changes:", error);
      alert("Failed to save changes.");
    }
  };
  const handleEditClick = () => {
    if (accountType === "Society") {
      setDescriptionField(userData.description || "");
      setShortDescField(userData.shortDescription || "");
      setShowEditPopup(true); // Show popup for societies
    } else if (accountType === "Student") {
      setDescriptionField(userData.bio || "");
      setShowEditPopup(true); // Show popup for students
    } else if (accountType === "Union") {
      // Toggle profile picture options for unions
      setShowProfilePicOptions((prev) => !prev);
    }
  };
  
  
  
  console.log("Rendering userData:", userData);

  console.log("Logged-in user:", loggedInUser);
console.log("Logged-in user ID (UID):", loggedInUser?.uid);

  
  console.log("Logged-in user's accountType:", accountType);
console.log("Logged-in user:", loggedInUser);
  const handleCreateEvent = () => {
    navigate("/CreateEvent"); //  Navigate to Create event page.
  }

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>Profile not found.</div>;

  const isSubscribed = loggedInUser?.subscribedProfiles?.includes(userData.email);

  return (
    <div className= "profile"><NavBar accountType={accountType || "Loading..."} />
    <div className="description">
        {/* Title */}
        <h1>MyProfile</h1>
    </div>
    <div className="profile-container">
      <div className="profile-header">
        
      <div className="profile-pic-container">
  <div
    className="profile-pic"
    style={{
      backgroundImage: `url(${userData?.image || defaultProfilePic})`,
    }}
    onClick={isOwnProfile ? handleProfilePicClick : undefined}
  />
  {isOwnProfile && <div className="edit-overlay">Edit</div>}
</div>




<div className="profile-info">
{userData.name && <p>Name: {userData.name}</p>}
  {userData.email && <p>Email: {userData.email}</p>}
  {userData.studentNumber && <p>Student Number: {userData.studentNumber}</p>}
  {userData.societyId && <p>Society ID: {userData.societyId}</p>}
  {userData.category && <p>Category: {userData.category}</p>}

  {/* Show Bio for Students */}
  {accountType === "Student" && userData.bio && (
    <div className="bio-section">
      <h3>Bio</h3>
      <p>{userData.bio}</p>
    </div>
  )}

  {/* Show Description for Societies */}
  {accountType === "Society" && userData.description && (
    <div className="description-section">
      <h3>Description</h3>
      <p>{userData.description}</p>
    </div>
  )}
</div>

      
        {showProfilePicOptions && (
          <div className="profile-pic-options">
            <label>
              Enter Image URL:
              <input
                type="text"
                value={profilePicUrl}
                onChange={(e) => setProfilePicUrl(e.target.value)}
              />
            </label>
            <div className="profile-pic-options-buttons">
              <button onClick={handleSaveProfilePic}>Save</button>
              <button onClick={handleRemoveProfilePic}>Remove</button>
            </div>
          </div>
        )}
        <div className="profile-buttons">
        {isOwnProfile && (
          <button
          className="edit-profile-btn"
          onClick={handleEditClick}
        >
          Edit Profile
        </button>
        
        )}

          {isOwnProfile && <button className="create-event-btn" onClick = {handleCreateEvent}>
            Create Event</button>}
          {!isOwnProfile && loggedInUser?.accountType === "Student" && (
            isSubscribed ? (
              <button onClick={() => handleUnfollow(userData.email)}>Unfollow</button>
            ) : (
              <button onClick={handleFollow}>Follow</button>
            )
          )}
        </div>
      </div>

      {/* Tabs for Live Events and Subscribed Profiles */}
      <div className="profile-section-tabs">
        <button
          className={`tab-btn ${activeTab === "Live Events" ? "active" : ""}`}
          onClick={() => setActiveTab("Live Events")}
        >
          Live Events
        </button>
        {userData.accountType === "Student" && (
          <button
            className={`tab-btn ${activeTab === "Subscribed Profiles" ? "active" : ""}`}
            onClick={() => setActiveTab("Subscribed Profiles")}
          >
            Subscribed Profiles
          </button>
        )}
      </div>
      {showEditPopup && (
        <div className="popup">
          <div className= "popupInside">
            <h2>Edit Profile</h2>
            {accountType === "Society" && (
              <>
                <label>
                  Edit Description (max 250 characters):
                  <textarea
                    value={descriptionField}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        setDescriptionField(e.target.value);
                      }
                    }}
                    placeholder="Edit description (max 250 characters)"
                  />
                  <p>{descriptionField.length}/250</p>
                </label>
                <label>
                  Edit Short Description (max 50 characters):
                  <textarea
                    value={shortDescField}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setShortDescField(e.target.value);
                      }
                    }}
                    placeholder="Edit short description (max 50 characters)"
                  />
                  <p>{shortDescField.length}/50</p>
                </label>
              </>
            )}
            {accountType === "Student" && (
              <>
                <label>
                  Enter your Bio:
                  <textarea
                    value={descriptionField}
                    onChange={(e) => setDescriptionField(e.target.value)}
                    placeholder="Enter your bio here"
                  />
                </label>
              </>
            )}
            <div className="popup-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setShowEditPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}



      {/* Tab Content */}
      {activeTab === "Live Events" && (
  <div className="profile-section active">
    <h2>Live Events</h2>
    {hostedEvents.length > 0 ? (
      <ul className="events-list">
        {hostedEvents.map((event) => (
          <li key={event.id} onClick={() => handleCardClick(event.eventId)} className="event-item">
            <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}></div>
            <div className="event-details">
              <h3>{event.title}</h3>
              <p>{event.shortDescription}</p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
              <p>
                <strong>Time:</strong> {event.time}
              </p>
              <p>
                <strong>Date:</strong> {event.date}
              </p>
              <div className="event-tags">
                {event.tags.map((tag, index) => (
                  <span key={index} className="event-tag">{tag}</span>
                ))}
              </div>
            </div>
            {isOwnProfile && (
              <button
                className="delete-event-btn"
                onClick={() => deleteEvent(event.id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p>No events hosted by this account yet.</p>
    )}
  </div>
)}


{activeTab === "Subscribed Profiles" && userData.accountType === "Student" && (
  <div className="profile-section active">
    <h2>Subscribed Profiles</h2>
    <ul>
      {userData.subscribedProfiles?.map((profileEmail) => (
        <li key={profileEmail}>
          {profileEmail}
          {isOwnProfile && (
            <button onClick={() => handleUnfollow(profileEmail)}>Unfollow</button>
          )}
        </li>
      ))}
    </ul>
  </div>
)}
    </div>
    {isPopupOpen && selectedEventId && (
        <EventsDetails eventId={selectedEventId} onClose={handleClosePopup} />
      )}
    </div>
  );
}

export default MyProfile;
