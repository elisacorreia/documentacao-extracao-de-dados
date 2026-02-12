package com.hotel.exception;

/**
 * Exceção para recurso não encontrado
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
