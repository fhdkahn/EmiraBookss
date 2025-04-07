import React, { createContext, useContext } from 'react';

// Create the context
const SearchContext = createContext<{
  globalSearchQuery: string;
  setGlobalSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}>({
  globalSearchQuery: '',
  setGlobalSearchQuery: () => {},
});

// Create the hook
export const useSearch = () => useContext(SearchContext);

// Export the context
export { SearchContext }; 