import React from 'react';
import { useNavigate } from 'react-router-dom';
//Import CSS file for looks.
import './TicketsButton.css';

/**
 * Functional component TicketsButton; 
 * Button in NavBar that reroutes to MyTickets page
 */
const TicketsButton = () => {
  const navigate = useNavigate();

  const handleSwitch = () => {
    navigate('../MyTickets'); // Navigate to Societies when the button is clicked
  };

  return (
    <div className="TicketsButton-container">
      <button className="TicketsButton" onClick={handleSwitch}>
        <span className="TicketsButton-text">MyTickets</span>
      </button>
    </div>
  );
};

export default TicketsButton;
