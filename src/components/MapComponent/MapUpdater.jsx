import { useMap } from "react-leaflet";

export default function MapUpdater({ coords }) {
  const map = useMap();
  map.setView(coords, 13);
  return null;
}
