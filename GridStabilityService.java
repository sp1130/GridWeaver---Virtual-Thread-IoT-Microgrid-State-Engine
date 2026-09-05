package com.gridweaver.service;

import com.gridweaver.domain.*;
import com.gridweaver.kafka.EventKafkaProducer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class GridStabilityService {

    private final NodeRegistry registry;
    private final PerNodeStateMachineService stateMachines;
    private final EventKafkaProducer eventProducer;
    private final SimpMessagingTemplate websocket;
    private final double highLoad;
    private final double lowLoad;
    private final double lowSoc;
    private final double highGeneration;
    private final AtomicLong processed = new AtomicLong();

    public GridStabilityService(
            NodeRegistry registry,
            PerNodeStateMachineService stateMachines,
            EventKafkaProducer eventProducer,
            SimpMessagingTemplate websocket,
            @Value("${gridweaver.thresholds.high-load-percent}") double highLoad,
            @Value("${gridweaver.thresholds.low-load-percent}") double lowLoad,
            @Value("${gridweaver.thresholds.low-soc-percent}") double lowSoc,
            @Value("${gridweaver.thresholds.high-generation-kw}") double highGeneration) {
        this.registry = registry;
        this.stateMachines = stateMachines;
        this.eventProducer = eventProducer;
        this.websocket = websocket;
        this.highLoad = highLoad;
        this.lowLoad = lowLoad;
        this.lowSoc = lowSoc;
        this.highGeneration = highGeneration;
    }

    public void process(NodeTelemetry telemetry) {
        if (telemetry.nodeType() != NodeType.BATTERY) {
            registry.upsert(telemetry, BatteryState.IDLE);
            websocket.convertAndSend("/topic/nodes", registry.find(telemetry.nodeId()));
            processed.incrementAndGet();
            return;
        }

        BatteryState before = stateMachines.stateOf(telemetry.nodeId());
        GridEvent event = decide(telemetry, before);
        BatteryState after = before;

        if (event != null) {
            after = stateMachines.send(telemetry.nodeId(), event);
            if (after != before) {
                EventLogEntry log = new EventLogEntry(
                        UUID.randomUUID().toString(),
                        telemetry.nodeId(),
                        before,
                        after,
                        event,
                        reason(telemetry, event),
                        Instant.now());
                eventProducer.publish(log);
                websocket.convertAndSend("/topic/events", log);
            }
        }

        GridNode node = registry.upsert(telemetry, after);
        websocket.convertAndSend("/topic/nodes", node);
        processed.incrementAndGet();
    }

    private GridEvent decide(NodeTelemetry t, BatteryState state) {
        if (t.temperatureC() > 70) return GridEvent.TRIP_FAULT;
        if (t.gridLoadPercent() >= highLoad && t.batterySoc() > 10
                && state != BatteryState.DISCHARGING) return GridEvent.START_DISCHARGE;
        if (t.gridLoadPercent() <= lowLoad && t.batterySoc() <= lowSoc
                && state != BatteryState.CHARGING) return GridEvent.START_CHARGE;
        if (state == BatteryState.CHARGING
                && (t.batterySoc() >= 95 || t.gridLoadPercent() >= highLoad)) {
            return GridEvent.STOP_CHARGE;
        }
        if (state == BatteryState.DISCHARGING
                && (t.batterySoc() <= 15 || t.gridLoadPercent() <= lowLoad)) {
            return GridEvent.STOP_DISCHARGE;
        }
        if (state == BatteryState.FAULT && t.temperatureC() <= 60) {
            return GridEvent.RESET_FAULT;
        }
        return null;
    }

    private String reason(NodeTelemetry t, GridEvent event) {
        return switch (event) {
            case START_DISCHARGE -> "High grid load: " + t.gridLoadPercent() + "%";
            case START_CHARGE -> "Low load and low battery SoC";
            case STOP_CHARGE -> "Battery charge target reached or grid load increased";
            case STOP_DISCHARGE -> "Grid load normalized or battery reserve reached";
            case TRIP_FAULT -> "High temperature safety trip";
            case RESET_FAULT -> "Telemetry returned to safe operating range";
        };
    }

    public long processedCount() {
        return processed.get();
    }
}
