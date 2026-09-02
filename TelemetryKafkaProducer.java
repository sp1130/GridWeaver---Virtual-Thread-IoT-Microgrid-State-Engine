package com.gridweaver.kafka;

import com.gridweaver.domain.NodeTelemetry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class TelemetryKafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String topic;

    public TelemetryKafkaProducer(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${gridweaver.kafka.telemetry-topic}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void publish(NodeTelemetry telemetry) {
        kafkaTemplate.send(topic, telemetry.nodeId(), telemetry);
    }
}
