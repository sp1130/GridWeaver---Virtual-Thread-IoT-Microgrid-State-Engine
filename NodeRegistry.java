package com.gridweaver.service;

import com.gridweaver.domain.GridNode;
import com.gridweaver.domain.NodeTelemetry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class NodeRegistry {

    private final ConcurrentMap<String, GridNode> nodes = new ConcurrentHashMap<>();

    public GridNode upsert(NodeTelemetry telemetry, com.gridweaver.domain.BatteryState state) {
        GridNode node = nodes.computeIfAbsent(
                telemetry.nodeId(), id -> new GridNode(id, telemetry.nodeType()));
        node.update(telemetry, state);
        return node;
    }

    public GridNode find(String nodeId) {
        return nodes.get(nodeId);
    }

    public List<GridNode> snapshot(int limit) {
        return nodes.values().stream()
                .sorted(Comparator.comparing(GridNode::getNodeId))
                .limit(limit)
                .toList();
    }

    public int size() {
        return nodes.size();
    }
}
