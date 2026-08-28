import { createSlice, PayloadAction } from "@reduxjs/toolkit"; 
import type { TransitionEvent } from "../types/grid"; 
import type { RootState } from "./store"; 
 
const MAX_EVENTS = 5000; 
 
interface EventsState { 
  events: TransitionEvent[]; 
} 
 
const initialState: EventsState = { events: [] }; 
 
const eventsSlice = createSlice({ 
  name: "events", 
  initialState, 
  reducers: { 
    addTransition(state, action: PayloadAction<TransitionEvent>) { 
      state.events.unshift(action.payload); // newest first 
      if (state.events.length > MAX_EVENTS) { 
        state.events.length = MAX_EVENTS; 
      } 
    }, 
    addTransitions(state, action: PayloadAction<TransitionEvent[]>) { 
      state.events.unshift(...action.payload.reverse()); // CHANGED
      if (state.events.length > MAX_EVENTS) { 
        state.events.length = MAX_EVENTS; 
      } 
    }, 
    clearEvents(state) { 
      state.events = []; 
    }, 
  }, 
}); 
 
export const { addTransition, addTransitions, clearEvents } = eventsSlice.actions; 
 
export const selectAllEvents = (state: RootState): TransitionEvent[] => 
  state.events.events; 
 
export const selectEventCount = (state: RootState): number => 
  state.events.events.length; 
 
export default eventsSlice.reducer;
