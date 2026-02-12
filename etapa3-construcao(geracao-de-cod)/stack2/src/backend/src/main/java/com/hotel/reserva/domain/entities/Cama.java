package com.hotel.reserva.domain.entities;

import com.hotel.reserva.domain.enums.TipoCama;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "camas")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Cama {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCama tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id")
    private Quarto quarto;

    public Cama(TipoCama tipo) {
        this.tipo = tipo;
    }

    void setQuarto(Quarto quarto) {
        this.quarto = quarto;
    }
}
