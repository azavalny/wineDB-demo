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
  username: string;
}

function Home({ setCellar, setProfile, username }: HomeProps) {
  const [query, setQuery] = useState("");
  const [wines, setWines] = useState<Wine[]>([]);
  const [expandedWineId, setExpandedWineId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"name" | "price" | "year" | "food" | "vineyard">("name");
  const [newReviews, setNewReviews] = useState<{ [wineId: number]: string }>({});
  const [newRatings, setNewRatings] = useState<{ [wineId: number]: number }>({});
  const [toast, setToast] = useState<string | null>(null);
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
        // Initialize default ratings for all wines
        const initialRatings: { [key: number]: number } = {};
        wineList.forEach((wine: any) => {
          initialRatings[wine.wine_id] = 5; // Default rating of 5
        });
        setNewRatings(initialRatings);
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
    //console.log(w);
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

  const handleAddToCellar = async (wineId: number) => {
    const rating = newRatings[wineId];
    const review = newReviews[wineId] ?? "";
    try {
      console.log(rating);
      await axios.post("http://localhost:8080/api-add-to-cellar", {
        username,
        wine_id: wineId,
        rating, 
        review,
      });
      setToast("Wine added to your cellar!");
      setTimeout(() => setToast(null), 2000); // Reset toast after 2 seconds
    } catch (err) {
      setToast("Failed to add wine to cellar.");
      setTimeout(() => setToast(null), 2000); // Reset toast after 2 seconds
      console.error(err);
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

                <h3>Add To My Cellar</h3>

                <p>Leave a Rating:</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() =>
                      setNewRatings(ratings => {
                        const base =
                          ratings[wine.wine_id] ??
                          (Number.isFinite(wine.rating) ? Math.round(wine.rating) : 5);
                        return {
                          ...ratings,
                          [wine.wine_id]: Math.max(base - 1, 1),
                        };
                      })

                      
                    }
                  >
                    -
                  </button>
                  <span>
                    {newRatings[wine.wine_id] ??
                      (Number.isInteger(wine.rating) && wine.rating >= 1 && wine.rating <= 5
                        ? wine.rating
                        : 5)}
                  </span>
                  <button
                    onClick={() =>
                      setNewRatings(ratings => ({
                        ...ratings,
                        [wine.wine_id]: Math.min(
                          Math.floor(ratings[wine.wine_id] ?? Math.round(wine.rating) ?? 5) + 1,
                          5
                        )
                      }))
                    }
                  >
                    +
                  </button>
                </div>
                <br></br>
                <p>Leave a Review:</p>
                 <textarea
                      placeholder="Write your review..."
                      value={newReviews[wine.wine_id] ?? ""}
                      onChange={e =>
                        setNewReviews(reviews => ({
                          ...reviews,
                          [wine.wine_id]: e.target.value
                        }))
                      }
                      style={{ width: "75%", height: "60px" }}
                    />

              <br />
              <br></br>
              <button onClick={() => handleAddToCellar(wine.wine_id)}>
                Add to My Cellar
              </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Home;
