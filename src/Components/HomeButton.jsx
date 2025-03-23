import React from 'react';
import { useNavigate } from 'react-router-dom';
//Import CSS file for looks.
import './HomeButton.css';

/**
 * Functional component HomeButton; 
 * Button in NavBar that reroutes to Home page
 */
const HomeButton = () => {
  const navigate = useNavigate();

  const handleSwitch = () => {
    navigate('../Home'); // Navigate to Home when the button is clicked
  };

  return (
    <div className="HomeButton-container">
      <button className="HomeButton" onClick={handleSwitch}>
        <span className="switchButton-text">Home</span>
      </button>
    </div>
  );
};

export default HomeButton;
