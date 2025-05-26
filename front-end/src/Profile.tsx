import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import EditProfileForm from './EditProfileForm';

interface ProfileProps {
  username: string;
}

interface ProfileData {
  profile_pic: string;
  backg_pic: string;
  bio: string;
}


const Profile: React.FC<ProfileProps> = ({ username }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const editFunction = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const testProfile = "Test"; 

async function fetchProfile() {
  try {
    const res = await axios.get(`http://localhost:8080/api/profile/${testProfile}`);
    setProfile(res.data);
    setLoading(false);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    setLoading(false);
  }
}


  useEffect(() => {
    fetchProfile();
  }, [testProfile]);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div className="profile-container">
      {isEditing ? (
        <EditProfileForm
          username={username}
          currentBio={profile.bio}
          currentProfilePic={profile.profile_pic}
          currentBackgroundPic={profile.backg_pic}
          onSave={handleSave}
        />
      ) : (
        <>
          <div
            className="profile-banner"
            style={{
              backgroundImage: `url(/background-pics/${profile.backg_pic})`,
            }}
          >
            <img
              src={`/profile-pics/${profile.profile_pic}`}
              alt="Profile"
              className="profile-pic"
            />
          </div>

          <div className="profile-content">
            <h2>{username}</h2>
            <p>{profile.bio}</p>
            <button className="edit-profile-btn" onClick={editFunction}>
              Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
