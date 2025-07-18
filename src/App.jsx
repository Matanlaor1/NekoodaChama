import React, { useEffect, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { supabase } from "./supabase";
import Map from "./components/MapComponent/Map";
import Auth from "./components/Auth/Auth";
import Menu from "./components/MenuComponent/Menu";
import SearchBar from "./components/SearchBarComponent/SearchBar";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState([32.0853, 34.7818]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div className="App">
      <Menu user={user} onLogout={handleLogout} />
      <SearchBar onLocationSelect={(coords) => setCoords(coords)} />
      <Map coords={coords} />
    </div>
  );
}
