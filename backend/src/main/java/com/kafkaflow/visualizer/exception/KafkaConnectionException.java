package com.kafkaflow.visualizer.exception;

public class KafkaConnectionException extends RuntimeException {
    public KafkaConnectionException(String message) {
        super(message);
    }

    public KafkaConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
