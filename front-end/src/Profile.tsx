import React from "react";
import { useState, useRef } from "react";
import "./Profile.css";

interface ProfileProps {
    username: string;
    profilePicture: string;
    bio: string;
}


function Profile(ProfileProps: ProfileProps) {
    const [username, setUsername] = useState(ProfileProps.username);
    const [profilePicture, setProfilePicture] = useState(ProfileProps.profilePicture);
    const [bio, setBio] = useState(ProfileProps.bio);

    const messageRef = useRef<HTMLInputElement>(null);


    return (
        <div className="profile-container">
          <div className="profile-header">
            <img src={profilePicture} alt="Profile" className="profile-picture" />
            <div className="profile-text">
              <h1 className="profile-username">{username}</h1>
              <p className="profile-bio">{bio}</p>
            </div>
          </div>
        </div>
      );
      
      
}

export default Profile;