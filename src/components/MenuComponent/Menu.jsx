import { useEffect, useState } from "react";
import "./Menu.css";
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
    <div className={`menu ${isOpen ? "open" : ""}`}>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      {isOpen && (
        <div className="menu-content">
          <h2 className="menu-title">Welcome, {user.email}</h2>
          <p className="locations-count">Total Locations: {locationsCount}</p>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
