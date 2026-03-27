import L from "leaflet";

// Coordenadas del centro del mapa
export const COORDS_CENTER: [number, number] = [-32.6184, -60.1531];

// Limites de arrastre de mapa
export const COORDS_BOUNDS = L.latLngBounds(
    [-32.70, -60.25], // Limite sur-oeste
    [-32.50, -60.05]  // Limite nor-este
);

export const MAP_CONFIG = {
    zoom: 15, 
    minZoom: 13,
    maxZoom: 18,
    maxBounds: COORDS_BOUNDS,
    maxBoundsViscosity: 1.0, // 1.0 el mapa no rebota
    doubleClickZoom: false,
    zoomControl: false, // Desactiva el control default en esq. sup. izq.
}