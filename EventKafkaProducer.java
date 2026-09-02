package com.gridweaver.kafka;

import com.gridweaver.domain.EventLogEntry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventKafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String topic;

    public EventKafkaProducer(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${gridweaver.kafka.event-topic}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void publish(EventLogEntry entry) {
        kafkaTemplate.send(topic, entry.nodeId(), entry);
    }
}
