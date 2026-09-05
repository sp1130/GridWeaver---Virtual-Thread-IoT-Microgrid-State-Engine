package com.gridweaver.service;

import com.gridweaver.domain.NodeTelemetry;
import com.gridweaver.kafka.TelemetryKafkaProducer;
import org.springframework.stereotype.Service;

@Service
public class TelemetryIngestionService {
    private final TelemetryKafkaProducer producer;

    public TelemetryIngestionService(TelemetryKafkaProducer producer) {
        this.producer = producer;
    }

    public void ingest(NodeTelemetry telemetry) {
        producer.publish(telemetry);
    }
}
