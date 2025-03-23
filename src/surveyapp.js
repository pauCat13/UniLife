import React, { useState, useEffect } from "react";
import "./surveyapp.css"; // Import your styles
import { auth, db, onAuthStateChanged } from "./firebase"; // Import from firebase.js
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function SurveyApp() {
  const [societies, setSocieties] = useState([]); // List of societies
  const [selectedSocieties, setSelectedSocieties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("No user logged in, redirecting to login.");
        navigate("/LoginForm");
      } else {
        console.log("User logged in:", user.email);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Fetch societies from Firestore
    const fetchSocieties = async () => {
      try {
        const societiesSnapshot = await getDocs(collection(db, "societies"));
        const societiesList = societiesSnapshot.docs.map((doc) => ({
          id: doc.id,         // Society ID
          name: doc.data().name, // Society name
          email: doc.data().email, // Society email
        }));
        setSocieties(societiesList);
      } catch (error) {
        console.error("Error fetching societies:", error);
      }
    };

    fetchSocieties();
  }, []);

  const handleSocietyChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSocieties((prev) =>
      checked ? [...prev, value] : prev.filter((society) => society !== value)
    );
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user logged in");
      return;
    }

    // Get the email of the selected societies
    const selectedSocietyEmails = societies
      .filter((society) => selectedSocieties.includes(society.id))
      .map((society) => society.email);

    // Add the default MSU email
    const subscribedProfiles = [...selectedSocietyEmails, "maynoothstudentunion@mumail.ie"];

    const surveyData = {
      email: user.email, // User's email
      subscribedProfiles,
    };

    console.log("Payload to be sent:", surveyData);

    try {
      const response = await fetch("http://localhost:5000/api/submit-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        alert("Survey submitted successfully!");
        setIsModalOpen(false); // Close modal after submission
        navigate("/Home"); // Redirect to home page after submission

      } else {
        const errorData = await response.json();
        console.error("Submission error:", errorData.error);
      }
    } catch (error) {
      console.error("Failed to submit survey:", error);
      alert("Failed to submit survey. Please try again.");
    }
  };

  return (
    <div className="App">
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Select Your Preferred Societies</h2>
            <div className="scroll-container">
              <div className="society-list">
                {societies.map((society) => (
                  <label key={society.id}>
                    <input
                      type="checkbox"
                      value={society.id} // Use society ID as the value
                      onChange={handleSocietyChange}
                    />{" "}
                    {society.name} {/* Display society name */}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={selectedSocieties.length === 0} // Disable if none selected
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyApp;
