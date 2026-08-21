import React, { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.heat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";            // components/map -> src/store
import { selectHeatData } from "../../store/heatSlice";   // components/map -> src/store
import { selectNodeById } from "../../store/nodesSlice";  // components/map -> src/store
import { useWebSocket } from "../../hooks/useWebSocket";  // components/map -> src/hooks
import { useMapMarkers } from "../../hooks/useMapMarkers";// components/map -> src/hooks
import { mockNodes } from "../../utils/mockData";         // components/map -> src/utils
import type { NodeState } from "../../types/grid";        // components/map -> src/types

/* ------------------------------------------------------------------ */
/*  State icon definitions (Week 1 deliverable)                        */
/* ------------------------------------------------------------------ */
const STATE_ICONS: Record<NodeState, L.DivIcon> = {
  CHARGING: L.divIcon({
    className: "node-marker",
    html: `<img src="/icons/battery_charging.png" alt="Charging" style="width:32px;height:32px;"/>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),
  DISCHARGING: L.divIcon({
    className: "node-marker",
    html: `<img src="/icons/battery_discharging.png" alt="Discharging" style="width:32px;height:32px;"/>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),
  IDLE: L.divIcon({
    className: "node-marker",
    html: `<img src="/icons/battery_idle.png" alt="Idle" style="width:32px;height:32px;"/>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),
  SOLAR: L.divIcon({
    className: "node-marker",
    html: `<img src="/icons/solar.png" alt="Solar" style="width:32px;height:32px;"/>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),
  FAULT: L.divIcon({
    className: "node-marker fault-pulse",
    html: `<img src="/icons/fault.png" alt="Fault" style="width:36px;height:36px;"/>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
};

/* ------------------------------------------------------------------ */
/*  Mock city grid – zone boundaries (Week 1 deliverable)              */
/* ------------------------------------------------------------------ */
const CITY_CENTER: L.LatLngExpression = [12.9716, 77.5946]; // Bengaluru mock grid

const ZONES: { id: string; label: string; color: string; bounds: L.LatLngTuple[] }[] = [
  { id: "ZONE-A", label: "Zone A", color: "#22d3ee", bounds: [[13.0, 77.55], [13.03, 77.55], [13.03, 77.6], [13.0, 77.6]] },
  { id: "ZONE-B", label: "Zone B", color: "#facc15", bounds: [[12.94, 77.55], [12.97, 77.55], [12.97, 77.6], [12.94, 77.6]] },
  { id: "ZONE-C", label: "Zone C", color: "#f472b6", bounds: [[12.94, 77.6], [12.97, 77.6], [12.97, 77.65], [12.94, 77.65]] },
];

/* ------------------------------------------------------------------ */
/*  GISMapContainer – parent component composing the map + all layers  */
/* ------------------------------------------------------------------ */
const GISMapContainer: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const zoneLayersRef = useRef<L.Polygon[]>([]);

  const dispatch = useDispatch();
  const heatData = useSelector((state: RootState) => selectHeatData(state));
  // selectNodeById needs 2 args; wrap in useCallback to keep signature stable
  const getNode = useCallback(
    (id: string) => useSelector((state: RootState) => selectNodeById(state, id)),
    []
  );

  /* Week 2: open WebSocket on mount; connection status managed by useWebSocket */
  useWebSocket(dispatch);

  /* Week 2: register marker update handler — updates ONLY changed markers */
  useMapMarkers({ mapRef, clusterGroupRef, getNode });

  /* ---------- Map init (runs once) ---------- */
  useEffect(() => {
    const map = L.map("gis-map", {
      center: CITY_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "GridWeaver — Microgrid Dashboard",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    /* Week 1: zone boundary polygons */
    zoneLayersRef.current = ZONES.map((z) =>
      L.polygon(z.bounds, { color: z.color, weight: 1.5, fillOpacity: 0.06 })
        .bindTooltip(z.label, { sticky: true })
        .addTo(map)
    );

    /* Week 1: marker cluster group (handles 1,000+ markers smoothly) */
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const childCount = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="background:#22d3ee;color:#0f172a;border-radius:50%;
                 display:flex;align-items:center;justify-content:center;
                 font-weight:700;font-size:13px;
                 width:${Math.min(40 + childCount / 40, 56)}px;
                 height:${Math.min(40 + childCount / 40, 56)}px;">${childCount}</div>`,
          className: "cluster-icon",
          iconSize: L.point(56, 56, true),
        });
      },
    });
    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    /* Week 1: seed static mock nodes */
    mockNodes.forEach((node) => {
      const marker = L.marker([node.lat, node.lng], { icon: STATE_ICONS[node.state] });
      marker.bindPopup(
        `<b>${node.nodeId}</b><br/>State: ${node.state}<br/>Zone: ${node.zone}<br/>Power: ${node.powerKw} kW`
      );
      marker["__nodeId"] = node.nodeId; // tag marker for later lookup
      clusterGroup.addLayer(marker);
    });

    /* Week 3: heatmap layer */
    const heatLayer = L.heatLayer([], {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      gradient: { 0.2: "#22c55e", 0.5: "#facc15", 0.8: "#ef4444" },
    }).addTo(map);
    heatLayerRef.current = heatLayer;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ---------- Week 3: repaint heatmap from Redux heat data ---------- */
  useEffect(() => {
    if (heatLayerRef.current) {
      heatLayerRef.current.setLatLngs(heatData);
    }
  }, [heatData]);

  /* ---------- Week 4: click a node id externally to highlight it ----- */
  useEffect(() => {
    const handler = (e: Event) => {
      const nodeId = (e as CustomEvent<string>).detail;
      const map = mapRef.current;
      if (!map || !clusterGroupRef.current) return;
      const marker = clusterGroupRef.current.getLayers().find(
        (m) => m instanceof L.Marker && (m as L.Marker)["__nodeId"] === nodeId
      ) as L.Marker | undefined;
      if (marker) {
        map.flyTo(marker.getLatLng(), 16);
        clusterGroupRef.current.zoomToShowLayer(marker, () => marker.openPopup());
      }
    };
    window.addEventListener("highlightNode", handler);
    return () => window.removeEventListener("highlightNode", handler);
  }, []);

  return <div id="gis-map" style={{ width: "100%", height: "100%" }} data-testid="gis-map" />;
};

export default GISMapContainer;
