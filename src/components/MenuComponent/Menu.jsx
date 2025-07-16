import { useEffect, useState } from "react";
import "../../index.css";
import { supabase } from "../../supabase";

export default function Menu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [locationsCount, setLocationsCount] = useState(0);
  useEffect(() => {
    async function fetchLocationsCount() {
      const { count, error } = await supabase
        .from("Places")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Error fetching locations count:", error);
      } else {
        setLocationsCount(count);
      }
    }

    fetchLocationsCount();
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
        className={`fixed top-4 right-4 w-64 p-4 z-400 bg-white shadow-xl rounded-md border border-gray-200 transform transition-all duration-300 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Welcome, {user.email}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Total locations added by you: {locationsCount}
        </p>
        <button
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
