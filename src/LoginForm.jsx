// src/LoginForm.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, onAuthStateChanged } from './firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import './login-sign.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User already logged in", user.email);
        //Redirect logged-in users to home
        navigate('/Home');
      }
    });

    return () => unsubscribe(); //Cleanup Listener
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      //Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User logged in:", user.email);

    //Redirect to home page
      navigate('/Home');

    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="form-box">
        <div className="form-value">
          <form onSubmit={handleLogin}>
            <h2>Login</h2>

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

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="register">
              <p>
                Don't have an account? <Link to="/SignUpForm">Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
