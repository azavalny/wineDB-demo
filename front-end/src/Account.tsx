import { useState, useRef, useEffect } from "react";
import "./Account.css"; 
import axios from "axios";


const loginApi = "http://localhost:8080/api-login";
const createAPI = "http://localhost:8080/api-create";

type AccountProps = {
  setStatus: (val: boolean) => void;
  setUsernameMain: (val: string) => void;
};


function Account({setStatus, setUsernameMain}: AccountProps) {
  const [email, setEmail] = useState("");
  const [username, setUsernameLocal] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState("");
  
  const messageRef = useRef<HTMLInputElement>(null);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [titleOfPage, setTitle] = useState("Welcome to WineDB");

  function validatePassword(comfirmedPass : string) {
      return password === comfirmedPass;
  }

  function createAccountSubmit(){
      if(validatePassword(passwordConfirmed)){
          let size = password.length;
          if(size < 8){
              if (messageRef.current) {
                  messageRef.current.innerText = "Password must be at least 8 characters long!";
              }
          } else {
            if (messageRef.current) {
                messageRef.current.innerText = "Password is valid! Your account has been created!";
                
                createAccount().then(()=>{
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

  function createHandler(){
    setShowCreateForm(true);
    setShowButtons(false);
    setTitle("Create Account");
  }

  function logInHandler(){
    setShowLoginForm(true);
    setShowButtons(false);
    setTitle("Log In");
  }

  function loginSubmissionHandler(){
    console.log("User Logging in");
    sendLogInData().then(()=>{
      setUsernameMain(username);
    });
    
  }

  async function sendLogInData(){
    try{
      const userData = {
        username,
        password
      };
      console.log("sending userData: ", username);
      const response = await axios.post(loginApi, userData);
      console.log(response.data);
      if(response.status === 200){
        setStatus(true);
        console.log("status updated: ")
      }else{
        setStatus(false); 
      }
      
    }catch(error){
      console.log("send error");
    }
  }

  async function createAccount(){
    try{
      const newUser = {
        'email': email,
        'username': username,
        'password': password
      };
      console.log("creating new account for user: ", newUser);
      const response = await axios.post(createAPI, newUser);
      console.log(response.data);
      
    }catch(error){
      console.log("send error, account was not created");
    }
  }

  function setMain(login: boolean){
    setTitle("Welcome to WineDB");
    setShowButtons(true);
    if(login){
      setShowLoginForm(false);
    }else{
      setShowCreateForm(false);
    }
  }


  useEffect(() => {
    if(showLoginForm || showCreateForm){
      if(messageRef.current){
        messageRef.current.innerText = "";
      }
    }
  }, [showLoginForm, showCreateForm]);

  
  
return (
  <div className="account-container">
    <h1 id="title">{titleOfPage}</h1>
    {showButtons && 
    <div id ="buttons">
      <button onClick={createHandler} >
        Create Account
      </button>
      <button onClick={logInHandler} >
        Log in
      </button>
    </div>
    }
    {
      showCreateForm && 
      <div>
        <form className="form">
          <label>
            Email:
            <input type="text" name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
          </label>
          <br />
          <label>
            Username:
            <input type="text" name="username" value={username} onChange={(e) => setUsernameLocal(e.target.value)}/>
          </label>
          <br />
          <label>
            Password:
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </label>
          <br />
          <label>
            Confirm Password:
            <input type="password" name="passwordConfirmed" value={passwordConfirmed} onChange={(e) =>setPasswordConfirmed(e.target.value)} />
          </label>
        </form>
        <div id="buttons">
          <button type="submit" onClick={createAccountSubmit}>Submit</button> 
          <button onClick={() => setMain(false)}>Back</button>
        </div>
      </div>

    } 
    {showLoginForm && 
    <div>
      <form className="form">
        <label>
          Username:
          <input type="text" name="username" value={username} onChange={(e) => setUsernameLocal(e.target.value)}/>
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </label>
      </form>
      <div id="buttons">
      <button type="submit" onClick={loginSubmissionHandler}>Submit</button> 
      <button onClick={() => setMain(true)}>Back</button>
    </div>
    </div>

    }
    <h4 ref={messageRef} color="red"></h4>
  </div>
);
}

export default Account;

