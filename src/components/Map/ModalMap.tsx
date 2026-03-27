import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { COORDS_CENTER, MAP_CONFIG } from '../../constants/coordinates';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon

// Funcion auxiliar para mover el pin del mapa cuando cambia
// la direccion
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center]);
  return null;
}

export default function ModalMap({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  function LocationPicker() {
    useMapEvents({
      click(e) { setPosition([e.latlng.lat, e.latlng.lng]); },
    });
    return null;
  }

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-gray-800">
      <MapContainer
        className="h-full w-full"
        center={position}
        {...MAP_CONFIG}        
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ChangeView center={position} />
        <LocationPicker />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}