import { useEffect, useRef } from "react";
import L from "leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { selectAllNodes } from "../store/nodesSlice";
import type { NodeState } from "../types/grid";

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

interface UseMapMarkersOptions {
  mapRef: React.MutableRefObject<L.Map | null>;
  clusterGroupRef: React.MutableRefObject<L.MarkerClusterGroup | null>;
}

export function useMapMarkers({ mapRef, clusterGroupRef }: UseMapMarkersOptions) {
  const nodes = useSelector((state: RootState) => selectAllNodes(state));
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const pendingRef = useRef<Map<string, NodeState>>(new Map());
  const rafRef = useRef<number | undefined>(undefined);

  function flushPending() {
    rafRef.current = undefined;
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    pendingRef.current.forEach((newState, nodeId) => {
      let marker = markersRef.current.get(nodeId);
      if (!marker) {
        // Node appeared for the first time — find its telemetry
        const node = nodes.find((n) => n.nodeId === nodeId);
        if (!node) return;
        marker = L.marker([node.lat, node.lng], { icon: ICON_MAP[node.state] });
        marker.bindPopup(
          `<b>${node.nodeId}</b><br/>State: ${node.state}<br/>Zone: ${node.zone}<br/>Power: ${node.powerKw} kW`
        );
        marker["__nodeId"] = nodeId;
        clusterGroup.addLayer(marker);
        markersRef.current.set(nodeId, marker);
      } else {
        // Only re-set icon if the state actually changed
        marker.setIcon(ICON_MAP[newState]);
        // Refresh popup content with latest state
        const node = nodes.find((n) => n.nodeId === nodeId);
        if (node) {
          marker.setPopupContent(
            `<b>${node.nodeId}</b><br/>State: ${node.state}<br/>Zone: ${node.zone}<br/>Power: ${node.powerKw} kW`
          );
        }
      }
    });
    pendingRef.current.clear();
  }

  useEffect(() => {
    nodes.forEach((node) => {
      const existing = markersRef.current.get(node.nodeId);
      const oldState = existing
        ? (existing["__lastState"] as NodeState | undefined)
        : undefined;

      if (oldState !== node.state) {
        pendingRef.current.set(node.nodeId, node.state);
        existing["__lastState"] = node.state;
      }
    });

    if (rafRef.current === undefined && pendingRef.current.size > 0) {
      rafRef.current = window.requestAnimationFrame(flushPending);
    }
  }, [nodes]);

  return markersRef;
}
