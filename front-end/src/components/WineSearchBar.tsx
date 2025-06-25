import React from 'react';

interface WineSearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  showAdvancedSearch: boolean;
  setShowAdvancedSearch: (show: boolean) => void;
  filter: string;
  setFilter: (filter: string) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

const WineSearchBar: React.FC<WineSearchBarProps> = ({
  query,
  setQuery,
  showAdvancedSearch,
  setShowAdvancedSearch,
  filter,
  setFilter,
  onSearch,
  isLoading,
}) => (
  <div className="flex w-full max-w-2xl mx-auto mb-8 rounded-lg overflow-hidden shadow-md">
    <input
      placeholder={showAdvancedSearch ? `Search for wines by ${filter}...` : "What are you in the mood to eat?"}
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && !showAdvancedSearch && onSearch) {
          onSearch(query);
        }
      }}
      className="flex-grow px-4 py-3 text-lg bg-[#2c2c2c] text-[#f1f1f1] placeholder-[#aaa] focus:outline-none"
    />
    <button
      onClick={() => onSearch && onSearch(query)}
      className="px-4 bg-[#a03e4e] hover:bg-[#c45768] transition text-white flex items-center justify-center"
      aria-label="Search"
      disabled={isLoading}
    >
      {isLoading ? (
        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </button>
    <button
      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
      className={`px-5 text-sm font-semibold transition whitespace-nowrap
        ${showAdvancedSearch
          ? 'bg-[#a03e4e] text-white hover:bg-[#c45768]'
          : 'bg-[#ffccbb] text-[#181818] hover:bg-[#a03e4e] hover:text-white'}
      `}
    >
      {showAdvancedSearch ? 'Sommelier Search' : 'Advanced Search'}
    </button>
  </div>
);

export default WineSearchBar; 