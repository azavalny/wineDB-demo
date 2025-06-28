import React from "react";
import WineCard from "./WineCard";

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

interface WineListProps {
  wines: Wine[];
  expandedWineId: number | null;
  setExpandedWineId: (id: number | null) => void;
  newRatings: { [wineId: number]: number };
  setNewRatings: React.Dispatch<
    React.SetStateAction<{ [wineId: number]: number }>
  >;
  newReviews: { [wineId: number]: string };
  setNewReviews: React.Dispatch<
    React.SetStateAction<{ [wineId: number]: string }>
  >;
  handleAddToCellar: (wineId: number) => void;
  classificationColors: { [key: string]: string };
}

const WineList: React.FC<WineListProps> = ({
  wines,
  expandedWineId,
  setExpandedWineId,
  newRatings,
  setNewRatings,
  newReviews,
  setNewReviews,
  handleAddToCellar,
  classificationColors,
}) => (
  <ul className="space-y-2 mb-16">
    {wines.map((wine: Wine) => (
      <WineCard
        key={wine.wine_id}
        wine={wine}
        isExpanded={expandedWineId === wine.wine_id}
        onToggleExpand={() =>
          setExpandedWineId(
            expandedWineId === wine.wine_id ? null : wine.wine_id
          )
        }
        newRating={newRatings[wine.wine_id] ?? 5}
        setNewRating={(rating: number) =>
          setNewRatings((ratings) => ({ ...ratings, [wine.wine_id]: rating }))
        }
        newReview={newReviews[wine.wine_id] ?? ""}
        setNewReview={(review: string) =>
          setNewReviews((reviews) => ({ ...reviews, [wine.wine_id]: review }))
        }
        onAddToCellar={() => handleAddToCellar(wine.wine_id)}
        classificationColors={classificationColors}
      />
    ))}
  </ul>
);

export default WineList;
