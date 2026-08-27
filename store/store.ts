import { configureStore } from "@reduxjs/toolkit";
import nodesReducer from "./nodesSlice";
import eventsReducer from "./eventsSlice";
import heatReducer from "./heatSlice";
import connectionReducer from "./connectionSlice";

export const store = configureStore({
  reducer: {
    nodes: nodesReducer,
    events: eventsReducer,
    heat: heatReducer,
    connection: connectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
