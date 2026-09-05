package com.gridweaver.domain;

import java.time.Instant;

public class GridNode {
    private final String nodeId;
    private volatile NodeType nodeType;
    private volatile double latitude;
    private volatile double longitude;
    private volatile double powerKw;
    private volatile double batterySoc;
    private volatile double gridLoadPercent;
    private volatile double temperatureC;
    private volatile BatteryState state;
    private volatile Instant lastSeen;
    private volatile long sequence;

    public GridNode(String nodeId, NodeType nodeType) {
        this.nodeId = nodeId;
        this.nodeType = nodeType;
        this.state = BatteryState.IDLE;
        this.lastSeen = Instant.now();
    }

    public void update(NodeTelemetry t, BatteryState newState) {
        this.nodeType = t.nodeType();
        this.latitude = t.latitude();
        this.longitude = t.longitude();
        this.powerKw = t.powerKw();
        this.batterySoc = t.batterySoc();
        this.gridLoadPercent = t.gridLoadPercent();
        this.temperatureC = t.temperatureC();
        this.state = newState;
        this.lastSeen = t.timestamp();
        this.sequence = t.sequence();
    }

    public String getNodeId() { return nodeId; }
    public NodeType getNodeType() { return nodeType; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public double getPowerKw() { return powerKw; }
    public double getBatterySoc() { return batterySoc; }
    public double getGridLoadPercent() { return gridLoadPercent; }
    public double getTemperatureC() { return temperatureC; }
    public BatteryState getState() { return state; }
    public Instant getLastSeen() { return lastSeen; }
    public long getSequence() { return sequence; }
}
