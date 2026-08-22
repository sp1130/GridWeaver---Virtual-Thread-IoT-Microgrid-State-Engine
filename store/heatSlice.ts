import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { HeatPoint, PowerFlowEvent } from "../types/grid";
import type { RootState } from "./store";

type HeatMode = "consumption" | "generation";

interface HeatState {
  points: HeatPoint[];
  mode: HeatMode;
  powerFlows: PowerFlowEvent[];
}

const initialState: HeatState = {
  points: [],
  mode: "consumption",
  powerFlows: [],
};

const heatSlice = createSlice({
  name: "heat",
  initialState,
  reducers: {
    setHeatPoints(state, action: PayloadAction<HeatPoint[]>) {
      state.points = action.payload;
    },
    setHeatMode(state, action: PayloadAction<HeatMode>) {
      state.mode = action.payload;
    },
    setPowerFlows(state, action: PayloadAction<PowerFlowEvent[]>) {
      state.powerFlows = action.payload;
    },
  },
});

export const { setHeatPoints, setHeatMode, setPowerFlows } = heatSlice.actions;

export const selectHeatData = (state: RootState): HeatPoint[] => state.heat.points;
export const selectHeatMode = (state: RootState): HeatMode => state.heat.mode;
export const selectPowerFlows = (state: RootState): PowerFlowEvent[] => state.heat.powerFlows;

export default heatSlice.reducer;
