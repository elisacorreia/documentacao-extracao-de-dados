package com.hotel.reserva.domain.entities;

import com.hotel.reserva.domain.enums.StatusReserva;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "reservas")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospede_id", nullable = false)
    private Hospede hospede;

    @Column(nullable = false)
    private LocalDate dataCheckIn;

    @Column(nullable = false)
    private LocalDate dataCheckOut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusReserva status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    @Builder
    public Reserva(Quarto quarto, Hospede hospede, LocalDate dataCheckIn,
                   LocalDate dataCheckOut, BigDecimal valorTotal) {
        this.quarto = quarto;
        this.hospede = hospede;
        this.dataCheckIn = dataCheckIn;
        this.dataCheckOut = dataCheckOut;
        this.valorTotal = valorTotal;
        this.status = StatusReserva.PENDENTE;
    }

    public long calcularNumeroDiarias() {
        return ChronoUnit.DAYS.between(dataCheckIn, dataCheckOut);
    }

    public void confirmar() {
        if (this.status != StatusReserva.PENDENTE) {
            throw new IllegalStateException("Apenas reservas pendentes podem ser confirmadas");
        }
        this.status = StatusReserva.CONFIRMADA;
        this.atualizadoEm = LocalDateTime.now();
    }

    public void cancelar() {
        if (this.status == StatusReserva.FINALIZADA || this.status == StatusReserva.CANCELADA) {
            throw new IllegalStateException("Não é possível cancelar esta reserva");
        }
        this.status = StatusReserva.CANCELADA;
        this.atualizadoEm = LocalDateTime.now();
    }

    public void checkIn() {
        if (this.status != StatusReserva.CONFIRMADA) {
            throw new IllegalStateException("Apenas reservas confirmadas podem fazer check-in");
        }
        this.status = StatusReserva.EM_ANDAMENTO;
        this.atualizadoEm = LocalDateTime.now();
    }

    public void checkOut() {
        if (this.status != StatusReserva.EM_ANDAMENTO) {
            throw new IllegalStateException("Apenas reservas em andamento podem fazer check-out");
        }
        this.status = StatusReserva.FINALIZADA;
        this.atualizadoEm = LocalDateTime.now();
    }

    public boolean podeSerAlterada() {
        return this.status == StatusReserva.PENDENTE || this.status == StatusReserva.CONFIRMADA;
    }

    public void atualizarDados(Quarto quarto, Hospede hospede, LocalDate dataCheckIn,
                              LocalDate dataCheckOut, BigDecimal valorTotal) {
        if (!podeSerAlterada()) {
            throw new IllegalStateException("Esta reserva não pode ser alterada");
        }
        
        if (quarto != null) this.quarto = quarto;
        if (hospede != null) this.hospede = hospede;
        if (dataCheckIn != null) this.dataCheckIn = dataCheckIn;
        if (dataCheckOut != null) this.dataCheckOut = dataCheckOut;
        if (valorTotal != null) this.valorTotal = valorTotal;
        
        this.atualizadoEm = LocalDateTime.now();
    }

    public void validar() {
        if (quarto == null) {
            throw new IllegalArgumentException("Quarto é obrigatório");
        }
        
        if (hospede == null) {
            throw new IllegalArgumentException("Hóspede é obrigatório");
        }
        
        if (dataCheckOut.isBefore(dataCheckIn) || dataCheckOut.isEqual(dataCheckIn)) {
            throw new IllegalArgumentException("Data de check-out deve ser posterior à data de check-in");
        }
        
        if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor total deve ser maior que zero");
        }
    }
}
