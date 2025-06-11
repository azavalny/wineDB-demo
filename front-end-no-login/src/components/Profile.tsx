"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditProfileForm from './EditProfileForm';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const editFunction = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    fetchProfile();
  };

  async function fetchProfile() {
    try {
      const res = await axios.get(`http://localhost:8080/api/profile/${username}`);
      setProfile(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#f1f1f1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a03e4e] mx-auto mb-4"></div>
          <p className="text-lg text-[#ccc]">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#f1f1f1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-semibold text-[#ccc] mb-2">Profile not found</h2>
          <p className="text-[#aaa]">Unable to load profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#f1f1f1]">
      {isEditing ? (
        <EditProfileForm
          username={username}
          currentBio={profile.bio}
          currentProfilePic={profile.profile_pic}
          currentBackgroundPic={profile.backg_pic}
          onSave={handleSave}
        />
      ) : (
        <div className="relative">
          {/* Background Banner */}
          <div 
            className="h-80 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(/background-pics/${profile.backg_pic})`,
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            {/* Back to Home Button */}
            <div className="absolute top-6 left-6 z-10">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative -mt-20 px-6 pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#292929] rounded-lg shadow-2xl overflow-hidden border border-[#444]">
                {/* Profile Picture */}
                <div className="relative -mt-16 text-center pb-6">
                  <img
                    src={`/profile-pics/${profile.profile_pic}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto border-4 border-[#a03e4e] shadow-xl object-cover"
                  />
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#ffccbb] mb-2">{username}</h1>
                    
                    {profile.bio ? (
                      <div className="bg-[#1f1f1f] rounded-lg p-6 mb-6 border border-[#555]">
                        <h3 className="text-lg font-bold text-[#a03e4e] mb-3">About</h3>
                        <p className="text-[#ddd] leading-relaxed">{profile.bio}</p>
                      </div>
                    ) : (
                      <div className="bg-[#1f1f1f] rounded-lg p-6 mb-6 border border-[#555]">
                        <p className="text-[#aaa] italic">No bio added yet. Click "Edit Profile" to add one!</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={editFunction}
                      className="px-8 py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Profile Sections */}
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="bg-[#292929] rounded-lg shadow-lg p-6 border border-[#444]">
                  <h3 className="text-xl font-bold text-[#ffccbb] mb-4">🍷 Wine Collection</h3>
                  <p className="text-[#ccc]">Visit your cellar to see your personal wine collection and reviews.</p>
                  <button 
                    onClick={() => router.push('/cellar')}
                    className="mt-4 px-4 py-2 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors"
                  >
                    View Cellar
                  </button>
                </div>

                <div className="bg-[#292929] rounded-lg shadow-lg p-6 border border-[#444]">
                  <h3 className="text-xl font-bold text-[#ffccbb] mb-4">🔍 Discover Wines</h3>
                  <p className="text-[#ccc]">Explore our extensive wine database and find your next favorite bottle.</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors"
                  >
                    Browse Wines
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 