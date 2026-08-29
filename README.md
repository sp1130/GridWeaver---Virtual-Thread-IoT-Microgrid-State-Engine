GridWeaver ⚡

Virtual Thread IoT Microgrid State Engine

GridWeaver is a real-time IoT microgrid monitoring and state-management platform built with Java 21, Spring Boot, Virtual Threads, Apache Kafka, Spring State Machine, WebSocket, React, and Leaflet.

It is designed to demonstrate how modern Java concurrency and event-driven architecture can handle large volumes of IoT telemetry from solar panels, batteries, smart meters, and other energy devices.

📌 Project Preview

GridWeaver simulates a city-scale smart microgrid where thousands of energy devices continuously send telemetry. Java 21 Virtual Threads handle highly concurrent ingestion, Kafka buffers telemetry spikes, and Spring State Machine automatically changes battery states based on grid conditions. A React + Leaflet dashboard displays the grid status and device state changes in real time.

Core Flow

                 ┌─────────────────────┐
                 │   IoT Devices       │
                 │ Solar / Batteries   │
                 │ Smart Meters        │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Java 21 Virtual     │
                 │ Thread Ingestion    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Apache Kafka        │
                 │ Event Buffer        │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Spring State        │
                 │ Machine             │
                 └──────────┬──────────┘
                            │
                    Battery Decisions
                            │
                            ▼
                 ┌─────────────────────┐
                 │ WebSocket           │
                 │ Real-Time Updates   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ React + Leaflet     │
                 │ GIS Dashboard       │
                 └─────────────────────┘

🎯 Problem Statement

Traditional thread-per-connection architectures can become expensive when an IoT platform needs to maintain a very large number of concurrent connections.

GridWeaver addresses this problem by using Java 21 Virtual Threads for lightweight concurrent processing.

The platform also separates ingestion from business processing using Apache Kafka, while Spring State Machine manages predictable battery-state transitions.

Example Scenario

A sudden storm causes solar generation to fall:

Normal Grid Load
       ↓
     65%

Storm Event
       ↓
Solar Generation Drops
       ↓
Grid Load → 87%
       ↓
Spring State Machine
       ↓
Battery → DISCHARGING
       ↓
WebSocket Event
       ↓
Live Dashboard Update

🚀 Key Features

1. Virtual Thread IoT Ingestion

Uses Java 21 Virtual Threads to process a large number of concurrent IoT tasks efficiently.

Example:

Thread.startVirtualThread(() -> {
    processTelemetry(deviceData);
});

The architecture is designed to simulate thousands of concurrent IoT devices.

2. Real-Time Grid State Management

GridWeaver manages battery states using Spring State Machine.

Supported states:

┌──────────────┐
│     IDLE     │
└──────┬───────┘
       │
       ├── Grid Load High ──► DISCHARGING
       │
       ├── Grid Load Low ───► CHARGING
       │
       └── Device Error ────► FAULT

Example rule:

grid_load > 80%
        ↓
Battery → DISCHARGING

3. Kafka Event Streaming

Kafka decouples IoT ingestion from state processing.

IoT Telemetry
     ↓
Kafka Producer
     ↓
Kafka Topic
     ↓
Kafka Consumer
     ↓
State Machine

This helps absorb sudden telemetry spikes instead of forcing every component to process events synchronously.

4. Real-Time WebSocket Updates

The backend pushes important state changes to the frontend through WebSocket.

Example:

{
  "deviceId": "BAT-1024",
  "zone": "ZONE-A",
  "previousState": "IDLE",
  "currentState": "DISCHARGING",
  "gridLoad": 87
}

The dashboard can immediately update the affected device.

5. GIS Monitoring Dashboard

The React dashboard uses Leaflet to visualize the microgrid geographically.

The map can display:

🟢 Healthy/online devices

🟡 Charging batteries

🔵 Discharging batteries

🔴 Fault devices

Grid zones

Power generation

Grid load

Power-flow events

6. IoT Device Simulator

GridWeaver includes a simulator concept for generating large numbers of virtual devices.

Example:

