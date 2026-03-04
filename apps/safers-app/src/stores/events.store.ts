import { create } from "zustand";
import type { StompEventResponse } from "../services/types";
import type { ConnectionStatus } from "../services/stomp.service";
import { MAX_EVENTS } from "../services/config";

interface EventsState {
  stompEvents: StompEventResponse[];
  connectionStatus: ConnectionStatus;
}

interface EventsActions {
  addStompEvent: (event: StompEventResponse) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

type EventsStore = EventsState & EventsActions;

export const useEventsStore = create<EventsStore>()((set) => ({
  stompEvents: [],
  connectionStatus: "disconnected",

  addStompEvent: (event) =>
    set((state) => ({
      stompEvents: [event, ...state.stompEvents].slice(0, MAX_EVENTS),
    })),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));

// Selectors
export const selectStompEvents = (state: EventsStore) => state.stompEvents;
export const selectConnectionStatus = (state: EventsStore) => state.connectionStatus;
