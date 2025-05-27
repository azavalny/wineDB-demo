import { use, useEffect, useState } from "react";
import "./App.css";
import Account from "./Account";

import Profile from "./Profile";
/*
import AddForm from "./AddForm";
import CreateProfile from "./CreateProfile";
import axios from "axios"; */

import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./Home";
import Cellar from "./Cellar";

const backend = "http://localhost:8080/api";




function App() {
  const [status, setStatus] = useState(false);
  const [cellar, setCellar] = useState(false);
  const [profile, setProfile] = useState(false);
  const [username, setUsernameMain] = useState("");
  const navigate = useNavigate();

  useEffect(() => {console.log("username: " ,username)}, [username]);

  return (

    //<Profile username={username} />

     <Routes>
      <Route path="/" element={
        status ? (
          <Home setCellar={setCellar}
                setProfile={setProfile}
                username={username}/>
        ) : (
          <Account
            setStatus={setStatus}
            setUsernameMain={setUsernameMain}
          />
        )
      } />
      <Route path="/cellar" element={
        status ? (
          <Cellar username={username}/>
        ) : (
          <Account
            setStatus={setStatus}
            setUsernameMain={setUsernameMain}
          />
        )
      } />
      <Route path="/personal-cellar" element={
        <button onClick={() => {
          setCellar(true);
          navigate("/cellar");
        }}>Personal Cellar</button>
      } />
       <Route path="/profile" element={
        status ? (
          <Profile username={username} />
        ) : (
          <Account
            setStatus={setStatus}
            setUsernameMain={setUsernameMain}
          />
        )
      } />

      <Route path="/personal-profile" element={
        <button onClick={() => {
          setProfile(true);
          navigate("/profile");
        }}>Profile</button>
      } />
    </Routes>

  );
}

export default App;
