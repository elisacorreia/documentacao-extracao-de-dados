package com.hotel.reserva.dto;

import com.hotel.reserva.domain.enums.TipoCama;
import com.hotel.reserva.domain.enums.TipoQuarto;
import jakarta.validation.constraints.*;
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
public class CriarQuartoDTO {

    @NotNull(message = "Número do quarto é obrigatório")
    @Min(value = 1, message = "Número do quarto deve ser maior que zero")
    private Integer numero;

    @NotNull(message = "Capacidade é obrigatória")
    @Min(value = 1, message = "Capacidade deve ser maior que zero")
    private Integer capacidade;

    @NotNull(message = "Tipo do quarto é obrigatório")
    private TipoQuarto tipo;

    @NotNull(message = "Preço por diária é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    private BigDecimal precoPorDiaria;

    @NotNull(message = "Informação sobre frigobar é obrigatória")
    private Boolean temFrigobar;

    @NotNull(message = "Informação sobre café da manhã é obrigatória")
    private Boolean temCafeDaManha;

    @NotNull(message = "Informação sobre ar-condicionado é obrigatória")
    private Boolean temArCondicionado;

    @NotNull(message = "Informação sobre TV é obrigatória")
    private Boolean temTV;

    @NotEmpty(message = "Quarto deve ter pelo menos uma cama")
    private List<TipoCama> camas;
}
