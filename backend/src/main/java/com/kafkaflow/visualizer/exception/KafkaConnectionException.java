package com.kafkaflow.visualizer.exception;

public class KafkaConnectionException extends AppException {

    public KafkaConnectionException(String message) {
        super(ErrorCode.KAFKA_CONNECTION_FAILED, message);
    }

    public KafkaConnectionException(String message, Throwable cause) {
        super(ErrorCode.KAFKA_CONNECTION_FAILED, message, cause);
    }

    public KafkaConnectionException(String broker, int port, Throwable cause) {
        super(ErrorCode.KAFKA_CONNECTION_FAILED, String.format("Cannot connect to %s:%d", broker, port), cause);
    }
}