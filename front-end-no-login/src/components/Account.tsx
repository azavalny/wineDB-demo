"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

const loginApi = "http://localhost:8080/api-login";
const createAPI = "http://localhost:8080/api-create";

type AccountProps = {
  setStatus: (val: boolean) => void;
  setUsernameMain: (val: string) => void;
};

function Account({ setStatus, setUsernameMain }: AccountProps) {
  const [email, setEmail] = useState("");
  const [username, setUsernameLocal] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState("");
  
  const messageRef = useRef<HTMLHeadingElement>(null);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [titleOfPage, setTitle] = useState("Welcome to WineDB");

  function validatePassword(confirmedPass: string) {
    return password === confirmedPass;
  }

  function createAccountSubmit() {
    if (validatePassword(passwordConfirmed)) {
      let size = password.length;
      if (size < 8) {
        if (messageRef.current) {
          messageRef.current.innerText = "Password must be at least 8 characters long!";
        }
      } else {
        if (messageRef.current) {
          messageRef.current.innerText = "Password is valid! Your account has been created!";
          
          createAccount().then(() => {
            setUsernameMain(username);
            setStatus(true);
          });
        }
      }
    } else {
      if (messageRef.current) {
        messageRef.current.innerText = "Passwords do not match!";
      }
    }
  }

  function createHandler() {
    setShowCreateForm(true);
    setShowButtons(false);
    setTitle("Create Account");
  }

  function logInHandler() {
    setShowLoginForm(true);
    setShowButtons(false);
    setTitle("Log In");
  }

  function loginSubmissionHandler() {
    console.log("User Logging in");
    sendLogInData().then(() => {
      setUsernameMain(username);
    });
  }

  async function sendLogInData() {
    try {
      const userData = {
        username,
        password
      };
      console.log("sending userData: ", username);
      const response = await axios.post(loginApi, userData);
      console.log(response.data);
      if (response.status === 200) {
        setStatus(true);
        console.log("status updated: ");
      } else {
        setStatus(false);
      }
    } catch (error) {
      console.log("send error");
    }
  }

  async function createAccount() {
    try {
      const newUser = {
        'email': email,
        'username': username,
        'password': password
      };
      console.log("creating new account for user: ", newUser);
      const response = await axios.post(createAPI, newUser);
      console.log(response.data);
    } catch (error) {
      console.log("send error, account was not created");
    }
  }

  function setMain(login: boolean) {
    setTitle("Welcome to WineDB");
    setShowButtons(true);
    if (login) {
      setShowLoginForm(false);
    } else {
      setShowCreateForm(false);
    }
  }

  useEffect(() => {
    if (showLoginForm || showCreateForm) {
      if (messageRef.current) {
        messageRef.current.innerText = "";
      }
    }
  }, [showLoginForm, showCreateForm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-4xl font-bold text-white text-center mb-8">{titleOfPage}</h1>
        
        {showButtons && (
          <div className="flex flex-col gap-4 mb-6">
            <button 
              onClick={createHandler}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create Account
            </button>
            <button 
              onClick={logInHandler}
              className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Log in
            </button>
          </div>
        )}

        {showCreateForm && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Email:</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Username:</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsernameLocal(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Password:</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Confirm Password:</label>
                <input 
                  type="password" 
                  value={passwordConfirmed} 
                  onChange={(e) => setPasswordConfirmed(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={createAccountSubmit}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Submit
              </button>
              <button 
                onClick={() => setMain(false)}
                className="flex-1 py-3 px-6 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {showLoginForm && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Username:</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsernameLocal(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Password:</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={loginSubmissionHandler}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
              >
                Submit
              </button>
              <button 
                onClick={() => setMain(true)}
                className="flex-1 py-3 px-6 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                Back
              </button>
            </div>
          </div>
        )}

        <h4 ref={messageRef} className="text-red-300 text-center mt-4 font-medium"></h4>
      </div>
    </div>
  );
}

export default Account; 