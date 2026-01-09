package com.kafkaflow.visualizer.exception;

import lombok.Getter;

/**
 * Exception applicative de base
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String detail;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.detail = null;
    }

    public AppException(ErrorCode errorCode, String detail) {
        super(detail != null ? detail : errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.detail = detail;
    }

    public AppException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getDefaultMessage(), cause);
        this.errorCode = errorCode;
        this.detail = cause.getMessage();
    }

    public AppException(ErrorCode errorCode, String detail, Throwable cause) {
        super(detail, cause);
        this.errorCode = errorCode;
        this.detail = detail;
    }

    /**
     * Message pour les logs (format court)
     */
    public String toLogString() {
        if (detail != null && !detail.equals(errorCode.getDefaultMessage())) {
            return String.format("[%s] %s", errorCode.getCode(), detail);
        }
        return String.format("[%s] %s", errorCode.getCode(), errorCode.getDefaultMessage());
    }
}