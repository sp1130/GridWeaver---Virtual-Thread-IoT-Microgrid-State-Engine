import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.heat";

import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../store/store";
import { selectHeatData } from "../../store/heatSlice";
import { selectNodeById } from "../../store/nodesSlice";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useMapMarkers } from "../../hooks/useMapMarkers";
import { mockNodes } from "../../utils/mockData";
import type { NodeState } from "../../types/grid";

/* ------------------------------------------------------------------ */
/* Node Icons                                                         */
/* ------------------------------------------------------------------ */

const STATE_ICONS: Record<NodeState, L.DivIcon> = {
  CHARGING: L.divIcon({
    className: "node-marker",
    html: `<img 
      src="/icons/battery_charging.png" 
      alt="Charging" 
      style="width:32px;height:32px;"
    />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),

  DISCHARGING: L.divIcon({
    className: "node-marker",
    html: `<img 
      src="/icons/battery_discharging.png" 
      alt="Discharging" 
      style="width:32px;height:32px;"
    />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),

  IDLE: L.divIcon({
    className: "node-marker",
    html: `<img 
      src="/icons/battery_idle.png" 
      alt="Idle" 
      style="width:32px;height:32px;"
    />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),

  SOLAR: L.divIcon({
    className: "node-marker",
    html: `<img 
      src="/icons/solar.png" 
      alt="Solar" 
      style="width:32px;height:32px;"
    />`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),

  FAULT: L.divIcon({
    className: "node-marker fault-pulse",
    html: `<img 
      src="/icons/fault.png" 
      alt="Fault" 
      style="width:36px;height:36px;"
    />`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
};

/* ------------------------------------------------------------------ */
/* Map Center                                                         */
/* ------------------------------------------------------------------ */

const CITY_CENTER: L.LatLngExpression = [12.9716, 77.5946];

/* ------------------------------------------------------------------ */
/* Zones                                                              */
/* ------------------------------------------------------------------ */

const ZONES: {
  id: string;
  label: string;
  color: string;
  bounds: L.LatLngTuple[];
}[] = [
  {
    id: "ZONE-A",
    label: "Zone A",
    color: "#22d3ee",
    bounds: [
      [13.0, 77.55],
      [13.03, 77.55],
      [13.03, 77.6],
      [13.0, 77.6],
    ],
  },

  {
    id: "ZONE-B",
    label: "Zone B",
    color: "#facc15",
    bounds: [
      [12.94, 77.55],
      [12.97, 77.55],
      [12.97, 77.6],
      [12.94, 77.6],
    ],
  },

  {
    id: "ZONE-C",
    label: "Zone C",
    color: "#f472b6",
    bounds: [
      [12.94, 77.6],
      [12.97, 77.6],
      [12.97, 77.65],
      [12.94, 77.65],
    ],
  },
];

/* ------------------------------------------------------------------ */
/* GIS Map Container                                                   */
/* ------------------------------------------------------------------ */

const GISMapContainer: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);

  const clusterGroupRef =
    useRef<L.MarkerClusterGroup | null>(null);

  const heatLayerRef =
    useRef<L.HeatLayer | null>(null);

  const zoneLayersRef =
    useRef<L.Polygon[]>([]);

  const dispatch = useDispatch();

  /* ---------------------------------------------------------------- */
  /* Redux Heat Data                                                   */
  /* ---------------------------------------------------------------- */

  const heatData = useSelector((state: RootState) =>
    selectHeatData(state)
  );

  /* ---------------------------------------------------------------- */
  /* WebSocket                                                        */
  /* ---------------------------------------------------------------- */

  useWebSocket(dispatch);

  /* ---------------------------------------------------------------- */
  /* Map Markers                                                      */
  /* ---------------------------------------------------------------- */

  useMapMarkers({
    mapRef,
    clusterGroupRef,
  });

  /* ---------------------------------------------------------------- */
  /* Initialize Map                                                   */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const map = L.map("gis-map", {
      center: CITY_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    /* -------------------------------------------------------------- */
    /* Tile Layer                                                      */
    /* -------------------------------------------------------------- */

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "GridWeaver — Microgrid Dashboard",
        maxZoom: 19,
      }
    ).addTo(map);

    /* -------------------------------------------------------------- */
    /* Zoom Control                                                    */
    /* -------------------------------------------------------------- */

    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    /* -------------------------------------------------------------- */
    /* Zone Polygons                                                   */
    /* -------------------------------------------------------------- */

    zoneLayersRef.current = ZONES.map((zone) =>
      L.polygon(zone.bounds, {
        color: zone.color,
        weight: 1.5,
        fillOpacity: 0.06,
      })
        .bindTooltip(zone.label, {
          sticky: true,
        })
        .addTo(map)
    );

    /* -------------------------------------------------------------- */
    /* Marker Cluster                                                  */
    /* -------------------------------------------------------------- */

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,

      iconCreateFunction: (
        cluster: L.MarkerCluster
      ) => {
        const childCount = cluster.getChildCount();

        const size = Math.min(
          40 + childCount / 40,
          56
        );

        return L.divIcon({
          html: `
            <div
              style="
                background:#22d3ee;
                color:#0f172a;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:700;
                font-size:13px;
                width:${size}px;
                height:${size}px;
              "
            >
              ${childCount}
            </div>
          `,

          className: "cluster-icon",

          iconSize: L.point(
            size,
            size,
            true
          ),
        });
      },
    });

    clusterGroupRef.current = clusterGroup;

    map.addLayer(clusterGroup);

    /* -------------------------------------------------------------- */
    /* Add Mock Nodes                                                  */
    /* -------------------------------------------------------------- */

    mockNodes.forEach((node) => {
      const marker = L.marker(
        [node.lat, node.lng],
        {
          icon: STATE_ICONS[node.state],
        }
      );

      marker.bindPopup(`
        <b>${node.nodeId}</b>
        <br />
        State: ${node.state}
        <br />
        Zone: ${node.zone}
        <br />
        Power: ${node.powerKw} kW
      `);

      (
        marker as L.Marker & {
          __nodeId?: string;
        }
      ).__nodeId = node.nodeId;

      clusterGroup.addLayer(marker);
    });

    /* -------------------------------------------------------------- */
    /* Heat Map                                                        */
    /* -------------------------------------------------------------- */

    const heatLayer = L.heatLayer([], {
      radius: 30,
      blur: 20,
      maxZoom: 15,

      gradient: {
        0.2: "#22c55e",
        0.5: "#facc15",
        0.8: "#ef4444",
      },
    }).addTo(map);

    heatLayerRef.current = heatLayer;

    /* -------------------------------------------------------------- */
    /* Store Map Reference                                             */
    /* -------------------------------------------------------------- */

    mapRef.current = map;

    /* -------------------------------------------------------------- */
    /* Cleanup                                                         */
    /* -------------------------------------------------------------- */

    return () => {
      map.remove();

      mapRef.current = null;
      clusterGroupRef.current = null;
      heatLayerRef.current = null;
      zoneLayersRef.current = [];
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Update Heat Map                                                    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!heatLayerRef.current) {
      return;
    }

    heatLayerRef.current.setLatLngs(heatData);
  }, [heatData]);

  /* ------------------------------------------------------------------ */
  /* Highlight Node                                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent =
        event as CustomEvent<string>;

      const nodeId = customEvent.detail;

      const map = mapRef.current;
      const clusterGroup =
        clusterGroupRef.current;

      if (!map || !clusterGroup) {
        return;
      }

      const marker = clusterGroup
        .getLayers()
        .find((layer) => {
          if (!(layer instanceof L.Marker)) {
            return false;
          }

          const nodeMarker =
            layer as L.Marker & {
              __nodeId?: string;
            };

          return nodeMarker.__nodeId === nodeId;
        }) as L.Marker | undefined;

      if (!marker) {
        return;
      }

      map.flyTo(
        marker.getLatLng(),
        16
      );

      clusterGroup.zoomToShowLayer(
        marker,
        () => {
          marker.openPopup();
        }
      );
    };

    window.addEventListener(
      "highlightNode",
      handler
    );

    return () => {
      window.removeEventListener(
        "highlightNode",
        handler
      );
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div
      id="gis-map"
      style={{
        width: "100%",
        height: "100%",
      }}
      data-testid="gis-map"
    />
  );
};

export default GISMapContainer;