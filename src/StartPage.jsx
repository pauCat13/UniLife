import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

import Logo from'./Components/Images/transparent_text_image.png';
import image1 from './Components/Images/Picsart_24-12-02_21-56-16-095.jpg';
import image2 from './Components/Images/Picsart_24-12-02_21-54-57-030.jpg';
import image3 from './Components/Images/Picsart_24-12-02_21-58-49-507.jpg';
import image4 from './Components/Images/Picsart_24-12-02_22-01-05-851.jpg';
import image5 from './Components/Images/Picsart_24-12-02_22-01-51-247.jpg';

const images = [image1, image2, image3, image4, image5];


function StartPage() {
  // State to keep track of the current image in the slideshow
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleSwitch = () => {
    navigate('../LoginForm'); // Navigate to Home when the button is clicked
  };

  // Automatically update the current image every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Move to the next image
    }, 4000); // Time interval in milliseconds

    return () => clearInterval(interval); // Clean up the interval when the component unmounts
  }, []);

  return (
    <div>
      {/* Container for the logo and tagline */}
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo" />
        <p className="tagline">
          Discover <span className="bullet">·</span> Share <span className="bullet">·</span> Connect
        </p>
      </div>

      {/* Button to get started */}
      <div className="button-container1"> 
          <div className="button-container2" onClick={handleSwitch}>
             <button className="get-started-button">Get Started</button>
          </div>
      </div>

      {/* Slideshow container for displaying the images */} 
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index} // Unique key for each image
            className={`slideshow-image ${index === currentIndex ? 'fade-in' : 'fade-out'}`} // Show the current image with fade-in effect
            style={{ backgroundImage: `url(${image})` }} // Set the background image
          ></div>
        ))}
      </div>

      {/* Footer with credits */}
      <div className="footer-text">
        Project created by Patrick Aggrey, Dmitrijs Kraliks, Chikezie Ogbogu, Olatilewa Ishola, Paula Catalan, Nathan O'Connor & Anshuk Gaddam. Images taken from- 
        <a href="https://www.maynoothuniversity.ie/campus-life/campus-photo-tour" target="_blank" rel="noopener noreferrer">
          https://www.maynoothuniversity.ie/campus-life/campus-photo-tour
        </a>
      </div>
    </div>
  );
}

export default StartPage;
