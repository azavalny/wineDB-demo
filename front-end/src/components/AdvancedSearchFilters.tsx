import React from 'react';

interface AdvancedSearchFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({ filter, setFilter }) => (
  <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
    <select
      value={filter}
      onChange={e => setFilter(e.target.value)}
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
);

export default AdvancedSearchFilters; 