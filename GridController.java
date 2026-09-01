package com.gridweaver.controller;

import com.gridweaver.domain.GridEvent;
import com.gridweaver.domain.GridNode;
import com.gridweaver.domain.NodeTelemetry;
import com.gridweaver.service.GridStabilityService;
import com.gridweaver.service.NodeRegistry;
import com.gridweaver.service.PerNodeStateMachineService;
import com.gridweaver.service.TelemetryIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GridController {

    private final NodeRegistry registry;
    private final PerNodeStateMachineService machines;
    private final GridStabilityService stability;
    private final TelemetryIngestionService ingestion;

    public GridController(
            NodeRegistry registry,
            PerNodeStateMachineService machines,
            GridStabilityService stability,
            TelemetryIngestionService ingestion) {
        this.registry = registry;
        this.machines = machines;
        this.stability = stability;
        this.ingestion = ingestion;
    }

    @GetMapping("/nodes")
    public List<GridNode> nodes(
            @RequestParam(defaultValue = "5000") int limit) {
        return registry.snapshot(Math.min(limit, 10000));
    }

    @GetMapping("/nodes/{nodeId}")
    public ResponseEntity<GridNode> node(@PathVariable String nodeId) {
        GridNode node = registry.find(nodeId);
        return node == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(node);
    }

    @PostMapping("/nodes/{nodeId}/event")
    public Map<String, Object> event(
            @PathVariable String nodeId,
            @RequestParam GridEvent event) {
        var before = machines.stateOf(nodeId);
        var after = machines.send(nodeId, event);
        return Map.of("nodeId", nodeId, "before", before, "after", after, "event", event);
    }

    @PostMapping("/telemetry")
    public Map<String, String> telemetry(@RequestBody NodeTelemetry telemetry) {
        ingestion.ingest(telemetry);
        return Map.of("status", "accepted", "nodeId", telemetry.nodeId());
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of(
                "nodes", registry.size(),
                "stateMachines", machines.machineCount(),
                "processedTelemetry", stability.processedCount()
        );
    }
}
