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
    <button className="location-button" onClick={handleLocationClick}>
      📍
    </button>
  );
}

export default function Map() {
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
        style={{ height: "100vh", width: "100%" }}
      >
        <button className="add-place-button" onClick={handleAddPlaceClick}>
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
                const name = e.target.name.value;
                const description = e.target.description.value;

                const {
                  data: { user },
                } = await supabase.auth.getUser();

                const { data, error } = await supabase
                  .from("Places")
                  .insert([
                    {
                      name,
                      description,
                      category: e.target.category.value,
                      lat: selectedPlace.lat,
                      lng: selectedPlace.lng,
                      creator_id: user.id,
                    },
                  ])
                  .select();

                if (error) {
                  console.error("Error adding place:", error);
                } else {
                  setPlaces([...places, data[0]]);
                  handleFormClose();
                }
              }}
            >
              <div>
                <label>
                  Name:
                  <input type="text" name="name" required />
                </label>
              </div>
              <div>
                <label>
                  Description:
                  <textarea name="description" required />
                </label>
              </div>
              <div>
                <label>
                  Category:
                  <select name="category" required>
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Nature">Nature</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
              <button type="submit">Save Place</button>
              <button type="button" onClick={handleFormClose}>
                Cancel
              </button>
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
      </MapContainer>
    </>
  );
}
