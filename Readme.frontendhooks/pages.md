# Pages

The `pages` folder contains the main page-level components of the GridWaver application.

Pages combine different UI components, hooks, Redux data, and services to build the main screens of the application.

## Main Responsibilities

* Organizes the main application screens.
* Connects reusable components together.
* Displays real-time grid monitoring data.
* Handles page-level layout and navigation.
* Uses hooks and Redux data to display updated information.

## Dashboard Page

The **Dashboard** is the main page of GridWaver.

It brings together the major sections of the application, including:

* Header bar
* Connection status banner
* GIS map
* Metrics sidebar
* Event log panel
* Real-time grid data

### Dashboard Data Flow

```text
WebSocket
    ↓
Redux Store
    ↓
Dashboard Page
    ↓
Map + Metrics + Event Logs
    ↓
Real-Time UI
```

The Pages layer acts as the main integration point between the application's components, hooks, Redux store, and backend services.

