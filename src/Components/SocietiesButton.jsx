import React from 'react';
import { useNavigate } from 'react-router-dom';
//Import CSS file for looks.
import './SocietiesButton.css';

/**
 * Functional component SocietiesButton; 
 * Button in NavBar that reroutes to Societies page
 */
const SocietiesButton = () => {
  const navigate = useNavigate();

  const handleSwitch = () => {
    navigate('../ListSocieties'); // Navigate to Societies when the button is clicked
  };

  return (
    <div className="SocietiesButton-container">
      <button className="SocietiesButton" onClick={handleSwitch}>
        <span className="SocietiesButton-text">Societies</span>
      </button>
    </div>
  );
};

export default SocietiesButton;