SOLAR-0001
SOLAR-0002
SOLAR-0003
...
SOLAR-10000

Each device can periodically generate telemetry such as:

{
  "deviceId": "SOLAR-0001",
  "powerOutput": 4.8,
  "batteryLevel": 72,
  "gridLoad": 65,
  "zone": "ZONE-A"
}

🧰 Technology Stack

Backend

Technology

Purpose

Java 21

Core backend language

Virtual Threads

High-concurrency processing

Spring Boot

REST/API backend

Spring State Machine

Battery/grid state transitions

Apache Kafka

Event streaming and buffering

WebSocket

Real-time communication

Maven

Build and dependency management

Frontend

Technology

Purpose

React

Dashboard UI

JavaScript / TypeScript

Frontend development

Leaflet

Interactive GIS map

WebSocket Client

Live event updates

HTML / CSS

UI structure and styling

Development & Infrastructure

Git
GitHub
Docker
REST APIs
JSON
Maven
Node.js
npm

🏗️ Project Architecture

                         GRIDWEAVER
                             │
             ┌───────────────┴───────────────┐
             │                               │
       IoT Simulator                    React UI
             │                               │
             ▼                               ▲
     Virtual Thread Layer                   │
             │                               │
             ▼                               │
       Kafka Producer                        │
             │                               │
             ▼                               │
       Kafka Topic                           │
             │                               │
             ▼                               │
      Kafka Consumer                         │
             │                               │
             ▼                               │
    Spring State Machine                     │
             │                               │
             ├──── Battery State             │
             │                               │
             ├──── Grid Load                 │
             │                               │
             └──── Fault Handling             │
                     │                       │
                     ▼                       │
                  WebSocket ─────────────────┘

📂 Suggested Project Structure

GridWeaver/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/gridweaver/
│   │       │       ├── controller/
│   │       │       ├── service/
│   │       │       ├── state/
│   │       │       ├── kafka/
│   │       │       ├── websocket/
│   │       │       ├── simulator/
│   │       │       └── model/
│   │       └── resources/
│   │
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── docker-compose.yml
└── README.md

⚙️ How to Run

Prerequisites

Install:

Java 21+
Maven
Node.js
npm
Docker
Git

Verify:

java -version
mvn -version
node -v
npm -v
docker --version

1. Clone the Repository

git clone <your-repository-url>
cd GridWeaver

2. Start Kafka

If Docker Compose is configured:

docker compose up -d

Verify the containers:

docker ps

3. Start the Backend

cd backend
mvn spring-boot:run

The Spring Boot application will start on the configured port, for example:

http://localhost:8080

4. Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The React application will normally be available at:

http://localhost:5173

🧪 Example Simulation

Start the IoT simulator with a configured number of devices.

Example:

Devices:       10,000
Normal Load:   65%
Storm Load:    87%

The simulated event:

STORM_EVENT
     ↓
Solar Output ↓
     ↓
Grid Load ↑
     ↓
Grid Load > 80%
     ↓
Battery State
IDLE → DISCHARGING
     ↓
Kafka Event
     ↓
WebSocket
     ↓
React Dashboard

📊 Dashboard Metrics

The dashboard can display:

┌────────────────────────────────────────┐
│           GRIDWEAVER MONITOR            │
├────────────────────────────────────────┤
│ Total Devices        10,000             │
│ Online Devices        9,842             │
│ Grid Load                87%            │
│ Solar Generation        42 MW            │
│ Batteries Discharging   2,340            │
│ Fault Devices              18            │
└────────────────────────────────────────┘

The GIS map displays device locations and state changes in real time.

🔄 State Transition Example

Normal Condition

Grid Load = 60%

Battery:
IDLE

High Grid Load

Grid Load = 87%

IDLE
  ↓
GRID_OVERLOAD
  ↓
DISCHARGING

Grid Stabilized

Grid Load = 45%

DISCHARGING
  ↓
GRID_STABLE
  ↓
IDLE / CHARGING

Device Failure

Device Error
     ↓
FAULT

📈 Scalability Demonstration

