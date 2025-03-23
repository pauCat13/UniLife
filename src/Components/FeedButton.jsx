import React from 'react';
import { useNavigate } from 'react-router-dom';
//Import CSS file for looks.
import './FeedButton.css';

/**
 * Functional component FeedButton; 
 * Button in NavBar that reroutes to MyFeed page
 */
const FeedButton = () => {
  const navigate = useNavigate();

  const handleSwitch = () => {
    navigate('../MyFeed'); // Navigate to MyFeed when the button is clicked
  };

  return (
    <div className="FeedButton-container">
      <button className="FeedButton" onClick={handleSwitch}>
        <span className="FeedButton-text">MyFeed</span>
      </button>
    </div>
  );
};

export default FeedButton;
