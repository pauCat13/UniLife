import React from 'react';
/**
 *Import components from 'Components' folder. 
 *All components that are building blocks are kept in a separate folder for neatness
 *All files that contain pages for the app are in 'src' folder.
*/
import Logo from './Images/UniLife_Logo.jpeg';
import HomeButton from './HomeButton';
import FeedButton from './FeedButton';
import ProfileButton from './ProfileButton';
import TicketsButton from './TicketsButton';
import SocietiesButton from './SocietiesButton';
import LogoutButton from './LogoutButton';

//Import CSS file for looks.
import './NavBar.css';

/**
 * Functional component NavBar; 
 * Shows a Navigation bar with Maynooth Image Logo and the buttons to navigate 
 * to all the different pages. Will appear at the top of all pages. 
 */
const NavBar = ({ accountType }) => {
  console.log("NavBar received accountType:", accountType); // Debug here
  return (
    <div className="navigation">
      {/* Navbar as Header */}
      <nav className="navBar">
        <img src={Logo} alt={"Maynooth University"} className="logoImage" />
        <div className="navBar-buttons">
          <HomeButton />
          {accountType === "Student" && <FeedButton />}
          <ProfileButton />
          {accountType === "Student" && <TicketsButton />}
          <SocietiesButton />
          <LogoutButton />
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
