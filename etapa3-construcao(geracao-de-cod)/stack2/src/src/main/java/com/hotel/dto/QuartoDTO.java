package com.hotel.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuartoDTO {
    private UUID id;
    
    @NotNull(message = "Número do quarto é obrigatório")
    @Positive(message = "Número do quarto deve ser positivo")
    private Integer numero;
    
    @NotNull(message = "Tipo do quarto é obrigatório")
    private String tipo;
    
    @NotNull(message = "Preço da diária é obrigatório")
    @Positive(message = "Preço da diária deve ser positivo")
    private BigDecimal precoDiaria;
    
    private Boolean disponivel;
    private LocalDateTime criadoEm;
}
