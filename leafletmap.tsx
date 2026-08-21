import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ------------------------------------------------------------------ */
/*  Mock city grid centre (Bengaluru-inspired) — adjust as needed      */
/* ------------------------------------------------------------------ */
const CITY_CENTER: L.LatLngExpression = [12.9716, 77.5946];
const INITIAL_ZOOM = 13;

/* ------------------------------------------------------------------ */
/*  Basemap tile layers — switchable between dark and standard modes   */
/* ------------------------------------------------------------------ */
export type TileTheme = "dark" | "light";

export const TILE_LAYERS: Record<TileTheme, string> = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

const ATTRIBUTION: Record<TileTheme, string> = {
  dark: "© OpenStreetMap · © CARTO | GridWeaver Dashboard",
  light: "© OpenStreetMap contributors | GridWeaver Dashboard",
};

/* ------------------------------------------------------------------ */
/*  MapEvents — helper component using the useMap() hook from          */
/*  react-leaflet to listen to map interactions                        */
/* ------------------------------------------------------------------ */
const MapEvents: React.FC<{ onMoveEnd?: () => void }> = ({ onMoveEnd }) => {
  const map = useMap();

  useEffect(() => {
    const handler = () => onMoveEnd?.();
    map.on("moveend", handler);
    map.on("zoomend", handler);
    return () => {
      map.off("moveend", handler);
      map.off("zoomend", handler);
    };
  }, [map, onMoveEnd]);

  return null;
};

/* ------------------------------------------------------------------ */
/*  LeafletMap — the base map canvas component                         */
/*                                                                     */
/*  Responsibilities:                                                  */
/*   • Render the Leaflet canvas (MapContainer)                        */
/*   • Provide the basemap tile layer (dark default, theme toggle)     */
/*   • Expose the raw L.Map instance via mapRef for layer plugins      */
/*     (marker clusters, heatmaps, power flow) to attach to            */
/* ------------------------------------------------------------------ */
interface LeafletMapProps {
  /** Raw map instance exposed so sibling layer components can add layers */
  mapRef?: React.MutableRefObject<L.Map | null>;
  /** Current tile theme controlled by ThemeToggle */
  theme?: TileTheme;
  /** Callback fired after pan/zoom (useful for re-aggregating heat data) */
  onViewportChange?: () => void;
  /** Optional fixed centre; defaults to CITY_CENTER */
  center?: L.LatLngExpression;
  /** Optional fixed zoom; defaults to INITIAL_ZOOM */
  zoom?: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  mapRef,
  theme = "dark",
  onViewportChange,
  center = CITY_CENTER,
  zoom = INITIAL_ZOOM,
}) => {
  /* Track the L.Map instance and hand it to the parent via mapRef */
  useEffect(() => {
    const mapInstance = document.querySelector(".leaflet-container") as HTMLElement | null;
    if (mapInstance && mapRef) {
      const mapObj = (mapInstance as unknown as { _leaflet_id?: unknown }) as L.Map;
      // react-leaflet attaches the L.Map instance; wait for it
      const check = setInterval(() => {
        const el = document.querySelector(".leaflet-container") as HTMLElement | null;
        if (el && (el as unknown as { _leaflet_map?: L.Map })._leaflet_map) {
          mapRef.current = (el as unknown as { _leaflet_map?: L.Map })._leaflet_map;
          clearInterval(check);
        }
      }, 50);
      return () => clearInterval(check);
    }
  }, [mapRef]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      style={{ width: "100%", height: "100%", background: "#0f172a" }}
      className="leaflet-map-root"
      ref={mapRef as React.Ref<L.Map>}
      data-testid="leaflet-map"
    >
      <TileLayer
        key={theme}
        url={TILE_LAYERS[theme]}
        attribution={ATTRIBUTION[theme]}
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      <MapEvents onMoveEnd={onViewportChange} />
    </MapContainer>
  );
};

export default LeafletMap;
