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
      state.reconnectAttempts += 1;
    },
    setLastError(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },
  },
});

export const { setConnected, incrementReconnectAttempts, setLastError } =
  connectionSlice.actions;

export const selectConnected = (state: RootState): boolean =>
  state.connection.connected;
export const selectReconnectAttempts = (state: RootState): number =>
  state.connection.reconnectAttempts;

export default connectionSlice.reducer;
