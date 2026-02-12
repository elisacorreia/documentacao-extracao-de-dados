package com.hotel.reserva.dto;

import com.hotel.reserva.domain.entities.Quarto;
import com.hotel.reserva.domain.enums.Disponibilidade;
import com.hotel.reserva.domain.enums.TipoCama;
import com.hotel.reserva.domain.enums.TipoQuarto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuartoResponseDTO {

    private UUID id;
    private Integer numero;
    private Integer capacidade;
    private TipoQuarto tipo;
    private BigDecimal precoPorDiaria;
    private Boolean temFrigobar;
    private Boolean temCafeDaManha;
    private Boolean temArCondicionado;
    private Boolean temTV;
    private Disponibilidade disponibilidade;
    private List<TipoCama> camas;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public static QuartoResponseDTO fromEntity(Quarto quarto) {
        return QuartoResponseDTO.builder()
                .id(quarto.getId())
                .numero(quarto.getNumero())
                .capacidade(quarto.getCapacidade())
                .tipo(quarto.getTipo())
                .precoPorDiaria(quarto.getPrecoPorDiaria())
                .temFrigobar(quarto.getTemFrigobar())
                .temCafeDaManha(quarto.getTemCafeDaManha())
                .temArCondicionado(quarto.getTemArCondicionado())
                .temTV(quarto.getTemTV())
                .disponibilidade(quarto.getDisponibilidade())
                .camas(quarto.getCamas().stream()
                        .map(cama -> cama.getTipo())
                        .collect(Collectors.toList()))
                .criadoEm(quarto.getCriadoEm())
                .atualizadoEm(quarto.getAtualizadoEm())
                .build();
    }
}
