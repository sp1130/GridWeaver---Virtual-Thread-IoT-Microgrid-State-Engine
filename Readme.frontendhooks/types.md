# Types

The `types` folder contains TypeScript type definitions used throughout the GridWaver application.

These types provide a consistent structure for grid data, WebSocket events, telemetry information, and other application objects.

## Main Responsibilities

* Defines the structure of application data.
* Provides type safety across the frontend.
* Helps prevent incorrect data usage.
* Makes API and WebSocket data easier to understand.
* Improves code readability and maintainability.

## Grid Types

The `grid` types define the structure of important grid-related data such as:

* Nodes
* Node telemetry
* Transition events
* Heat-map points
* WebSocket event data

For example, `NodeTelemetry` represents real-time information received for a grid node, while `TransitionEvent` represents changes or transitions between grid nodes.

## Usage

Types are imported into components, hooks, services, and Redux logic whenever grid data needs to be handled.

```text id="6w3r1k"
Types
  ↓
Services → Hooks → Redux Store
  ↓
Components → Pages
```

Using TypeScript types throughout GridWaver makes the application safer, easier to maintain, and less prone to runtime data errors.

