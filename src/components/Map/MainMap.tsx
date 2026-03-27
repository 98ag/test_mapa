import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CATEGORIES } from '../../constants/categories';
import type { CategoryKey } from '../../constants/categories';
import { COORDS_CENTER, MAP_CONFIG } from '../../constants/coordinates';
import ReportModal from '../Modal/ReportModal';

// Icono default de pin en el mapa
// TODO: Cambiar a uno mas lindo?
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import Sidebar from '../UI/Sidebar';
let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon

// URL del Tile Layer (estilo del mapa)
const layer_url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
//  La de CartoCDN es mucho mas simplista
// "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

// Interfaz para el guardado de pines
interface Pin {
    id: string;
    lat: number;
    lng: number;
    category: string;
    description?: string;
    timestamp: number;
    address: string;
}

export default function MainMap() {
    // Estado para el marcador temporal
    const [pins, setPins] = useState<Pin[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>(Object.keys(CATEGORIES));

    // Cargo los pins existentes on mount
    useEffect(() => {
        const savedPins = localStorage.getItem('pins');
        if (savedPins) 
            setPins(JSON.parse(savedPins));
    }, []);

    const visiblePins = pins.filter(p => activeFilters.includes(p.category));

    // Funcion auxiliar para guardar un pin
    // Busca la direccion real del pin elegido en el minimapa en la API de Nominatim (mejor que georef para altura)
    const addNewPin = async (data: any) => {
        let finalAddress = "";

        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.lat}&lon=${data.lng}&zoom=18`;
            // Buscando direccion real de la API...
            const response = await fetch(url);
            const resdata = await response.json();

            if (resdata.address) {
                const { road, house_number, suburb } = resdata.address;
                
                // Construye la direccion en base a los resultados
                if (road)
                    finalAddress = `${road} ${house_number || "S/N"}`;            
                // Si no encontro una calle valida, muestra el barrio (de haberlo)
                else if (suburb)
                    finalAddress = `Barrio ${suburb}`;  
                // De cualquier otra forma seteamos la direccion como las coordenadas              
                else
                    finalAddress = `Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`;
            }
        } catch (err) {
            console.error("No se pudo obtener la dirección real:", err);
            // Fallback: si falla la API, seteamos la direccion como las coordenadas del pin
            finalAddress = `Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`;
        }

        const newPin: Pin = {
            ...data,
            address: finalAddress,
            id: crypto.randomUUID(),
            timestamp: Date.now()   
        };

        const updated = [...pins, newPin];
        setPins(updated);
        localStorage.setItem('pins', JSON.stringify(updated));
    }

    // TileLayer attribution
    // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    return (
        <div className="h-screen w-full overflow-hidden relative bg-[#121212]">
            <style>
                {`
                    .custom-grayscale .leaflet-tile-container {
                        filter: grayscale(30%) brightness(100%) contrast(90%);
                    }
                    .custom-grayscale {
                        background: #cbd5e1;
                    }
                `}
            </style>

            <Sidebar 
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                onNewReport={() => setIsModalOpen(true)}
            />
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]" >
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#5BB0E3] text-black font-black px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 uppercase italic">
                            <span className="text-xl">!</span>Nuevo reporte
                    </button>
            </div>

            <MapContainer 
                className="h-full w-full custom-grayscale overflow-hidden"
                center={COORDS_CENTER}
                {...MAP_CONFIG}
            >
                <TileLayer url={layer_url} />
                <ZoomControl position='topright' />

                {visiblePins.map((pin) => {
                    const categoryInfo = CATEGORIES[pin.category as CategoryKey];
                    const displayLabel = categoryInfo ? categoryInfo.label : pin.category;

                    return (
                    <Marker key={pin.id} position={[pin.lat, pin.lng]}>
                        <Popup>
                            <div className="p-2">
                                <span className="text-xs font-bold uppercase block text-orange-600">{displayLabel}</span>
                                <p className="textsm">{pin.description || "Sin descripcion."}</p>
                                <h3>{pin.address}</h3>
                                <small className="text-gray-400">{ new Date(pin.timestamp).toLocaleDateString() }</small>
                            </div>
                        </Popup>
                    </Marker>
                )})}
            </MapContainer>

            <ReportModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addNewPin}
            />
        </div>
    );
}
/** TempMarker logic
{tempMarker && (
    <Marker position={tempMarker}>
        <Popup>
        <form action={handleFormSubmit} className="flex flex-col gap-2 p-1">
            <label className="text-xs font-bold uppercase text-gray-600">Problem Category</label>
            <select name="category" required className="border rounded p-1 text-sm">
                {Object.entries(categorias).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                ))}
            </select>
            
            <textarea name="description" placeholder="Optional details..." className="border rounded p-1 text-sm" />
            
            <button type="submit" className="bg-orange-500 text-white rounded py-1 px-2 text-sm font-bold">
            Enviar reporte
            </button>
        </form>
        </Popup>
    </Marker>
)}

function ClickHandler() {
    useMapEvents({
    click(e) {
        if (tempMarker)
            setTempMarker(null);
        else
            setTempMarker(e.latlng);
    },
    });
    return null;
} 
*/