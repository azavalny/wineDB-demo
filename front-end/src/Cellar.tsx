import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cellar.css";
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

  const navigate = useNavigate();

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
    <div className="cellar">
      <h1>My Wine Cellar</h1>
      <p>Here you can manage your wine collection.</p>

            <button
        style={{ marginBottom: "1rem" }}
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
      <div className="wine-list">
      {userWines.map((wine, index) => (
        <div key={index} className="wine-item">
          <div className="button-icons">
            <button onClick={() => handleRemove(wine)} className="icon-btn">
              <i className="fas fa-trash-alt"></i>
            </button>
            <button onClick={() => handleEdit(wine)} className="icon-btn">
              <i className="fas fa-edit"></i>
            </button>
          </div>
          <h2>{wine.name}</h2>
          <p><strong>Grape:</strong> {wine.grape}</p>
          <p><strong>Region:</strong> {wine.region}</p>
          <p><strong>Year:</strong> {wine.year}</p>
          <p><strong>Review:</strong> {wine.review}</p>
          <p><strong>Rating:</strong> {wine.rating}</p>
          {editingWine?.name === wine.name && (
          <div className="edit-form" style={{ backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginTop: "10px" }}>
          <div style={{ marginBottom: "5px" }}>
            <label style ={{ color: "black", marginBottom: "10px", marginTop: "10px" }}>
              Review:
              <br />
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows={3}
                style={{ width: "100%" , marginTop: "5px"}}
              />
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style ={{ color: "black", marginBottom: "10px", marginTop: "10px" }}>
              Rating (1–5):
              <br />
              <input
                type="number"
                min={1}
                max={5}
                value={newRating}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 5) setNewRating(val);
                }}
                style={{ width: "100px", marginTop: "5px", marginLeft: "0px" }}
              />
            </label>
          </div>

          <button onClick={submitEdit} style={{ marginRight: "10px", marginLeft: "0px" }}>
            Submit
          </button>
          <button onClick={() => setEditingWine(null)}>Cancel</button>
        </div>

        )}

        </div>
      ))}
    </div>

    </div>
  );
}

export default Cellar;