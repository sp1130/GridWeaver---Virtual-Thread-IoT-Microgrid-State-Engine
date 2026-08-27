import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface ConnectionState {
  connected: boolean;
  reconnectAttempts: number;
  lastError: string | null;
}

const initialState: ConnectionState = {
  connected: false,
  reconnectAttempts: 0,
  lastError: null,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
      if (action.payload) state.reconnectAttempts = 0;
    },
    incrementReconnectAttempts(state) {
      state.reconnectAttempts++;
    },
    setLastError(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },
  },
});

export const {
  setConnected,
  incrementReconnectAttempts,
  setLastError,
} = connectionSlice.actions;

export const selectConnected = (state: RootState) =>
  state.connection.connected;

export const selectReconnectAttempts = (state: RootState) =>
  state.connection.reconnectAttempts;

export const selectLastError = (state: RootState) =>
  state.connection.lastError;

export default connectionSlice.reducer;
