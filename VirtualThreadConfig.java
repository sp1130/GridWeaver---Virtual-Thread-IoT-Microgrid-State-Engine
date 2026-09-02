package com.gridweaver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Uses only JDK 21 APIs. No Tomcat internals are referenced, so this remains
 * stable if the embedded servlet container changes.
 */
@Configuration
public class VirtualThreadConfig {

    @Bean(destroyMethod = "close")
    public ExecutorService virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean(name = "gridWeaverVirtualExecutor")
    public AsyncTaskExecutor gridWeaverVirtualExecutor(ExecutorService virtualThreadExecutor) {
        return new TaskExecutorAdapter(virtualThreadExecutor);
    }
}
