import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectHeatData, selectHeatMode } from "../../store/heatSlice";

/* ------------------------------------------------------------------ */
/*  Heatmap gradients — red for consumption, green for generation      */
/* ------------------------------------------------------------------ */
const GRADIENTS = {
  consumption: { 0.2: "#fca5a5", 0.5: "#f97316", 0.8: "#ef4444" },
  generation: { 0.2: "#86efac", 0.5: "#4ade80", 0.8: "#16a34a" },
};

/* ------------------------------------------------------------------ */
/*  HeatmapOverlay — leaflet.heat layer (Week 3 deliverable)           */
/*                                                                     */
/*  • Renders a heatmap layer on top of the basemap                    */
/*  • Reads heat points + mode (consumption | generation) from Redux   */
/*  • Updates continuously as zoneAggregator pushes new data           */
/* ------------------------------------------------------------------ */
interface HeatmapOverlayProps {
  /** Heat radius in pixels */
  radius?: number;
  /** Blur radius in pixels */
  blur?: number;
  /** Max zoom level for heatmap rendering */
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

  /* ---------- Create the heat layer once on mount ------------------ */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Repaint whenever Redux heat data or mode changes ----- */
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setLatLngs(heatData);
    // Swap gradient when operator toggles consumption <-> generation
    layerRef.current.setOptions({ gradient: GRADIENTS[mode] });
  }, [heatData, mode]);

  return null; // renders nothing itself — it manages the heat layer
};

export default HeatmapOverlay;
