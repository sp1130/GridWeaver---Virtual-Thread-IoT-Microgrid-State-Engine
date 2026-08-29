import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { useMap } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { selectAllNodes } from "../../store/nodesSlice";
import { useMapMarkers } from "../../hooks/useMapMarkers";
import type { NodeState } from "../../types/grid";
const ICON_MAP: Record<NodeState, L.DivIcon> = {
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

interface NodeMarkerLayerProps {
  mockNodes?: { nodeId: string; lat: number; lng: number; zone: string; state: NodeState; powerKw: number }[];
}

const NodeMarkerLayer: React.FC<NodeMarkerLayerProps> = ({ mockNodes = [] }) => {
  const map = useMap();
  const dispatch = useDispatch();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const nodes = useSelector((state: RootState) => selectAllNodes(state));

  useEffect(() => {
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

    /* Seed mock nodes */
    mockNodes.forEach((node) => {
      const marker = L.marker([node.lat, node.lng], { icon: ICON_MAP[node.state] });
      marker.bindPopup(
        `<b>${node.nodeId}</b><br/>State: ${node.state}<br/>Zone: ${node.zone}<br/>Power: ${node.powerKw} kW`
      );
      marker["__nodeId"] = node.nodeId;
      clusterGroup.addLayer(marker);
      markersRef.current.set(node.nodeId, marker);
    });

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroupRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useMapMarkers({ mapRef: { current: map }, clusterGroupRef, markersRef });

  useEffect(() => {
    const handler = (e: Event) => {
      const nodeId = (e as CustomEvent<string>).detail;
      const marker = markersRef.current.get(nodeId);
      if (!marker || !clusterGroupRef.current) return;
      map.flyTo(marker.getLatLng(), 16, { duration: 0.6 });
      clusterGroupRef.current.zoomToShowLayer(marker, () => marker.openPopup());
    };
    window.addEventListener("highlightNode", handler);
    return () => window.removeEventListener("highlightNode", handler);
  }, [map]);

  return null; 
};

export default NodeMarkerLayer;
export { ICON_MAP };
