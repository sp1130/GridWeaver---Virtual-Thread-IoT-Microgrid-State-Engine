package com.gridweaver.domain;

import java.time.Instant;

public record EventLogEntry(
        String eventId,
        String nodeId,
        BatteryState fromState,
        BatteryState toState,
        GridEvent event,
        String reason,
        Instant timestamp
) {}
