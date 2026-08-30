import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { NodeTelemetry } from "../types/grid";
import type { RootState } from "./store";

interface NodesState {
  map: Record<string, NodeTelemetry>;
}

const initialState: NodesState = { map: {} }; // Initialize nodes state

const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<NodeTelemetry[]>) {
      const map: Record<string, NodeTelemetry> = {};
      action.payload.forEach((n) => {
        map[n.nodeId] = n;
      });
      state.map = map;
    },
    upsertNode(state, action: PayloadAction<NodeTelemetry>) {
      const n = action.payload;
      const existing = state.map[n.nodeId];
      if (existing && existing.timestamp > n.timestamp) return;
      const previousState = existing?.state;
      state.map[n.nodeId] = n;
      if (existing && previousState && previousState !== n.state) {
        (state as NodesState & { __pendingTransition?: unknown }).__pendingTransition = {
          nodeId: n.nodeId,
          zone: n.zone,
          fromState: previousState,
          toState: n.state,
          timestamp: n.timestamp,
        };
      }
    },
  },
});

export const { setNodes, upsertNode } = nodesSlice.actions;

export const selectAllNodes = (state: RootState): NodeTelemetry[] =>
  Object.values(state.nodes.map);

export const selectNodeById = (
  state: RootState,
  nodeId: string
): NodeTelemetry | undefined => state.nodes.map[nodeId];

export const selectFaultCount = (state: RootState): number =>
  Object.values(state.nodes.map).filter((n) => n.state === "FAULT").length;

export default nodesSlice.reducer;
