import React from 'react';

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

interface WineCardProps {
  wine: Wine;
  isExpanded: boolean;
  onToggleExpand: () => void;
  newRating: number;
  setNewRating: (rating: number) => void;
  newReview: string;
  setNewReview: (review: string) => void;
  onAddToCellar: () => void;
  classificationColors: { [key: string]: string };
}

const WineCard: React.FC<WineCardProps> = ({
  wine,
  isExpanded,
  onToggleExpand,
  newRating,
  setNewRating,
  newReview,
  setNewReview,
  onAddToCellar,
  classificationColors,
}) => (
  <li>
    <div 
      onClick={onToggleExpand}
      className="bg-[#222] p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer hover:bg-[#333]"
    >
      <h3
        className="text-xl font-bold"
        style={{ color: classificationColors[wine.classification] || "#f1f1f1" }}
      >
        {wine.name} ({wine.year})
      </h3>
    </div>
    {isExpanded && (
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
          <p><strong>Appelation:</strong> {wine.appelation}</p>
          <p><strong>Region:</strong> {wine.region}</p>
          <p><strong>Country:</strong> {wine.country}</p>
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
              {wine.reviews.map((r: string, i: number) => <li key={i}>"{r}"</li>)}
            </ul>
          )}
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#555]">
          <h3 className="font-bold mb-4 text-center">Add To My Cellar</h3>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 text-[#a03e4e]">Leave a Rating:</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setNewRating(Math.max(newRating - 1, 1));
                }}
                className="w-8 h-8 bg-[#a03e4e] text-white rounded font-bold hover:bg-[#c45768] transition-colors"
              >
                -
              </button>
              <span className="text-lg font-bold min-w-[2rem] text-center">
                {newRating}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setNewRating(Math.min(newRating + 1, 5));
                }}
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
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              className="w-full p-3 bg-[#2a2a2a] text-white border border-[#555] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#a03e4e] placeholder-[#aaa]"
              rows={3}
            />
          </div>
          <button 
            onClick={e => {
              e.stopPropagation();
              onAddToCellar();
            }}
            className="w-full py-3 bg-[#a03e4e] text-white font-bold rounded-lg hover:bg-[#c45768] transition-colors duration-200"
          >
            Add to My Cellar
          </button>
        </div>
      </div>
    )}
  </li>
);

export default WineCard; 