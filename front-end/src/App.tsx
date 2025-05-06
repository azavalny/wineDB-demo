import { useState } from "react";
import "./App.css";
import Account from "./Account";
/*
import Profile from "./Profile";
import AddForm from "./AddForm";
import CreateProfile from "./CreateProfile";
import axios from "axios"; */ 

const backend = "http://localhost:8080/api";

function App() {
  const [status, setStatus] = useState(false);
  const [create, setCreate] = useState(false);
  const [username, setUsernameMain] = useState("");

  let currentHTML;

  
  currentHTML = (
    <Account 
      setStatus={setStatus} 
      setCreate={setCreate} 
      setUsernameMain={setUsernameMain}
    />
  );
   /*else if (create) {
    currentHTML = <CreateProfile />;
  } else {
    currentHTML = <Profile />;
  } */

  return currentHTML;
}

export default App;
