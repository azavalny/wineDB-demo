import { useEffect, useState } from "react";
import "./Home.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

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
  foodPairings?: string[]; // add this
  vineyard?: any;          // add this
  vineyard_id?: number;    // add this if not present
};

interface HomeProps{
  setCellar: (val: boolean) => void;
  setProfile: (val: boolean) => void;
}

function Home({ setCellar, setProfile }: HomeProps) {
  const [query, setQuery] = useState("");
  const [wines, setWines] = useState<Wine[]>([]);
  const [expandedWineId, setExpandedWineId] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [filter, setFilter] = useState<"name" | "price" | "year" | "food" | "vineyard">("name");
  const navigate = useNavigate();

  useEffect(() => {
  const getWines = async () => {
    try {
      const wineResponse = await axios.get(wineListApi);
      if (wineResponse.status === 200) {
        const wineList = wineResponse.data.wines.map((wine: any) => ({
          ...wine,
          reviews: []
        }));

        // Fetch foodPairings and vineyard for each wine
        const winesWithDetails = await Promise.all(
          wineList.map(async (wine: any) => {
            // Fetch food pairings
            let foodPairings: string[] = [];
            try {
              const foodRes = await axios.get(`http://localhost:8080/api/food-pairings/${wine.wine_id}`);
              foodPairings = foodRes.data.pairings;
            } catch {
              foodPairings = [];
            }

            // Fetch vineyard info
            let vineyard = null;
            if (wine.vineyard_id) {
              try {
                const vineyardRes = await axios.get(`http://localhost:8080/api/vineyard/${wine.vineyard_id}`);
                vineyard = vineyardRes.data; // <-- store the whole object
              } catch {
                vineyard = null;
              }
            }

            return {
              ...wine,
              foodPairings,
              vineyard,
            };
          })
        );

        setWines(winesWithDetails);
      }
    } catch (error) {
      console.error("Error communicating with backend", error);
    }
  };

  getWines();
}, []);


  // Update filter logic
  const filteredWines = wines.filter(w => {
    console.log(w);
    const q = query.toLowerCase();
    switch (filter) {
      case "price":
        return w.price?.toString().includes(q);
      case "year":
        return w.year?.toString().includes(q);
      case "food":
        // Assuming you have a foodPairings property (array of strings)
        return w.foodPairings?.some((food: string) => food.toLowerCase().includes(q));
      case "vineyard":
        return (
          (w.vineyard?.name?.toLowerCase().includes(q) ?? false)
        );
      default:
        return w.name.toLowerCase().includes(q);
    }
  });

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
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "1rem" }}>
        <button onClick={() => {
          setCellar(true);
          navigate("/cellar");
        }}>Personal Cellar</button>
        <button onClick={() => {
          setProfile(true);
          navigate("/profile");
        }}>Profile</button>
        <div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            style={{ padding: "6px", borderRadius: "4px" }}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="year">Year</option>
            <option value="food">Food Pairings</option>
            <option value="vineyard">Vineyard</option>
          </select>
        </div>
      </div>
      <input
        className="search"
        placeholder={`Search for wines by ${filter}...`}
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
