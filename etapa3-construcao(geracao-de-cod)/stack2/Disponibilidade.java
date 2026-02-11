package com.hotel.reserva.domain.enums;

public enum Disponibilidade {
    LIVRE("Livre"),
    OCUPADO("Ocupado"),
    MANUTENCAO("Manutenção"),
    LIMPEZA("Limpeza");

    private final String descricao;

    Disponibilidade(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
