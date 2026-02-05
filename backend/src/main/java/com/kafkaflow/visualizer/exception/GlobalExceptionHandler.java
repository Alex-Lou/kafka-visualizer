package com.kafkaflow.visualizer.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.kafkaflow.visualizer.dto.ErrorResponse;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.LazyInitializationException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    // ═══════════════════════════════════════════════════════════════════════
    // CUSTOM APP EXCEPTIONS
    // ═══════════════════════════════════════════════════════════════════════

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex, HttpServletRequest request) {
        log.error("❌ {}", ex.toLogString());
        return buildErrorResponse(ex.getMessage(), ex.getErrorCode().getCode(), ex.getErrorCode().getHttpStatus(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("🔍 Not found: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), ex.getErrorCode().getCode(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex, HttpServletRequest request) {
        log.warn("⚠️ Duplicate: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), ex.getErrorCode().getCode(), HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(KafkaConnectionException.class)
    public ResponseEntity<ErrorResponse> handleKafkaConnectionException(KafkaConnectionException ex, HttpServletRequest request) {
        String cleanMessage = ErrorMessageSimplifier.simplifyKafkaError(ex);

        log.error("🔌 Kafka connection failed: {}", cleanMessage);

        if (log.isDebugEnabled()) {
            log.debug("   └─ Full Stack:", ex);
        }

        return buildErrorResponse(cleanMessage, ex.getErrorCode().getCode(), HttpStatus.BAD_REQUEST, request);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DATA ACCESS & DATABASE EXCEPTIONS
    // ═══════════════════════════════════════════════════════════════════════

    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<ErrorResponse> handleLazyInitException(LazyInitializationException ex, HttpServletRequest request) {
        String entity = ErrorMessageSimplifier.extractEntityFromLazyError(ex.getMessage());
        log.error("💾 DB Session closed - Entity: {} | Use JOIN FETCH or @Transactional", entity);
        return buildErrorResponse(
                "Data loading error. Please retry.",
                "DB_SESSION_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request
        );
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex, HttpServletRequest request) {
        log.error("💾 Database error: {}", ErrorMessageSimplifier.simplifyDbError(ex.getMessage()));
        return buildErrorResponse(
                "Database error occurred",
                "DB_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTEGRATION & IO EXCEPTIONS (Mail, JSON)
    // ═══════════════════════════════════════════════════════════════════════

    @ExceptionHandler(MessagingException.class)
    public ResponseEntity<ErrorResponse> handleMessagingException(MessagingException ex, HttpServletRequest request) {
        log.error("📧 Email sending failed: {}", ErrorMessageSimplifier.simplify(ex));
        return buildErrorResponse(
                "Failed to send email",
                "EMAIL_SEND_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request
        );
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<ErrorResponse> handleJsonProcessingException(JsonProcessingException ex, HttpServletRequest request) {
        log.error("📄 JSON conversion failed: {}", ErrorMessageSimplifier.simplify(ex));
        return buildErrorResponse(
                "Failed to generate JSON report",
                "JSON_CONVERSION_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION EXCEPTIONS
    // ═══════════════════════════════════════════════════════════════════════

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        log.warn("⚠️ Validation: {}", message);
        return buildErrorResponse(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("⚠️ Invalid argument: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), "INVALID_ARGUMENT", HttpStatus.BAD_REQUEST, request);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GENERIC & CATCH-ALL
    // ═══════════════════════════════════════════════════════════════════════

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(NoResourceFoundException ex, HttpServletRequest request) {
        return buildErrorResponse("Resource not found", "NOT_FOUND", HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        String simplifiedMessage = ErrorMessageSimplifier.simplify(ex);
        log.error("❌ Unexpected [{}]: {}", ex.getClass().getSimpleName(), simplifiedMessage);

        if (log.isDebugEnabled()) {
            log.debug("Full stacktrace:", ex);
        }

        return buildErrorResponse(
                "An unexpected error occurred",
                "INTERNAL_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════

    private ResponseEntity<ErrorResponse> buildErrorResponse(String message, String errorCode, HttpStatus status, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(errorCode)
                .message(message)
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(errorResponse);
    }
}