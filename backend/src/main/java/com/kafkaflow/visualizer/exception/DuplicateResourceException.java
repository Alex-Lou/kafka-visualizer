package com.kafkaflow.visualizer.exception;

public class DuplicateResourceException extends AppException {

    public DuplicateResourceException(String message) {
        super(ErrorCode.RESOURCE_DUPLICATE, message);
    }

    public DuplicateResourceException(String resourceType, Object identifier) {
        super(ErrorCode.RESOURCE_DUPLICATE, String.format("%s already exists: %s", resourceType, identifier));
    }

    public DuplicateResourceException(String resourceType, String fieldName, Object value) {
        super(ErrorCode.RESOURCE_DUPLICATE, String.format("%s with %s '%s' already exists", resourceType, fieldName, value));
    }
}