package com.gridweaver.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic telemetryTopic(
            @Value("${gridweaver.kafka.telemetry-topic}") String topic,
            @Value("${gridweaver.kafka.partitions}") int partitions,
            @Value("${gridweaver.kafka.replication-factor}") short replicationFactor) {
        return TopicBuilder.name(topic)
                .partitions(partitions)
                .replicas(replicationFactor)
                .build();
    }

    @Bean
    public NewTopic eventTopic(
            @Value("${gridweaver.kafka.event-topic}") String topic,
            @Value("${gridweaver.kafka.partitions}") int partitions,
            @Value("${gridweaver.kafka.replication-factor}") short replicationFactor) {
        return TopicBuilder.name(topic)
                .partitions(partitions)
                .replicas(replicationFactor)
                .build();
    }
}
