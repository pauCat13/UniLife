import React from 'react';
// Import CSS file for looks.
import './SocietiesGrid.css';
import { useNavigate } from 'react-router-dom';

/**
 * Functional component SocietiesGrid;
 * Shows a grid of all society cards
 * Will map the societies according to query search
 */
const SocietiesGrid = ({ societies = [], searchQuery = '' }) => {
  const navigate = useNavigate();

  const filteredEvents = societies.filter((society) => {
    const searchableTags = [
      society.name?.toLowerCase() || '', // Searchable by society name
      society.category?.toLowerCase() || '', // Searchable by society category
    ];

    // Match search query
    const matchesSearch = searchableTags.some((tag) =>
      tag.includes(searchQuery.toLowerCase())
    );

    return matchesSearch;
  });

  const handleCardClick = (societyId) => {
    navigate(`/myProfile/${societyId}`);
  };

  return (
    <div className="container">
      <div className="grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((society) => (
            <div
  key={society.id}
  onClick={() => handleCardClick(society.id)}
  className="societyCard"
>
<img
  src={society.image || 'https://img.freepik.com/free-photo/black-smooth-textured-paper-background_53876-98333.jpg'}
  alt={`${society.name} logo`}
  className="societyImage"
/>

  <h3>{society.name}</h3>
  <p>Category: {society.category}</p>
  <p>Description: {society.description}</p>
  <p>Email: {society.email}</p>
</div>

          ))
        ) : (
          <p>Loading Societies...</p>
        )}
      </div>
    </div>
  );
};

export default SocietiesGrid;
