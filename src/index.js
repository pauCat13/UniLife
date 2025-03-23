import 'crypto-browserify';
import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

window.Buffer = Buffer; // Ensures Buffer is available globally

// Create a root container
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app inside the root container
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
