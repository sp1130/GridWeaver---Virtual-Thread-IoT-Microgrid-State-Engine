
# Services

The `services` folder contains the modules responsible for communication between the GridWaver frontend and backend.

These services keep API and WebSocket communication separate from the UI components, making the application easier to maintain and test.

## Main Services

### `gridApi.ts`

Handles REST API communication with the GridWaver backend.

**Main responsibilities:**

* Fetches grid zones.
* Fetches grid nodes.
* Exports grid data as CSV.
* Resets grid data.
* Provides a common API base URL.

**API Endpoints:**

```text id="9h7q3m"
GET  /api/zones
GET  /api/nodes
GET  /api/export/csv
POST /api/reset
```

### `websocketClient.ts`

Handles the raw WebSocket connection with the backend.

It is responsible for:

* Opening the WebSocket connection.
* Receiving real-time messages.
* Parsing JSON event data.
* Identifying different event types.
* Dispatching Redux actions.
* Handling connection errors and closing events.

The WebSocket endpoint is:

```text id="x7p4kn"
ws://localhost:8080/ws/grid
```

## Data Flow

```text id="3z1m8p"
Frontend
   ↓
Services
   ├── REST API → Backend
   └── WebSocket → Real-Time Backend Data
                    ↓
                 Redux Store
                    ↓
                Dashboard UI
```

The Services layer provides a clean separation between backend communication and the React components, helping GridWaver handle both REST APIs and real-time WebSocket data efficiently.

