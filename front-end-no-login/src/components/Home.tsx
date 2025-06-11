"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

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
  foodPairings?: string[];
  vineyard?: any;
  vineyard_id?: number;
};

interface HomeProps {
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
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const router = useRouter();

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
                  vineyard = vineyardRes.data;
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

  const filteredWines = wines.filter(w => {
    const q = query.toLowerCase();
    switch (filter) {
      case "price":
        return w.price?.toString().includes(q);
      case "year":
        return w.year?.toString().includes(q);
      case "food":
        return w.foodPairings?.some((food: string) => food.toLowerCase().includes(q));
      case "vineyard":
        return (w.vineyard?.name?.toLowerCase().includes(q) ?? false);
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
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast("Failed to add wine to cellar.");
      setTimeout(() => setToast(null), 2000);
      console.error(err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('user-signup-emails').insert({ email: email, created_at: new Date().toISOString() });
      if (error) throw error;
      setEmailSubmitted(true);
      setEmail("");
      setToast("Thanks for sharing your email! We'll keep you updated on new releases.");
      setTimeout(() => {
        setToast(null);
        setEmailSubmitted(false);
      }, 3000);
    } catch (err) {
      setToast("Failed to share your email with us. Please try again.");
      setTimeout(() => setToast(null), 2000);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#f1f1f1]">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-[#ffccbb] mb-4">Welcome to WineDB</h1>
            <p className="text-xl text-[#ccc]">Explore our collection of wines and find your perfect match!</p>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
            <button 
              onClick={() => {
                setCellar(true);
                router.push("/cellar");
              }}
              className="px-6 py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
            >
              Personal Cellar
            </button>
            <button 
              onClick={() => {
                setProfile(true);
                router.push("/profile");
              }}
              className="px-6 py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
            >
              Profile
            </button>
            
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="px-4 py-3 bg-[#2c2c2c] text-[#f1f1f1] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a03e4e]"
            >
              <option value="name">Search by Name</option>
              <option value="price">Search by Price</option>
              <option value="year">Search by Year</option>
              <option value="food">Search by Food Pairings</option>
              <option value="vineyard">Search by Vineyard</option>
            </select>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <input
              placeholder={`Search for wines by ${filter}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg bg-[#2c2c2c] text-[#f1f1f1] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a03e4e] placeholder-[#aaa]"
            />
          </div>

          <h2 className="text-2xl font-semibold text-[#ccc] mb-6 text-center">Some of our favorite wines:</h2>

          <ul className="space-y-2 mb-16">
            {filteredWines.map(wine => (
              <li key={wine.wine_id}>
                <div 
                  onClick={() => setExpandedWineId(prev => prev === wine.wine_id ? null : wine.wine_id)}
                  className="p-3 bg-[#292929] rounded-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-[#3a3a3a]"
                >
                  <strong className="text-[#f1f1f1]">{wine.name}</strong>
                </div>

                {expandedWineId === wine.wine_id && (
                  <div className="mt-2 bg-[#1f1f1f] p-4 rounded-lg border border-[#444] text-[#ddd]">
                    <div className="space-y-2 mb-4">
                      <p><strong>Grape:</strong> {wine.grape}</p>
                      <p><strong>Year:</strong> {wine.year}</p>
                      <p><strong>Users Rating:</strong> {wine.rating}/5</p>
                      <p><strong>Price:</strong> ${wine.price}</p>
                      
                      {wine.vineyard && (
                        <p><strong>Vineyard:</strong> {wine.vineyard.name}</p>
                      )}
                      
                      {wine.foodPairings && wine.foodPairings.length > 0 && (
                        <p><strong>Food Pairings:</strong> {wine.foodPairings.join(", ")}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold mb-2">Reviews:</h4>
                      {wine.reviews.length === 0 ? (
                        <p className="text-[#aaa] text-sm">No reviews yet.</p>
                      ) : (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {wine.reviews.map((r, i) => <li key={i}>"{r}"</li>)}
                        </ul>
                      )}
                    </div>

                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#555]">
                      <h3 className="font-bold mb-4 text-center">Add To My Cellar</h3>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2 text-[#a03e4e]">Leave a Rating:</p>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() =>
                              setNewRatings(ratings => {
                                const base = ratings[wine.wine_id] ?? 5;
                                return {
                                  ...ratings,
                                  [wine.wine_id]: Math.max(base - 1, 1),
                                };
                              })
                            }
                            className="w-8 h-8 bg-[#a03e4e] text-white rounded font-bold hover:bg-[#c45768] transition-colors"
                          >
                            -
                          </button>
                          <span className="text-lg font-bold min-w-[2rem] text-center">
                            {newRatings[wine.wine_id] ?? 5}
                          </span>
                          <button
                            onClick={() =>
                              setNewRatings(ratings => ({
                                ...ratings,
                                [wine.wine_id]: Math.min((ratings[wine.wine_id] ?? 5) + 1, 5)
                              }))
                            }
                            className="w-8 h-8 bg-[#a03e4e] text-white rounded font-bold hover:bg-[#c45768] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2 text-[#a03e4e]">Leave a Review:</p>
                        <textarea
                          placeholder="Write your review..."
                          value={newReviews[wine.wine_id] ?? ""}
                          onChange={e =>
                            setNewReviews(reviews => ({
                              ...reviews,
                              [wine.wine_id]: e.target.value
                            }))
                          }
                          className="w-full p-3 bg-[#2a2a2a] text-white border border-[#555] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#a03e4e] placeholder-[#aaa]"
                          rows={3}
                        />
                      </div>

                      <button 
                        onClick={() => handleAddToCellar(wine.wine_id)}
                        className="w-full py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
                      >
                        Add to My Cellar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-[#1f1f1f] border-t border-[#444] py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[#ffccbb] mb-4">Stay Updated with WineDB</h3>
            <p className="text-[#ccc] mb-6 max-w-2xl mx-auto">
              Be the first to know about new features, wine recommendations, and exciting updates to our platform. 
              Join our community of wine enthusiasts!
            </p>

            {!emailSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 bg-[#2c2c2c] text-[#f1f1f1] border border-[#555] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a03e4e] placeholder-[#aaa]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="max-w-md mx-auto p-4 bg-[#2a2a2a] border border-[#555] rounded-lg">
                <div className="flex items-center justify-center gap-2 text-[#a03e4e]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">Thanks for sharing your email!</span>
                </div>
                <p className="text-[#ccc] text-sm mt-2">We'll keep you updated on new features and developments.</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#444] text-[#aaa] text-sm">
              <p>&copy; 2025 WineDB. Quit whining, start drinking.</p>
            </div>
          </div>
        </div>
      </footer>

      {toast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#a03e4e] text-white px-9 py-5 rounded-lg shadow-2xl z-50 text-xl text-center opacity-97 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}

export default Home; 