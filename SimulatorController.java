package com.gridweaver.controller;

import com.gridweaver.domain.NodeType;
import com.gridweaver.domain.NodeTelemetry;
import com.gridweaver.service.TelemetryIngestionService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/simulator")
public class SimulatorController {

    private final TelemetryIngestionService ingestion;

    public SimulatorController(TelemetryIngestionService ingestion) {
        this.ingestion = ingestion;
    }

    @PostMapping("/storm")
    public Map<String, Object> storm(
            @RequestParam(defaultValue = "5000") int affected) {
        int count = Math.min(affected, 50000);
        var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor();
        for (int i = 0; i < count; i++) {
            int index = i;
            executor.submit(() -> {
                double lat = 19.00 + ThreadLocalRandom.current().nextDouble(0.25);
                double lon = 73.00 + ThreadLocalRandom.current().nextDouble(0.25);
                ingestion.ingest(new NodeTelemetry(
                        "storm-battery-" + index,
                        NodeType.BATTERY,
                        lat, lon,
                        3.0,
                        60.0,
                        92.0,
                        30.0,
                        Instant.now(),
                        System.nanoTime()));
            });
        }
        executor.close();
        return Map.of("accepted", count, "scenario", "storm");
    }
}
