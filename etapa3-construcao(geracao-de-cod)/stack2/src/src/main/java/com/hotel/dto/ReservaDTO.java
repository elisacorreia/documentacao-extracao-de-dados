package com.hotel.dto;

import com.hotel.entity.Reserva.StatusReserva;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaDTO {
    private UUID id;
    
    @NotNull(message = "ID do hóspede é obrigatório")
    private UUID hospedeId;
    
    @NotNull(message = "ID do quarto é obrigatório")
    private UUID quartoId;
    
    @NotNull(message = "Data de check-in é obrigatória")
    private LocalDate dataCheckIn;
    
    @NotNull(message = "Data de check-out é obrigatória")
    private LocalDate dataCheckOut;
    
    private BigDecimal valorTotal;
    private StatusReserva status;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    
    // Campos adicionais para exibição
    private String hospedeNome;
    private Integer quartoNumero;
}
