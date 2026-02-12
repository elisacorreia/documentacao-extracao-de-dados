package com.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospede_id", nullable = false)
    @NotNull(message = "Hóspede é obrigatório")
    private Hospede hospede;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quarto_id", nullable = false)
    @NotNull(message = "Quarto é obrigatório")
    private Quarto quarto;
    
    @NotNull(message = "Data de check-in é obrigatória")
    @Column(name = "data_check_in", nullable = false)
    private LocalDate dataCheckIn;
    
    @NotNull(message = "Data de check-out é obrigatória")
    @Column(name = "data_check_out", nullable = false)
    private LocalDate dataCheckOut;
    
    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusReserva status = StatusReserva.ATIVA;
    
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
    
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
    
    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
        calcularValorTotal();
    }
    
    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
        calcularValorTotal();
    }
    
    private void calcularValorTotal() {
        if (dataCheckIn != null && dataCheckOut != null && quarto != null && quarto.getPrecoDiaria() != null) {
            long dias = ChronoUnit.DAYS.between(dataCheckIn, dataCheckOut);
            if (dias > 0) {
                valorTotal = quarto.getPrecoDiaria().multiply(BigDecimal.valueOf(dias));
            }
        }
    }
    
    public enum StatusReserva {
        ATIVA, CANCELADA, FINALIZADA
    }
}
