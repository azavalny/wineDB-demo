"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const backend = "http://localhost:8080/api";

type userWine = {
  name: string;
  grape: string;
  region: string;
  review: string;
  rating: number;
  year: number;
};

interface WineProps {
  username: string;
}

function Cellar({ username }: WineProps) {
  const [userWines, setUserWines] = useState<userWine[]>([]);
  const [editingWine, setEditingWine] = useState<userWine | null>(null);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);

  const router = useRouter();

  const handleEdit = (wine: userWine) => {
    setEditingWine(wine);
    setNewReview(wine.review);
    setNewRating(wine.rating);
  };

  const submitEdit = async () => {
    if (!editingWine) return;

    try {
      const response = await axios.put(`${backend}/cellar/update`, {
        username,
        wineName: editingWine.name,
        newReview,
        newRating,
      });

      if (response.status === 200) {
        setUserWines((prevWines) =>
          prevWines.map((w) =>
            w.name === editingWine.name
              ? { ...w, review: newReview, rating: newRating }
              : w
          )
        );
        setEditingWine(null);
      }
    } catch (error) {
      console.error("Error updating wine:", error);
    }
  };

  useEffect(() => {
    const fetchUserCellar = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/cellar/${username}`);
        if (response.status === 200) {
          const data = await response.json();

          if (data.message === "Cellar is empty") {
            console.log("Cellar is empty");
            setUserWines([]);
            return;
          }

          console.log("Fetched user cellar:", data);

          const transformed: userWine[] = data.cellar.map((wine: any) => ({
            name: wine.name,
            grape: wine.grape,
            region: wine.region,
            review: wine.review || "",
            rating: wine.rating,
            year: wine.year,
          }));

          setUserWines(transformed);
        } else {
          console.error("Failed to fetch user cellar");
        }
      } catch (error) {
        console.error("Error fetching user cellar:", error);
      }
    };

    fetchUserCellar();
  }, [username]);

  const handleRemove = async (wine: userWine) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/cellar/remove/${username}/${encodeURIComponent(wine.name)}`);

      if (response.status === 200) {
        setUserWines((prevWines) => prevWines.filter((w) => w.name !== wine.name));
        console.log("Wine removed successfully");
      }
    } catch (error) {
      console.error("Error removing wine:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#f1f1f1] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#ffccbb] mb-4">My Wine Cellar</h1>
          <p className="text-xl text-[#ccc]">Here you can manage your wine collection</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>

        {userWines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍷</div>
            <h2 className="text-2xl font-semibold text-[#ccc] mb-2">Your cellar is empty</h2>
            <p className="text-[#aaa]">Start adding wines from the home page to build your collection!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userWines.map((wine, index) => (
              <div key={index} className="bg-[#292929] rounded-lg p-6 border border-[#444] hover:bg-[#3a3a3a] transition-colors duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-[#f1f1f1]">{wine.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(wine)}
                      className="p-2 bg-[#a03e4e] text-white rounded-lg hover:bg-[#c45768] transition-colors"
                      title="Edit wine"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemove(wine)}
                      className="p-2 bg-[#a03e4e] text-white rounded-lg hover:bg-[#c45768] transition-colors"
                      title="Remove wine"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-[#ddd]">
                  <div><strong>Grape:</strong> {wine.grape}</div>
                  <div><strong>Year:</strong> {wine.year}</div>
                  <div><strong>Region:</strong> {wine.region}</div>
                  <div><strong>Rating:</strong> {wine.rating}/5</div>
                </div>

                {wine.review && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2 text-[#a03e4e]">Your Review:</h4>
                    <p className="text-[#ccc] italic">"{wine.review}"</p>
                  </div>
                )}

                {editingWine?.name === wine.name && (
                  <div className="bg-[#1f1f1f] rounded-lg p-4 mt-4 border border-[#555]">
                    <h3 className="font-bold mb-4 text-center text-[#f1f1f1]">Edit Wine</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#a03e4e] mb-2">
                          Review:
                        </label>
                        <textarea
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          rows={3}
                          className="w-full p-3 bg-[#2a2a2a] text-white border border-[#555] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#a03e4e] placeholder-[#aaa]"
                          placeholder="Share your thoughts about this wine..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#a03e4e] mb-2">
                          Rating (1–5):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={newRating}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1 && val <= 5) setNewRating(val);
                          }}
                          className="w-20 p-2 bg-[#2a2a2a] text-white border border-[#555] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a03e4e]"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={submitEdit}
                          className="flex-1 py-2 px-4 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingWine(null)}
                          className="flex-1 py-2 px-4 bg-[#555] text-white font-bold rounded-lg hover:bg-[#666] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cellar; 