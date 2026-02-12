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
public class CPF {

    private String valor;

    private CPF(String valor) {
        this.valor = valor;
    }

    public static CPF criar(String cpf) {
        String cpfLimpo = cpf.replaceAll("\\D", "");
        
        if (!validar(cpfLimpo)) {
            throw new IllegalArgumentException("CPF inválido");
        }
        
        return new CPF(cpfLimpo);
    }

    private static boolean validar(String cpf) {
        if (cpf.length() != 11) {
            return false;
        }
        
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }
        
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) {
            primeiroDigito = 0;
        }
        
        if (Character.getNumericValue(cpf.charAt(9)) != primeiroDigito) {
            return false;
        }
        
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) {
            segundoDigito = 0;
        }
        
        return Character.getNumericValue(cpf.charAt(10)) == segundoDigito;
    }

    public String formatar() {
        return valor.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }

    public String getValorSemFormatacao() {
        return valor;
    }
}
