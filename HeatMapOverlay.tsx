import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectHeatData, selectHeatMode } from "../../store/heatSlice";

const GRADIENTS = {
  consumption: { 0.2: "#fca5a5", 0.5: "#f97316", 0.8: "#ef4444" },
  generation: { 0.2: "#86efac", 0.5: "#4ade80", 0.8: "#16a34a" },
};

interface HeatmapOverlayProps {
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  radius = 30,
  blur = 20,
  maxZoom = 15,
}) => {
  const map = useMap();
  const layerRef = useRef<L.HeatLayer | null>(null);

  const heatData = useSelector((state: RootState) => selectHeatData(state));
  const mode = useSelector((state: RootState) => selectHeatMode(state));

  useEffect(() => {
    const heatLayer = L.heatLayer([], {
      radius,
      blur,
      maxZoom,
      gradient: GRADIENTS[mode],
    }).addTo(map);
    layerRef.current = heatLayer;

    return () => {
      map.removeLayer(heatLayer);
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setLatLngs(heatData);
    layerRef.current.setOptions({ gradient: GRADIENTS[mode] });
  }, [heatData, mode]);

  return null; // renders nothing itself — it manages the heat layer
};

export default HeatmapOverlay;
