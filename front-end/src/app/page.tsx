"use client";

import { use, useEffect, useState } from "react";
// import Account from "@/components/Account";
import Home from "@/components/Home";
import Cellar from "@/components/Cellar";
import Profile from "@/components/Profile";
import Account from "@/components/Account"; // Import Account component
import { useRouter, usePathname } from "next/navigation";

function App() {
  // const [status, setStatus] = useState(false);
  const [status, setStatus] = useState(true); // Skip login, go straight to Home
  const [cellar, setCellar] = useState(false);
  const [profile, setProfile] = useState(false);
  const [username, setUsernameMain] = useState("testuser"); // Default username for no-login version

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("username: ", username);
  }, [username]);

  // Determine which component to show based on pathname
  const getCurrentComponent = () => {
    // Comment out login functionality - always authenticated
    // if (!status) {
    //   return (
    //     <Account
    //       setStatus={setStatus}
    //       setUsernameMain={setUsernameMain}
    //     />
    //   );
    // }

    switch (pathname) {
      case "/cellar":    
        return <Cellar username={username} />;
      case "/profile":
        return <Profile username={username} />;
      case "/account":
        return <Account setUsernameMain={setUsernameMain} />;
      default:
        return (
          <Home
            setCellar={setCellar}
            setProfile={setProfile}
            username={username}
          />
        );
    }
  };

  return getCurrentComponent();
}

export default App;
