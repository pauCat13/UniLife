import React from 'react';

//Import CSS file for looks.
import './SearchBar.css';

/**
 * Functional component SearchBar; 
 * Search bar used to filter through grids.  
 */

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <input
      type="text"
      placeholder="Search here..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="searchBar"
    />
  );
};

export default SearchBar;
