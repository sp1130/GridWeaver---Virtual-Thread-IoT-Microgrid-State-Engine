package com.gridweaver.kafka;

import com.gridweaver.domain.NodeTelemetry;
import com.gridweaver.service.GridStabilityService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;

@Service
public class TelemetryKafkaConsumer {

    private final ExecutorService virtualExecutor;
    private final GridStabilityService stabilityService;

    public TelemetryKafkaConsumer(
            ExecutorService virtualExecutor,
            GridStabilityService stabilityService) {
        this.virtualExecutor = virtualExecutor;
        this.stabilityService = stabilityService;
    }

    @KafkaListener(
            topics = "${gridweaver.kafka.telemetry-topic}",
            containerFactory = "telemetryKafkaListenerContainerFactory")
    public void consume(NodeTelemetry telemetry) {
        virtualExecutor.submit(() -> stabilityService.process(telemetry));
    }
}
