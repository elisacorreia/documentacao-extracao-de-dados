package com.hotel.reserva.dto;

import com.hotel.reserva.domain.enums.TipoCama;
import com.hotel.reserva.domain.enums.TipoQuarto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarQuartoDTO {

    @Min(value = 1, message = "Número do quarto deve ser maior que zero")
    private Integer numero;

    @Min(value = 1, message = "Capacidade deve ser maior que zero")
    private Integer capacidade;

    private TipoQuarto tipo;

    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    private BigDecimal precoPorDiaria;

    private Boolean temFrigobar;

    private Boolean temCafeDaManha;

    private Boolean temArCondicionado;

    private Boolean temTV;

    private List<TipoCama> camas;
}
