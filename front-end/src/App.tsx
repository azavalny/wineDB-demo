import { useEffect, useState } from "react";
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

type userWine = {
  name: string;
  grape: string;
  region: string;
  review: string;
  rating: number;
  year: number;
};

const sampleWines: userWine[] = [
  {
    name: "Barolo Riserva",
    grape: "Nebbiolo",
    region: "Piedmont",
    review: "Elegant and complex with notes of cherry and leather.",
    rating: 5,
    year: 2016,
  },
  {
    name: "Rioja Gran Reserva",
    grape: "Tempranillo",
    region: "Rioja",
    review: "Well-balanced with oak and spice. Long finish.",
    rating: 4,
    year: 2014,
  },
  {
    name: "Châteauneuf-du-Pape",
    grape: "Grenache Blend",
    region: "Rhône Valley",
    review: "Rich and powerful. Black fruit and herbs on the palate.",
    rating: 4,
    year: 2018,
  },
];


function App() {
  const [status, setStatus] = useState(false);
  const [cellar, setCellar] = useState(false);
  const [profile, setProfile] = useState(false);
  const [username, setUsernameMain] = useState("");
  const navigate = useNavigate();

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
          <Cellar wineList={sampleWines}/>
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
          <Profile username="Test" />
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
