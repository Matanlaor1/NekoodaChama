import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import { supabase } from "../../supabase";
import "./Map.css";
import MapUpdater from "./MapUpdater";

const customIcon = L.icon({
  iconUrl: "public/custom-map-marker.png",
  iconSize: [50, 41],
  iconAnchor: [25, 41],
  popupAnchor: [0, -41],
});
function AddPlaceOnClick({ onLocationSelect, isSelecting }) {
  useMapEvents({
    click(e) {
      if (isSelecting) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
}

function LocationButton() {
  const map = useMap();
  const handleLocationClick = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
      },
      () => {
        alert("Could not get your location. Please enable location services.");
      }
    );
  };
  return (
    <button
      className="fixed bottom-4 left-4 z-500 p-3 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition"
      onClick={handleLocationClick}
    >
      📍
    </button>
  );
}

export default function Map({ coords }) {
  const [places, setPlaces] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchPlaces() {
      const { data, error } = await supabase.from("Places").select("*");

      if (error) {
        console.error("Error fetching places:", error);
      } else {
        setPlaces(data);
      }
    }
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    fetchUser();
    fetchPlaces();
  }, []);

  const handleAddPlaceClick = () => {
    setIsSelecting(!isSelecting);
    console.log("now selecting");
  };

  const handleLocationSelect = (latlng) => {
    if (isSelecting) {
      setSelectedPlace(latlng);
      setIsSelecting(false);
      console.log("Selected location:", latlng);
      setShowForm(true);
    }
  };

  function handleFormClose() {
    setShowForm(false);
    setSelectedPlace(null);
  }

  const handleDeletePlace = async (placeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this place? This action cannot be undone."
    );
    if (!confirmDelete) return;
    const { error } = await supabase.from("Places").delete().eq("id", placeId);
    if (error) {
      console.error("Error deleting place:", error);
    } else {
      setPlaces(places.filter((place) => place.id !== placeId));
    }
  };

  return (
    <>
      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={10}
        style={{ height: "100vh", width: "100%", zIndex: 0 }}
      >
        <button
          className="fixed bottom-5 right-4 z-500 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold shadow-lg hover:bg-orange-600 transition"
          onClick={handleAddPlaceClick}
        >
          {isSelecting ? "Stop Adding Place" : "Add Place"}
        </button>

        {showForm && selectedPlace && (
          <div className={`add-place-form ${showForm ? "show" : ""}`}>
            <h3>Add New Place</h3>
            <p>
              Selected Location: {selectedPlace.lat.toFixed(4)},{" "}
              {selectedPlace.lng.toFixed(4)}
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
              }}
              className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md border border-gray-200"
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 font-semibold mb-1"
                  htmlFor="name"
                >
                  Name:
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 font-semibold mb-1"
                  htmlFor="description"
                >
                  Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 font-semibold mb-1"
                  htmlFor="category"
                >
                  Category:
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option>Food</option>
                  <option>Shopping</option>
                  <option>Entertainment</option>
                  <option>Nature</option>
                  <option>Health</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 h-10 bg-orange-500 text-white font-semibold py-2 rounded-md shadow hover:bg-orange-600 transition"
                >
                  Save Place
                </button>
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="flex-1 h-10 border border-gray-300 rounded-md py-2 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationButton />
        <AddPlaceOnClick
          onLocationSelect={handleLocationSelect}
          isSelecting={isSelecting}
        />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            title={place.name}
            icon={customIcon}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.description}
              <br />
              <em style={{ fontWeight: 200 }}>Category: {place.category}</em>
              <br />
              {place.creator_id === user?.id && (
                <button
                  className="delete-button"
                  onClick={() => handleDeletePlace(place.id)}
                >
                  Delete
                </button>
              )}
            </Popup>
          </Marker>
        ))}
        {coords && <MapUpdater coords={coords} />}
      </MapContainer>
    </>
  );
}