The project is intended to demonstrate the difference between traditional platform threads and Java Virtual Threads for highly concurrent, mostly I/O-bound workloads.

A benchmark can measure:

Concurrent Tasks
Memory Usage
Throughput
Latency
Processing Time

Example test progression:

1,000 devices
      ↓
5,000 devices
      ↓
10,000 devices
      ↓
25,000 devices
      ↓
50,000 devices

Benchmark results should be reported only after measuring them on the actual development environment.

🔐 Design Considerations

For a production-oriented implementation, the following can be added:

Authentication and authorization

TLS for device communication

Kafka authentication

Input validation

Rate limiting

Device identity management

Database persistence

Monitoring with Prometheus/Grafana

Distributed Kafka deployment

Fault-tolerant WebSocket infrastructure

🎓 Learning Objectives

This project demonstrates practical knowledge of:

Java 21 Virtual Threads

Java concurrency

Spring Boot

Spring State Machine

Event-driven architecture

Apache Kafka

WebSocket

REST APIs

React

Leaflet/GIS

IoT simulation

Distributed-system concepts

Real-time data processing

Performance benchmarking

💼 Resume Description

GridWeaver — Virtual Thread IoT Microgrid State Engine

Developed a real-time IoT microgrid monitoring platform using Java 21 Virtual Threads, Spring Boot, Spring State Machine, Apache Kafka, WebSocket, React, and Leaflet, enabling high-concurrency telemetry processing with automated battery state transitions and live GIS-based grid visualization.

Resume Highlights

Implemented Java 21 Virtual Threads for concurrent processing of large-scale simulated IoT telemetry workloads.

Integrated Apache Kafka to decouple telemetry ingestion and state-processing workflows and handle event spikes.

Designed Spring State Machine transitions for Charging, Discharging, Idle, and Fault battery states based on real-time grid conditions.

Built a React + Leaflet + WebSocket dashboard for live device monitoring, grid-load visualization, and state-change events.

🗣️ Interview Explanation

What is GridWeaver?

GridWeaver is a real-time IoT microgrid state engine. It simulates thousands of solar and battery devices sending telemetry to a Java 21 backend. Virtual Threads handle concurrent ingestion, Kafka buffers the events, and Spring State Machine determines battery transitions based on grid conditions. The results are pushed through WebSocket to a React and Leaflet dashboard.

Why Virtual Threads?

Virtual Threads are lightweight JVM-managed threads designed to make high-concurrency workloads easier to handle, especially when tasks spend significant time waiting on I/O. They allow the application to support a large number of concurrent tasks without requiring one heavyweight platform thread per task.

Why Kafka?

Kafka decouples telemetry ingestion from downstream processing and provides durable event buffering. This is useful when a large number of IoT devices generate events simultaneously.

Why Spring State Machine?

Battery behavior can be represented as explicit states and events instead of complex conditional logic. This makes transitions such as Idle to Discharging or Discharging to Charging easier to model, test, and maintain.

Why WebSocket?

WebSocket provides a persistent, bidirectional connection so the backend can push state changes to the dashboard immediately instead of requiring the frontend to repeatedly poll the server.

🚀 Future Enhancements

Real device MQTT integration

PostgreSQL/TimescaleDB telemetry storage

Prometheus metrics

Grafana monitoring

Kubernetes deployment

Multi-region grid balancing

Smart load forecasting

Power-consumption heatmaps

Authentication with Spring Security

Cloud deployment on AWS

Automated performance benchmarking

👨‍💻 Project Goal

GridWeaver demonstrates a modern Java architecture for building highly concurrent, event-driven, real-time IoT systems using Java 21 Virtual Threads and Spring Boot.

The project combines:

Modern Java
     +
Concurrency
     +
Kafka
     +
State Machine
     +
WebSocket
     +
React
     +
GIS Visualization

to create a practical simulation of a large-scale smart microgrid monitoring platform.

⭐ Technologies

Java 21 Spring Boot Virtual Threads Spring State Machine Apache Kafka WebSocket React Leaflet REST API Docker Maven Git
