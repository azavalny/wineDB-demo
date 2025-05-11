import { useState } from "react";
import "./Home.css";

type Wine = {
  id: number;
  name: string;
  grape: string;
  region: string;
  reviews: string[];
};

const initialWines: Wine[] = [
  { id: 1, name: "Barolo Riserva", grape: "Nebbiolo", region: "Piedmont", reviews: [] },
  { id: 2, name: "Rioja Gran Reserva", grape: "Tempranillo", region: "Spain", reviews: [] },
  { id: 3, name: "Châteauneuf-du-Pape", grape: "Grenache Blend", region: "Rhone Valley", reviews: [] },
];

function Home() {
  const [query, setQuery] = useState("");
  const [wines, setWines] = useState(initialWines);
  const [expandedWineId, setExpandedWineId] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const filteredWines = wines.filter(w =>
    w.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddReview = (wineId: number) => {
    if (reviewText.trim()) {
      setWines(prev =>
        prev.map(w =>
          w.id === wineId ? { ...w, reviews: [...w.reviews, reviewText] } : w
        )
      );
      setReviewText("");
      setShowReviewForm(false);
    }
  };

  return (
    <div className="home">
      <h1>Welcome to the Wine Database</h1>
      <p>Explore our collection of wines and find your perfect match!</p>

      <input
        className="search"
        placeholder="Search for wines..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p>Some of our favorite wines: </p>

      <ul className="wine-list">
        {filteredWines.map(wine => (
          <li key={wine.id}>
            <div onClick={() =>
              setExpandedWineId(prev => prev === wine.id ? null : wine.id)
            }>
              <strong>{wine.name}</strong>
            </div>

            {expandedWineId === wine.id && (
              <div className="wine-info">
                <p><strong>Grape:</strong> {wine.grape}</p>
                <p><strong>Region:</strong> {wine.region}</p>
                <h4>Reviews:</h4>
                <ul>
                  {wine.reviews.length === 0 && <li>No reviews yet.</li>}
                  {wine.reviews.map((r, i) => <li key={i}>{r}</li>)}
                </ul>

                {!showReviewForm ? (
                  <button onClick={() => setShowReviewForm(true)}>Add Review</button>
                ) : (
                  <div className="review-form">
                    <textarea
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <button onClick={() => handleAddReview(wine.id)}>Submit</button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
