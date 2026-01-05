package com.kafkaflow.visualizer.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, String value) {
        super(String.format("%s with %s '%s' already exists", resourceName, fieldName, value));
    }
}
