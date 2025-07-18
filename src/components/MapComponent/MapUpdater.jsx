import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function MapUpdater({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.length === 2) {
      map.setView(coords, 13);
    }
  }, [coords, map]);

  return null;
}
