import { useEffect, useState } from "react";
import "../../index.css";
import { supabase } from "../../supabase";

export default function Menu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [locationsCount, setLocationsCount] = useState(0);
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    if (!user) {
      setLocations([]);
      setLocationsCount(0);
      return;
    }

    async function fetchUserLocations() {
      const { data, count, error } = await supabase
        .from("Places")
        .select("*", { count: "exact" })
        .eq("creator_id", user.id);

      if (error) {
        console.error("Error fetching user locations:", error);
      } else {
        setLocations(data);
        setLocationsCount(count);
      }
    }

    fetchUserLocations();
  }, [user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className="fixed top-4 right-4 z-500 p-2 text-white bg-orange-500 rounded-md shadow hover:bg-orange-600 transition"
        onClick={toggleMenu}
      >
        ☰
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-64 p-4 z-400 bg-white shadow-xl rounded-md border border-gray-200 transform transition-all duration-300 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Welcome, {user.email}
        </h2>
        <h3 className="text-lg font-semibold mb-3">
          Your Locations ({locationsCount})
        </h3>

        {locations.length === 0 ? (
          <p className="text-gray-500 italic">
            You haven't added any locations yet.
          </p>
        ) : (
          <ul className="max-h-48 overflow-y-auto">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="py-1 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
              >
                <span className="truncate">{loc.name}</span>
                <span className="text-sm text-gray-400 ml-2">
                  {loc.category}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          className="fixed bottom-4 w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition max-w-[calc(100%-32px)]"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
