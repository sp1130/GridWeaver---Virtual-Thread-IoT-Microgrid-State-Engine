# Store

The `store` folder contains the Redux state management logic used in the GridWaver application.

It manages the application's global state and allows different components to access and update grid-related data consistently.

## Main Responsibilities

* Stores global application state.
* Manages real-time grid data.
* Handles WebSocket connection status.
* Updates nodes, transitions, and heat-map data.
* Provides a centralized state for dashboard components.

## Redux Store

The Redux store combines the different slices of application state and makes them available throughout the React application.

### Main State Data

* **Nodes** – Stores grid node and telemetry information.
* **Transitions** – Stores changes or transitions between nodes.
* **Heat Points** – Stores heat-map data for the GIS map.
* **Connection Status** – Tracks WebSocket connection state.

## Data Flow

```text id="2j9x8n"
WebSocket / API
       ↓
    Actions
       ↓
 Redux Store
       ↓
 Components
       ↓
 Dashboard UI
```

When new real-time data is received through the WebSocket, Redux actions update the store. The subscribed React components automatically re-render with the latest data.

## Benefits

* Centralized state management
* Predictable data flow
* Easy access to shared data
* Efficient real-time updates
* Better separation between UI and application logic
