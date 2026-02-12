package com.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quartos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quarto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotNull(message = "Número do quarto é obrigatório")
    @Positive(message = "Número do quarto deve ser positivo")
    @Column(nullable = false, unique = true)
    private Integer numero;
    
    @NotNull(message = "Tipo do quarto é obrigatório")
    @Column(nullable = false, length = 50)
    private String tipo;
    
    @NotNull(message = "Preço da diária é obrigatório")
    @Positive(message = "Preço da diária deve ser positivo")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoDiaria;
    
    @Column(nullable = false)
    private Boolean disponivel = true;
    
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
    
    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        if (disponivel == null) {
            disponivel = true;
        }
    }
}
