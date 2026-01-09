package com.kafkaflow.visualizer.exception;

/**
 * Ressource non trouvée (404)
 */
public class ResourceNotFoundException extends AppException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }

    public ResourceNotFoundException(String resourceType, Object id) {
        super(ErrorCode.RESOURCE_NOT_FOUND, String.format("%s not found: %s", resourceType, id));
    }

    public ResourceNotFoundException(String resourceType, String fieldName, Object value) {
        super(ErrorCode.RESOURCE_NOT_FOUND, String.format("%s with %s '%s' not found", resourceType, fieldName, value));
    }
}