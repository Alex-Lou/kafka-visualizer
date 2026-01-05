package com.kafkaflow.visualizer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KafkaVisualizerApplication {

    public static void main(String[] args) {
        SpringApplication.run(KafkaVisualizerApplication.class, args);
    }
}
