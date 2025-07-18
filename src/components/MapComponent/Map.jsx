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
import AddPlaceForm from "./AddPlaceForm";

const customIcon = L.icon({
  iconUrl: "/custom-map-marker.png",
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

export default function Map() {
  const [places, setPlaces] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [coords, setCoords] = useState([32.0853, 34.7818]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setCoords([32.0853, 34.7818]);
      }
    );
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
      <div className="relative h-screen w-full">
        {showForm && (
          <AddPlaceForm
            selectedPlace={selectedPlace}
            onSubmit={async (placeData) => {
              const { error } = await supabase.from("Places").insert([
                {
                  ...placeData,
                  creator_id: user.id,
                },
              ]);
              if (error) {
                console.error("Error adding place:", error);
              } else {
                setPlaces([...places, { ...placeData, id: Date.now() }]);
                handleFormClose();
              }
            }}
            onCancel={handleFormClose}
          />
        )}
        <MapContainer
          center={coords}
          zoom={10}
          style={{ height: "100vh", width: "100%", zIndex: 0 }}
          z-index={0}
        >
          <button
            className="fixed bottom-5 right-4 z-500 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold shadow-lg hover:bg-orange-600 transition"
            onClick={handleAddPlaceClick}
          >
            {isSelecting ? "Stop Adding Place" : "Add Place"}
          </button>

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
      </div>
    </>
  );
}
