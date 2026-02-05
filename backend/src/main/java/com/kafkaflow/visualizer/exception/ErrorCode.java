package com.kafkaflow.visualizer.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ═══════════════════════════════════════════════════════════════════════
    // KAFKA (KAFKA_xxx)
    // ═══════════════════════════════════════════════════════════════════════

    KAFKA_CONNECTION_FAILED("KAFKA_001", "Cannot connect to Kafka broker", HttpStatus.BAD_REQUEST),
    KAFKA_TOPIC_NOT_FOUND("KAFKA_002", "Topic not found", HttpStatus.NOT_FOUND),
    KAFKA_CONSUMER_ERROR("KAFKA_003", "Consumer error", HttpStatus.INTERNAL_SERVER_ERROR),
    KAFKA_PRODUCER_ERROR("KAFKA_004", "Producer error", HttpStatus.INTERNAL_SERVER_ERROR),

    // ═══════════════════════════════════════════════════════════════════════
    // DATABASE (DB_xxx)
    // ═══════════════════════════════════════════════════════════════════════

    DB_CONNECTION_LOST("DB_001", "Database connection lost", HttpStatus.SERVICE_UNAVAILABLE),
    DB_ENTITY_NOT_FOUND("DB_002", "Entity not found", HttpStatus.NOT_FOUND),
    DB_DUPLICATE_ENTRY("DB_003", "Duplicate entry", HttpStatus.CONFLICT),
    DB_SESSION_ERROR("DB_004", "Data loading error", HttpStatus.INTERNAL_SERVER_ERROR),
    DB_CONSTRAINT_VIOLATION("DB_005", "Data constraint violation", HttpStatus.BAD_REQUEST),

    // ═══════════════════════════════════════════════════════════════════════
    // FLOW (FLOW_xxx)
    // ═══════════════════════════════════════════════════════════════════════

    FLOW_NOT_FOUND("FLOW_001", "Flow diagram not found", HttpStatus.NOT_FOUND),
    FLOW_INVALID_DATA("FLOW_002", "Invalid flow data", HttpStatus.BAD_REQUEST),
    FLOW_SAVE_FAILED("FLOW_003", "Failed to save flow", HttpStatus.INTERNAL_SERVER_ERROR),

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION (VAL_xxx)
    // ═══════════════════════════════════════════════════════════════════════

    VALIDATION_FAILED("VAL_001", "Validation failed", HttpStatus.BAD_REQUEST),
    INVALID_ARGUMENT("VAL_002", "Invalid argument", HttpStatus.BAD_REQUEST),
    MISSING_PARAMETER("VAL_003", "Missing required parameter", HttpStatus.BAD_REQUEST),

    // ═══════════════════════════════════════════════════════════════════════
    // RESOURCE (RES_xxx)
    // ═══════════════════════════════════════════════════════════════════════

    RESOURCE_NOT_FOUND("RES_001", "Resource not found", HttpStatus.NOT_FOUND),
    RESOURCE_DUPLICATE("RES_002", "Resource already exists", HttpStatus.CONFLICT),
    RESOURCE_ACCESS_DENIED("RES_003", "Access denied", HttpStatus.FORBIDDEN),

    // ═══════════════════════════════════════════════════════════════════════
    // GENERIC (ERR_xxx)
    // ═══════════════════════════════════════════════════════════════════════

    INTERNAL_ERROR("ERR_500", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND("ERR_404", "Not found", HttpStatus.NOT_FOUND),
    BAD_REQUEST("ERR_400", "Bad request", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("ERR_401", "Unauthorized", HttpStatus.UNAUTHORIZED);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;
}