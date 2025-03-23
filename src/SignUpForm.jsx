import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './login-sign.css';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [selectedAccountType, setSelectedAccountType] = useState('Student'); 
  const [studentnumber, setStudentNumber] = useState('');
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [societyId, setSocietyId] = useState('');
  const [societyDescription, setSocietyDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [societyCategory, setSocietyCategory] = useState('Cultural');
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Trim whitespace from inputs
    const trimmedEmail = email.trim();
    const trimmedStudentNumber = studentnumber.trim();
    const trimmedSocietyId = societyId.trim().toUpperCase(); // Convert society ID to uppercase
    const trimmedName = name.trim();
    const trimmedDescription = societyDescription.trim();
    const trimmedShortDescription = shortDescription.trim();
  
    if (!trimmedEmail.endsWith('@mumail.ie')) {
      alert('Email must end with @mumail.ie');
      return;
    }
  
    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user; // Contains uid, email, etc.
  
      console.log("User registered:", user.uid);
  
      // Check if student number or society ID is already registered
      if (selectedAccountType === 'Student') {
        const studentCheckDoc = await getDoc(doc(db, 'studentNumbers', trimmedStudentNumber));
        if (studentCheckDoc.exists()) {
          alert('This student number is already registered.');
          return;
        }
  
        // Register student number for uniqueness
        await setDoc(doc(db, 'studentNumbers', trimmedStudentNumber), { uid: user.uid });
      }
  
      if (selectedAccountType === 'Society') {
        const societyCheckDoc = await getDoc(doc(db, 'societies', trimmedSocietyId));
        if (societyCheckDoc.exists()) {
          alert('This society ID is already registered.');
          return;
        }
  
        // Add society details
        await setDoc(doc(db, 'societies', trimmedSocietyId), {
          name: trimmedName,
          email: trimmedEmail,
          societyId: trimmedSocietyId, // Save the ID in uppercase
          description: trimmedDescription,
          shortDescription: trimmedShortDescription,
          category: societyCategory,
          createdAt: new Date().toISOString(),
        });
      }
  
      // Add user details to Firestore using `uid` as document ID
      await setDoc(doc(db, 'users', user.uid), {
        studentNumber: selectedAccountType === 'Student' ? trimmedStudentNumber : null,
        name: trimmedName,
        email: trimmedEmail,
        accountType: selectedAccountType,
        societyId: selectedAccountType === 'Society' ? trimmedSocietyId : null, // Save in uppercase
        createdAt: new Date().toISOString(),
      });
  
      console.log('Registration successful');
  
      // Redirect based on account type
      if (selectedAccountType === 'Student') {
        navigate('/surveyapp'); // Redirect students to survey
      } else {
        navigate('/Home');  // Redirect others to the home page
      }
  
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message);
    }
  };

  return (
    <section>
      <div className="form-box">
        <div className="form-value">
          <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <div className="account-type-selector">
              {['Student', 'Union', 'Society'].map((type) => (
                <div
                  key={type}
                  className={`account-type-option ${selectedAccountType === type ? 'active' : ''}`}
                  onClick={() => setSelectedAccountType(type)}
                >
                  {type}
                </div>
              ))}
            </div>

            {selectedAccountType === 'Student' && (
              <div className="inputbox">
                <input
                  type="text"
                  required
                  value={studentnumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder=" "
                />
                <label>Student Number</label>
              </div>
            )}

            {selectedAccountType === 'Union' && (
              <div className="inputbox">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                />
                <label>Name</label>
              </div>
            )}

            {selectedAccountType === 'Society' && (
              <>
                <div className="inputbox">
                  <input
                    type="text"
                    required
                    value={societyId}
                    onChange={(e) => setSocietyId(e.target.value)}
                    placeholder=" "
                  />
                  <label>Society ID</label>
                </div>
                <div className="inputbox">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                  />
                  <label>Name</label>
                </div>
                <div className="inputbox">
                  <input
                    type="text"
                    required
                    value={societyDescription}
                    onChange={(e) => {
                      const inputText = e.target.value;
                      if (inputText.length <= 250) {
                        setSocietyDescription(inputText);
                      }
                    }}
                    placeholder=" "
                    maxLength="250" // Limit characters directly
                  />
                  <label>Description</label>
                  
                </div>
                <p className="character-count">{250 - societyDescription.length} characters remaining</p>


                <div className="inputbox">
                  <input
                    type="text"
                    required
                    value={shortDescription}
                    onChange={(e) => {
                      const inputText = e.target.value;
                      if (inputText.length <= 50) {
                        setShortDescription(inputText);
                      }
                    }}
                    placeholder=" "
                    maxLength="50" // Limit characters directly
                  />
                  <label>Short Description</label>
                  
                </div>
                <p className="character-count">{50 - shortDescription.length} characters remaining</p>


                <button
                  type="button"
                  onClick={() => setShowCategoryOptions(!showCategoryOptions)}
                >
                  {showCategoryOptions ? 'Hide Categories' : 'Select Category'}
                </button>
                {showCategoryOptions && (
                  <div className="category-options" style={{ maxHeight: '120px', overflowY: 'scroll' }}>
                    {['Cultural', 'Sports', 'Academic', 'Technology', 'Art', 'Music'].map((category) => (
                      <div
                        key={category}
                        className={`category-option ${societyCategory === category ? 'selected' : ''}`}
                        onClick={() => setSocietyCategory(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="inputbox">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label>Email</label>
            </div>
            <div className="inputbox">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
              <label>Password</label>
            </div>

            <button type="submit">Register</button>
            <div className="register">
              <p>
                Have an account? <Link to="/LoginForm">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpForm;
