"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Wine = {
  wine_id: number;
  name: string;
  classification: string;
  grape: string;
  year: number;
  price: number;
  rating: number;
  region?: string;
  country?: string;
  appelation?: string;
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

const classificationColors: { [key: string]: string } = {
  "Orange": "#ffb347",
  "White - Sparkling": "#e6e6e6",
  "Red": "#b22222",
  "White - Off-dry": "#f7e7b0",
  "Rosé": "#ff69b4",
  "White - Sweet/Dessert": "#ffe4b5",
  "White": "#fffacd",
  "Red - Sweet/Dessert": "#c71585",
  "Spirits": "#8b5c2a",
  "Rosé - Sparkling": "#ffb6c1",
};

function Home({ setCellar, setProfile, username }: HomeProps) {
  const [supabase] = useState(() => createClient());
  const [query, setQuery] = useState("");
  const [wines, setWines] = useState<Wine[]>([]);
  const [expandedWineId, setExpandedWineId] = useState<number | null>(null);
  const [filter, setFilter] = useState<
    "name" | "year" | "food" | "vineyard" | "country" | "appelation" | "region"
  >("food");
  // Advanced Search Toggle
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [newReviews, setNewReviews] = useState<{ [wineId: number]: string }>({});
  const [newRatings, setNewRatings] = useState<{ [wineId: number]: number }>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    localStorage.getItem("username") ? setIsLoggedIn(true) : setIsLoggedIn(false);
    const getWines = async () => {
      try {
        const { data: wineList, error } = await supabase
          .from('wine')
          .select('*')
          .not('rating', 'is', null)
          .gt('year', 2020)
          .order('rating', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching wines:", error);
          throw error;
        }

        if (wineList) {
          const wineListWithReviews = wineList.map((wine: any) => ({
            ...wine,
            reviews: []
          }));
          
          // Initialize default ratings for all wines
          const initialRatings: { [key: number]: number } = {};
          wineListWithReviews.forEach((wine: any) => {
            initialRatings[wine.wine_id] = 5; // Default rating of 5
          });
          setNewRatings(initialRatings);
          
          // Fetch foodPairings and vineyard for each wine
          const winesWithDetails = await Promise.all(
            wineListWithReviews.map(async (wine: any) => {
              // Fetch food pairings
              const { data: foodPairingsData, error: foodError } = await supabase
                .from('food-pairing')
                .select('name')
                .eq('wine_id', wine.wine_id);

              if(foodError) console.error("Error fetching food pairings:", foodError)

              const foodPairings = foodPairingsData ? foodPairingsData.map((p: any) => p.name) : [];

              // Fetch vineyard info
              let vineyard = null;
              if (wine.vineyard_id) {
                const { data: vineyardData, error: vineyardError } = await supabase
                  .from('vineyard')
                  .select('*')
                  .eq('vineyard_id', wine.vineyard_id)
                  .single();

                if(vineyardError) console.error("Error fetching vineyard:", vineyardError);
                
                vineyard = vineyardData;
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
        console.error("Error communicating with Supabase", error);
      }
    };

    getWines();
  }, [supabase]);

  // Add a helper to determine if the user is searching
  const isSearching = showAdvancedSearch || query.trim() !== '';

  const filteredWines = isSearching
    ? wines.filter(w => {
        const q = query.toLowerCase();
        switch (filter) {
          case "year":
            return w.year?.toString().includes(q);
          case "food":
            return w.foodPairings?.some((food: string) => food.toLowerCase().includes(q));
          case "vineyard":
            return (w.vineyard?.name?.toLowerCase().includes(q) ?? false);
          case "country":
            return (w.vineyard?.country?.toLowerCase().includes(q) ?? false);
          case "appelation":
            return (w.appelation?.toLowerCase().includes(q) ?? false);
          case "region":
            return (w.region?.toLowerCase().includes(q) ?? false);
          default:
            return w.name.toLowerCase().includes(q);
        }
      })
    : wines;

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

  return (
    <div className="min-h-screen bg-[#181818] text-[#f1f1f1]">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <section className="py-20 bg-gradient-to-b from-[#1b1b1b] to-[#141414] text-center rounded-lg shadow-inner">
              <h1 className="text-6xl font-serif text-[#ffccbb] drop-shadow-md mb-3">🍷 WineDB</h1>
              <p className="text-lg text-[#ffe6dc] italic mb-6">
                Quit whining about not finding the perfect wine!
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {isLoggedIn ? (
                  <>
                    <button className="rounded-full px-6 py-3 bg-[#a03e4e] text-white font-semibold shadow-md hover:bg-[#c45768] transition">
                      My Cellar
                    </button>
                    <button className="rounded-full px-6 py-3 bg-[#a03e4e] text-white font-semibold shadow-md hover:bg-[#c45768] transition">
                      Profile
                    </button>
                  </>
                ) : (
                  <button className="rounded-full px-6 py-3 bg-[#a03e4e] text-white font-semibold shadow-md hover:bg-[#c45768] transition">
                    Login / Sign Up
                  </button>
                )}
              </div>
            </section>


        </div>
          {!showAdvancedSearch && ( 
            <div className="text-center mb-4">
              <p className="text-lg text-[#ccc]">Need a recommendation? Let our virtual sommelier help you find the perfect wine.</p>
            </div>
          )}

          <div className="flex w-full max-w-2xl mx-auto mb-8 rounded-lg overflow-hidden shadow-md">
            <input
              placeholder={showAdvancedSearch ? `Search for wines by ${filter}...` : "What are you in the mood to eat?"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow px-4 py-3 text-lg bg-[#2c2c2c] text-[#f1f1f1] placeholder-[#aaa] focus:outline-none"
            />
            <button
              onClick={() => console.log('search')}
              className="px-4 bg-[#a03e4e] hover:bg-[#c45768] transition text-white flex items-center justify-center"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              onClick={() => setShowAdvancedSearch(prev => !prev)}
              className={`px-5 text-sm font-semibold transition whitespace-nowrap
                ${showAdvancedSearch
                  ? 'bg-[#a03e4e] text-white hover:bg-[#c45768]'
                  : 'bg-[#ffccbb] text-[#181818] hover:bg-[#a03e4e] hover:text-white'}
              `}
            >
              {showAdvancedSearch ? 'Sommelier Search' : 'Advanced Search'}
            </button>
          </div>



          {showAdvancedSearch && (
            <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="px-4 py-3 bg-[#2c2c2c] text-[#f1f1f1] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a03e4e]"
              >
                <option value="name">Search by Name</option>
                <option value="year">Search by Year</option>
                <option value="food">Search by Food Pairings</option>
                <option value="vineyard">Search by Vineyard</option>
                <option value="appelation">Search by Appelation</option>
                <option value="region">Search by Region</option>
                <option value="country">Search by Country</option>
              </select>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-[#ccc] mb-6 text-center">Some of our favorite wines:</h2>

          <ul className="space-y-2 mb-16">
            {filteredWines.map(wine => (
              <li key={wine.wine_id}>
                <div 
                  onClick={() => setExpandedWineId(prev => prev === wine.wine_id ? null : wine.wine_id)}
                  className="bg-[#222] p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer hover:bg-[#333]"
                >
                  <h3
                    className="text-xl font-bold"
                    style={{ color: classificationColors[wine.classification] || "#f1f1f1" }}
                  >
                    {wine.name}
                  </h3>
                </div>


                {expandedWineId === wine.wine_id && (
                  <div className="mt-2 bg-[#1f1f1f] p-4 rounded-lg border border-[#444] text-[#ddd]">
                    <div className="space-y-2 mb-4">
                      <p>
                        <strong style={{ color: classificationColors[wine.classification] || "#f1f1f1" }}>
                          {wine.classification}
                        </strong>
                      </p>
                      <p><strong>Grape:</strong> {wine.grape}</p>
                      <p><strong>Year:</strong> {wine.year}</p>
                      <p><strong>Rating:</strong> {wine.rating}/5</p>            
                      {wine.vineyard && (
                        <p><strong>Vineyard:</strong> {wine.vineyard.name}</p>
                      )}
                      
                      {wine.foodPairings && wine.foodPairings.length > 0 && (
                        <p><strong>Food Pairings:</strong> {wine.foodPairings.join(", ")}</p>
                      )}

                      <button
                        onClick={() => {
                          const url = `https://www.wine-searcher.com/find/${encodeURIComponent(
                            `${wine.classification} ${wine.name} ${wine.year}`
                              .replace(/\s+/g, '+')
                              .toLowerCase()
                          )}/usa`;
                          window.open(url, "_blank");
                        }}
                        className="px-3 py-1 bg-[#a03e4e] text-white rounded hover:bg-[#c45768] transition-colors"
                        type="button"
                      >
                      Lookup Price
                    </button>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold mb-2">Reviews:</h4>
                      {wine.reviews.length === 0 ? (
                        <p className="text-[#aaa] text-sm">Reviews coming soon!</p>
                      ) : (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {wine.reviews.map((r, i) => <li key={i}>"{r}"</li>)}
                        </ul>
                      )}
                    </div>  

                    <div >

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

      {toast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#a03e4e] text-white px-9 py-5 rounded-lg shadow-2xl z-50 text-xl text-center opacity-97 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
  
}

export default Home; 