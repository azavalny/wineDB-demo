"use client";

import React, { useState } from 'react';
import axios from 'axios';

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
  onSave: () => void;
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
      .catch((err: any) => {
        console.error("Error saving profile:", err);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#f1f1f1] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#292929] rounded-lg shadow-2xl overflow-hidden border border-[#444]">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-[#ffccbb] mb-8 text-center">Edit Profile</h2>

            <div className="space-y-8">
              <div>
                <label className="block text-lg font-bold text-[#a03e4e] mb-3">Bio:</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-4 bg-[#2a2a2a] text-white border border-[#555] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#a03e4e] placeholder-[#aaa]"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-[#a03e4e] mb-4">Choose Profile Picture:</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {profilePicOptions.map((img) => (
                    <div
                      key={img}
                      className={`relative cursor-pointer transition-all duration-300 border-2 rounded-lg ${
                        profilePic === img 
                          ? 'border-[#a03e4e] scale-105' 
                          : 'border-[#555] hover:border-[#a03e4e] hover:scale-105'
                      }`}
                      onClick={() => setProfilePic(img)}
                    >
                      <img
                        src={`/profile-pics/${img}`}
                        alt="profile option"
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      {profilePic === img && (
                        <div className="absolute inset-0 bg-[#a03e4e]/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#a03e4e]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-[#a03e4e] mb-4">Choose Background Picture:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {backgroundPicOptions.map((img) => (
                    <div
                      key={img}
                      className={`relative cursor-pointer transition-all duration-300 border-2 rounded-lg ${
                        backgroundPic === img 
                          ? 'border-[#a03e4e] scale-105' 
                          : 'border-[#555] hover:border-[#a03e4e] hover:scale-105'
                      }`}
                      onClick={() => setBackgroundPic(img)}
                    >
                      <img
                        src={`/background-pics/${img}`}
                        alt="background option"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {backgroundPic === img && (
                        <div className="absolute inset-0 bg-[#a03e4e]/20 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#a03e4e]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={onSave}
                  className="flex-1 py-3 px-6 bg-[#555] text-white font-bold rounded-lg hover:bg-[#666] transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm; 