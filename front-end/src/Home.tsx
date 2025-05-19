import { useEffect, useState } from "react";
import "./Home.css";
import axios from 'axios';

const wineListApi = "http://localhost:8080/api-wine-list";


type Wine = {
  wine_id: number;
  name: string;
  classification: string;
  grape: string;
  year: number;
  price: number;
  rating: number;
  region?: string; 
  reviews: string[]; 
};

interface HomeProps{
  setCellar: (val: boolean) => void;
}

function Home({setCellar}: HomeProps) {
  const [query, setQuery] = useState("");
  const [wines, setWines] = useState<Wine[]>([]);
  const [expandedWineId, setExpandedWineId] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
  const getWines = async () => {
    try {
      const wineResponse = await axios.get(wineListApi);
      if (wineResponse.status === 200) {
        const wineList = wineResponse.data.wines.map((wine: any) => ({
          ...wine,
          reviews: [] 
        }));
        setWines(wineList);
      }
    } catch (error) {
      console.error("Error communicating with backend", error);
    }
  };

  getWines();
}, []);


  const filteredWines = wines.filter(w =>
    w.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddReview = (wineId: number) => {
    if (reviewText.trim()) {
      setWines(prev =>
        prev.map(w =>
          w.wine_id === wineId ? { ...w, reviews: [...w.reviews, reviewText] } : w
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
      <button onClick={ () =>{
        setCellar(true);
      }}>Personal Cellar</button>

      <input
        className="search"
        placeholder="Search for wines..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p>Some of our favorite wines: </p>

      <ul className="wine-list">
        {filteredWines.map(wine => (
          <li key={wine.wine_id}>
            <div onClick={() =>
              setExpandedWineId(prev => prev === wine.wine_id ? null : wine.wine_id)

            }>
              <strong>{wine.name}</strong>
            </div>

            {expandedWineId === wine.wine_id && (
              <div className="wine-info">
                <p><strong>Grape:</strong> {wine.grape}</p>
                <p><strong>Year:</strong> {wine.year}</p>
                <p><strong>Users Rating:</strong> {wine.rating}</p>
                <p><strong>Price:</strong> {wine.price}</p>
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
                    <button onClick={() => handleAddReview(wine.wine_id)}>Submit</button>

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
