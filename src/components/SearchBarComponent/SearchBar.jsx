import { useState, useEffect } from "react";
import "./SearchBar.css";

export default function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = await response.json();
        setResults(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (location) => {
    setQuery(location.display_name);
    setResults([]);
    onLocationSelect([parseFloat(location.lat), parseFloat(location.lon)]);
  };
  return (
    <div className="fixed top-2 w-3/4 left-1/2 transform -translate-x-1/2 max-w-md z-50">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Search for a place..."
      />
      {isLoading && (
        <div className="absolute left-0 mt-1 w-full bg-white text-sm text-gray-500 p-2">
          Searching...
        </div>
      )}
      {results.length > 0 && (
        <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
          {results.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
