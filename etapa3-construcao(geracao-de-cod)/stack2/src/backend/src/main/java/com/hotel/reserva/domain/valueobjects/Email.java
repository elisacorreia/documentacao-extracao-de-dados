package com.hotel.reserva.domain.valueobjects;

import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Email {

    private String valor;

    private Email(String valor) {
        this.valor = valor.toLowerCase().trim();
    }

    public static Email criar(String email) {
        if (!validar(email)) {
            throw new IllegalArgumentException("E-mail inválido");
        }
        
        return new Email(email);
    }

    private static boolean validar(String email) {
        String regex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
        return email != null && email.matches(regex);
    }
}
