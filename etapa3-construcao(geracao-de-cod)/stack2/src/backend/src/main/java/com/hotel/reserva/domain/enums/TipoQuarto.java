package com.hotel.reserva.domain.enums;

public enum TipoQuarto {
    BASICO("Básico"),
    MODERNO("Moderno"),
    LUXO("Luxo");

    private final String descricao;

    TipoQuarto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
