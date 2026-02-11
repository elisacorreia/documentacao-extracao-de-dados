package com.hotel.reserva.domain.enums;

public enum TipoCama {
    SOLTEIRO("Solteiro"),
    CASAL_KING("Casal King"),
    CASAL_QUEEN("Casal Queen");

    private final String descricao;

    TipoCama(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
