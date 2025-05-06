import { useState, useRef, useEffect } from "react";
import "./Account.css"; 
import axios from "axios";


const loginApi = "http://localhost:8080/api-login";
const createAPI = "http://localhost:8080/api-create";

type AccountProps = {
  setStatus: (val: boolean) => void;
  setCreate: (val: boolean) => void;
  setUsernameMain: (val: string) => void;
};


function Account({setStatus, setCreate, setUsernameMain}: AccountProps) {
  const [email, setEmail] = useState("");
  const [username, setUsernameLocal] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState("");
  const [hashedPass, setHashedPassword] = useState(""); 
  
  const messageRef = useRef<HTMLInputElement>(null);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [titleOfPage, setTitle] = useState("Welcome to GameLog");

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
            hashPassword(password).then((hashedPass) => {
              setHashedPassword(hashedPass);
              console.log(hashedPass);
            });
            if (messageRef.current) {
                messageRef.current.innerText = "Password is valid! Please check your email and verify your account";
                
                createAccount().then(()=>{
                  setStatus (true);
                  setCreate(true);
                  setUsernameMain(username);
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
      setStatus(true);
      setCreate(false);
      setUsernameMain(username);
    });
    
  }

  async function sendLogInData(){
    try{

      let hashedPass = await hashPassword(password);  
      setHashedPassword(hashedPass);
    
      const userData = {
        username,
        hashedPass
      };
      console.log("sending userData: ", username);
      
      const response = await axios.post(loginApi, userData);
      console.log(response.data);
      
    }catch(error){
      console.log("send error");
    }
  }

  async function createAccount(){
    try{
      const newUser = {
        'email': email,
        'username': username,
        'password': hashedPass
      };
      console.log("creating new account for user: ", newUser);
      const response = await axios.post(createAPI, newUser);
      console.log("Account created, please verify yout account");
      console.log(response.data);
      
    }catch(error){
      console.log("send error, account was not created");
    }
  }

  function setMain(login: boolean){
    setTitle("Welcome to GameLog");
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


  async function hashPassword(password : string){
    const encoder = new TextEncoder();
    let data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log("hashed: ",hashHex);

    return hashHex; 
  }
  
  
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

