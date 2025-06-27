"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type AccountProps = {
  setUsernameMain: (val: string) => void;
};

function Account({ setUsernameMain }: AccountProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
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
            router.push("/");
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
      router.push("/");
    });
  }

  async function sendLogInData() {
    try {
      console.log("Attempting login for user:", username);
      const response = await handleLogin(username, password);
      
      // If we get here, login was successful
      console.log("Login successful, user data:", response);
      return response;
      
    } catch (error) {
      // TypeScript type narrowing for error handling
      if (error instanceof Error) {
        console.error("Login failed:", error.message);
        
        // Update UI with error message
        if (messageRef.current) {
          messageRef.current.innerText = error.message;
        }
      } else {
        console.error("Unexpected login error:", error);
        if (messageRef.current) {
          messageRef.current.innerText = "An unexpected error occurred";
        }
      }
      
      // Re-throw if you need to handle this elsewhere
      throw error;
    }
}

  async function handleLogin(username: string, password: string) {
    // Validate inputs first
    if (!username.trim() || !password.trim()) {
      throw new Error("Username and password are required");
    }

    try {
      // 1. Lookup email by username
      const { data: userData, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (lookupError) {
        console.error("Username lookup error:", lookupError.message);
        throw new Error("User not found");
      }

      if (!userData?.email) {
        throw new Error("Invalid credentials");
      }

      // 2. Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password
      });

      if (authError) {
        console.error("Authentication error:", authError.message);
        throw new Error(authError.message);
      }

      // 3. Store user data
      localStorage.setItem("username", JSON.stringify(username));
      console.log("User logged in successfully:", data.user?.email);
      
      return {
        status: 200,
        user: data.user,
        session: data.session
      };

    } catch (error) {
      console.error("Login process failed:", error);
      
      // Clear any partial state on failure
      localStorage.removeItem("username");
      
      // Re-throw for calling function to handle
      throw error;
    }
  }
        

  async function createAccount() {
    try {
      console.log("Creating account for:", username);
      const response = await handleSignUp(email, username, password);
      
      // Only store username if signup was successful
      localStorage.setItem("username", username); // No need for JSON.stringify on strings
      
      console.log("Account created successfully:", response);
      
      // Update UI with success message
      if (messageRef.current) {
        messageRef.current.innerText = "Account created! Please check your email for verification.";
        messageRef.current.style.color = "green";
      }
      
      return response;
      
    } catch (error) {
      console.error("Account creation failed:", error);
      
      // Clear partial data on failure
      localStorage.removeItem("username");
      
      // Provide specific error feedback
      if (messageRef.current) {
        const message = error instanceof Error ? error.message : "Account creation failed";
        messageRef.current.innerText = message;
        messageRef.current.style.color = "red";
      }
      
      // Re-throw if you need to handle the error elsewhere
      throw error;
    }
  }

  async function handleSignUp(email: string, username: string, password: string) {
  if (!email || !username || !password) {
    throw new Error("All fields are required");
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // stored in auth.users.user_metadata
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    const { error: dbError } = await supabase
       .from('users')
      .insert({
        id: authData.user.id,
        email,
        username
      });

    if (dbError) throw dbError;

    return authData;

  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      switch (error.code) {
        case '23505':
          throw new Error('Username or email already exists');
        case '422':
          throw new Error('Invalid email format');
        default:
          throw new Error('Registration failed');
      }
    }
    throw new Error('An unexpected error occurred');
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