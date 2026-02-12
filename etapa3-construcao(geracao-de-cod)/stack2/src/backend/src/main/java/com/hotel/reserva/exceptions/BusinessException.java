package com.hotel.reserva.exceptions;

public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
}
