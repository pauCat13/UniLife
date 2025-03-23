import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import SurveyApp from "./surveyapp";
import MyFeed from "./MyFeed";
import ListSocieties from "./ListSocieties";
import Home from "./Home";
import MyProfile from "./myProfile"; 
import { auth, db } from './firebase';
import CreateEvent from './CreateEvent';
import MyTickets from './MyTickets';
import EventDetails from './EventDetails';
import StartPage from './StartPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/LoginForm" element={<LoginForm />} />
      <Route path="/SignUpForm" element={<SignUpForm />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/MyFeed" element={<MyFeed />} />
      <Route path="/ListSocieties" element={<ListSocieties />} />
      <Route path="/surveyapp" element={<SurveyApp />} />
      <Route path="/CreateEvent" element={<CreateEvent />} />
      <Route path="/MyTickets" element={<MyTickets />} />
      <Route path="/EventDetails" element={<EventDetails />} />
      <Route path="/MyProfile/:id" element={<MyProfile auth={auth} db={db} />} /> 
    </Routes>
  );
};

export default App;
