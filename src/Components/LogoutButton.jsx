import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './LogoutButton.css';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      navigate('/LoginForm'); // Redirect to login form
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="LogoutButton-container">
      <button className="LogoutButton" onClick={handleLogout}>
        <span className="LogoutButton-text">Log Out</span>
      </button>
    </div>
  );
};

export default LogoutButton;
