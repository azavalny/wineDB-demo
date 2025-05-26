import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cellar.css";

type userWine = {
  name: string;
  grape: string;
  region: string;
  review: string;
  rating: number;
  year: number;
};

interface WineProps {
  wineList: userWine[];
}

function WineDropdown({
    onAddWine,
    onCancel,
  }: {
    onAddWine: (wine: userWine) => void;
    onCancel: () => void;
  }) {
    const [wineName, setWineName] = useState("");
    const [grape, setGrape] = useState("");
    const [region, setRegion] = useState("");
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [year, setYear] = useState(0);
  
    const handleAdd = () => {
      const newWine: userWine = {
        name: wineName,
        grape,
        region,
        review,
        rating,
        year,
      };
      onAddWine(newWine);
      setWineName("");
      setGrape("");
      setRegion("");
      setReview("");
      setRating(0);
      setYear(0);
    };
  
    return (
      <div className="wine-dropdown">
        <h2>Wine Selection</h2>
  
        <select value={grape} onChange={(e) => setGrape(e.target.value)}>
          <option value="">Select a grape...</option>
          <option value="Barolo">Barolo</option>
          <option value="Rioja">Rioja</option>
          <option value="Châteauneuf-du-Pape">Châteauneuf-du-Pape</option>
        </select>
  
        <input
          type="text"
          placeholder="Add the name of your wine"
          value={wineName}
          onChange={(e) => setWineName(e.target.value)}
          className="review-input"
        />
  
        <input
          type="number"
          placeholder="Add the year of your wine"
          value={year || ""}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="review-input"
        />
  
        <input
          type="text"
          placeholder="Add the region of your wine"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="review-input"
        />
  
        <input
          type="text"
          placeholder="Add your review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="review-input"
        />
  
        <input
          type="number"
          placeholder="Add your rating"
          value={rating || ""}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="review-input"
        />
  
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button className="add-wine-button" onClick={handleAdd}>
            Add Wine
          </button>
          <button className="cancel-wine-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  

function Cellar({ wineList }: WineProps) {
  const [userWines, setUserWines] = useState<userWine[]>(wineList);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const addWine = (wine: userWine) => {
    setUserWines([...userWines, wine]);
    setShowForm(false);
  };

  return (
    <div className="cellar">
      <h1>My Wine Cellar</h1>
      <p>Here you can manage your wine collection.</p>

      <button className="add-wine-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Wine"}
      </button>
            <button
        style={{ marginBottom: "1rem" }}
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>

      {showForm && (
  <WineDropdown onAddWine={addWine} onCancel={() => setShowForm(false)} />
)}


      <div className="wine-list">
        {userWines.map((wine, index) => (
          <div key={index} className="wine-item">
            <h2>{wine.name}</h2>
            <p><strong>Grape:</strong> {wine.grape}</p>
            <p><strong>Region:</strong> {wine.region}</p>
            <p><strong>Year:</strong> {wine.year}</p>
            <p><strong>Review:</strong> {wine.review}</p>
            <p><strong>Rating:</strong> {wine.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cellar;