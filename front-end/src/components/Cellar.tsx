"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import axios from "axios";


const backend = "http://localhost:8080/api";

type userWine = {
  wine_id: number;
  name: string;
  classification: string;
  year: number;
  rating: number;
  location: string;
  appellation: string;
};

interface WineProps {
  username: string;
}

function SommelierAdvice({ wineName }: { wineName: string }) {
  const [adviceRaw, setAdviceRaw] = useState('');                 // live “typing”
  const [adviceObj, setAdviceObj] = useState<Record<string, any> | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [done, setDone] = useState(false);          // finished streaming
  const [visible, setVisible] = useState(true);

  const fetchAdvice = async () => {
    setAdviceRaw('');
    setAdviceObj(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-wine-info', {
        method: 'POST',
        body:   JSON.stringify({ wineName }),
        headers:{ 'Content-Type': 'application/json' },
      });
      if (!res.ok || !res.body) throw new Error('No response from server');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());    // ndjson ⇒ 1 obj / line

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            /* live typing effect (optional) */
            if (data.partial) {
              setAdviceRaw(prev => prev + data.partial);
            }

            /* final structured object */
            if (data.wineInfo) {
              setAdviceObj(data.wineInfo);
              setDone(true);
            }

            /* backend-side error */
            if (data.error) {
              setAdviceRaw(data.error);
            }
          } catch (e) {
            console.error('Bad JSON line:', line);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setAdviceRaw(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  /* --- render --------------------------------------------------------- */
  return (
  <div className="mt-4 max-w-2xl">
    {/* Always show the button */}
    <div className="text-lg font-bold text-[#ffccbb] mb-2 flex justify-center">
      <button
        onClick={() => {
          if (done) {
            // Clicked "Got it" → hide section and reset
            setVisible(false);
            setDone(false);
            setAdviceObj(null);
            setAdviceRaw('');
          } else {
            // Either first-time or re-opening after hiding
            setVisible(true);
            fetchAdvice();
          }
        }}
        disabled={loading}
        className={`rounded-full px-4 py-2 font-semibold transition disabled:opacity-50
          ${done
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-[#a03e4e] hover:bg-[#c45768] text-white'}`}
      >
        {loading ? 'Consulting Sommelier…' : done ? 'Got it' : 'Sommelier Advice'}
      </button>

    </div>

    {/* Show advice section only if visible */}
    {visible && (
      <>
        {adviceObj && (
          <div className="bg-[#1e1e1e] text-sm p-4 rounded-lg border border-[#333] space-y-6 mt-4 max-w-2xl">
            {Object.entries(adviceObj).map(([section, content]) => (
              <div key={section}>
                <h3 className="font-bold uppercase tracking-wide text-[#ffccbb] mb-2">
                  {section.replace(/_/g, ' ')}
                </h3>

                {typeof content === 'object' && !Array.isArray(content) ? (
                  <ul className="ml-4 list-disc text-[#ddd] space-y-1">
                    {Object.entries(content).map(([k, v]) => (
                      <li key={k}>
                        <span className="font-medium capitalize">{k.replace(/_/g, ' ')}:</span>{' '}
                        {v}
                      </li>
                    ))}
                  </ul>
                ) : Array.isArray(content) ? (
                  <ul className="ml-4 list-disc text-[#ddd] space-y-1">
                    {content.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="ml-4 text-[#ddd]">{content}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {!adviceObj && adviceRaw && (
          <pre className="whitespace-pre-wrap mt-4 p-4 bg-[#262626] rounded-lg border border-[#444] text-[#ddd]">
            {adviceRaw}
          </pre>
        )}
      </>
    )}
  </div>
);


    
    
}



function Cellar({ username }: WineProps) {
  const [userWines, setUserWines] = useState<userWine[]>([]);
  const [editingWine, setEditingWine] = useState<userWine | null>(null);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [supabase] = useState(() => createClient());


  const router = useRouter();

  useEffect(() => {
    const fetchUserCellar = async () => {
      try {
        const usernameLocal = localStorage.getItem("username");
        const { data, error } = await supabase
          .from('cellar')
          .select(`
            wine:wine_id(*)  -- fetch all columns from the wine table via FK
          `)
          .eq('username', usernameLocal);  

        if (error) {
          console.error("Failed to fetch user wines:", error.message);
          return;
        }

        if (data) {
          const wines: userWine[] = data.map((row: any) => row.wine);
          setUserWines(wines);
        }
      } catch (error) {
        console.error("Error fetching user cellar:", error);
      }
    };

    fetchUserCellar();
  }, [supabase]);

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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 mb-4 text-[#ddd]">
                  <div><span className="font-semibold text-[#ffccbb]">Classification:</span> {wine.classification}</div>
                  <div><span className="font-semibold text-[#ffccbb]">Year:</span> {wine.year}</div>
                  <div><span className="font-semibold text-[#ffccbb]">Location:</span> {wine.location}</div>
                  {wine.appellation && (
                    <div><span className="font-semibold text-[#ffccbb]">Appellation:</span> {wine.appellation}</div>
                  )}
                  <div><span className="font-semibold text-[#ffccbb]">Rating:</span> {wine.rating}/5</div>
                  
                </div>
                <div className="flex justify-center mt-4">
                  <SommelierAdvice wineName={wine.name} />
                </div>

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
                          //onClick={submitEdit}
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