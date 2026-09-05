package com.gridweaver.kafka;

import com.gridweaver.domain.NodeTelemetry;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;

@Configuration
public class KafkaConsumerConfig {

    @Bean
    public ConsumerFactory<String, NodeTelemetry> telemetryConsumerFactory(KafkaProperties properties) {
        var consumerProperties = new HashMap<>(properties.buildConsumerProperties());
        consumerProperties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProperties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        consumerProperties.put(JsonDeserializer.TRUSTED_PACKAGES, "com.gridweaver.domain");
        consumerProperties.put(JsonDeserializer.VALUE_DEFAULT_TYPE, NodeTelemetry.class.getName());
        consumerProperties.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaConsumerFactory<>(consumerProperties);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, NodeTelemetry> telemetryKafkaListenerContainerFactory(
            ConsumerFactory<String, NodeTelemetry> consumerFactory) {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, NodeTelemetry>();
        factory.setConsumerFactory(consumerFactory);
        factory.setConcurrency(6);
        return factory;
    }
}
