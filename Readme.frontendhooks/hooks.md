# Hooks

The `hooks` folder contains custom React hooks used to handle reusable logic in the GridWaver application.

## `useThrottledUpdates`

Handles frequent real-time updates efficiently by using `requestAnimationFrame`. It queues updates and processes them together to reduce unnecessary UI renders and improve dashboard performance.

**Main functions:**

* `enqueue()` – Adds updates to the queue.
* `flushNow()` – Immediately processes pending updates.
* `pending` – Indicates whether updates are waiting.

## `useWebSocket`

Manages the WebSocket connection between the frontend and backend.

**Main responsibilities:**

* Connects to the GridWaver WebSocket server.
* Receives and parses real-time events.
* Dispatches data to Redux.
* Handles connection, disconnection, and errors.
* Automatically reconnects when the connection is lost.
* Sends heartbeat messages to maintain the connection.

**Supported events:**

* Telemetry
* Transition
* Heat
* Pong
* Unknown events

## Data Flow

```text
Backend
   ↓
WebSocket
   ↓
useWebSocket
   ↓
Redux Store
   ↓
Dashboard Components
   ↓
UI
```

These custom hooks keep the GridWaver code clean, reusable, and efficient while handling real-time grid data.
