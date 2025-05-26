import React, { useState } from 'react';
import axios from 'axios';
import './EditProfileForm.css';

const profilePicOptions = [
  "grapes.jpg",
  "grapes2.jpg",
  "vineyard.jpg",
  "wine1.jpg",
  "wine2.jpg",
  "wine3.jpg"
];

const backgroundPicOptions = [
  "bg1.jpg",
  "bg2.jpg",
  "bg3.jpg"
];



interface EditProfileFormProps {
  username: string;
  currentBio: string;
  currentProfilePic: string;
  currentBackgroundPic: string;
  onSave: () => void; // callback after save
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  username,
  currentBio,
  currentProfilePic,
  currentBackgroundPic,
  onSave
}) => {
  const [bio, setBio] = useState(currentBio);
  const [profilePic, setProfilePic] = useState(currentProfilePic);
  const [backgroundPic, setBackgroundPic] = useState(currentBackgroundPic);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    axios
      .put(`http://localhost:8080/api/profile/${username}`, {
        bio,
        profile_pic: profilePic,
        backg_pic: backgroundPic
      })
      .then(() => {
        onSave();
      })
      .catch((err) => {
        console.error("Error saving profile:", err);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="edit-profile-form">
      <h2>Edit Profile</h2>

      <label>Bio:</label>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} />

      <label>Choose Profile Picture:</label>
      <div className="image-selector">
        {profilePicOptions.map((img) => (
          <img
            key={img}
            src={`/profile-pics/${img}`} // dynamically construct the path
            alt="profile option"
            className={profilePic === img ? "selected" : ""}
            onClick={() => setProfilePic(img)} // stores only the filename
          />

        ))}
      </div>

      <label>Choose Background Picture:</label>
      <div className="image-selector">
        {backgroundPicOptions.map((img) => (
          <img
            key={img}
            src={`/background-pics/${img}`}
            alt="background option"
            className={backgroundPic === img ? "selected" : ""}
            onClick={() => setBackgroundPic(img)}
          />

        ))}
      </div>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button onClick={onSave} className="cancel-btn">
        Cancel
        </button>
    </div>
  );
};

export default EditProfileForm;
