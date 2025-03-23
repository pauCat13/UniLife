import React from 'react';
//Import CSS file for looks
import './TypeSearchHome.css';

/**
 * Functional component TypeSearchHome; 
 * Options Button to filter through grid by type of event
 * i.e. Student Led, Society, or SU.
 */
const TypeSearchHome = ({ selectedType, setSelectedType }) => {
  // Function to handle type selection changing grid mapping
  const handleSelectChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <div className="typeSearchHome-container">
      <select
        id="type-select"
        className="typeSearchHome-select"
        value={selectedType}
        onChange={handleSelectChange}
      >
        <option value="">Event Type</option>
        <option value="Society Event">Society Event</option>
        <option value="SU Event">SU Event</option>
        <option value="Student Led">Student Led</option>
      </select>
    </div>
  );
};

export default TypeSearchHome;
