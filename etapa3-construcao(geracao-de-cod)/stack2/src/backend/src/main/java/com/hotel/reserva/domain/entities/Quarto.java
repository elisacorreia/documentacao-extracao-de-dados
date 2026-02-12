package com.hotel.reserva.domain.entities;

import com.hotel.reserva.domain.enums.Disponibilidade;
import com.hotel.reserva.domain.enums.TipoCama;
import com.hotel.reserva.domain.enums.TipoQuarto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quartos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Column(nullable = false)
    private Integer capacidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoQuarto tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoPorDiaria;

    @Column(nullable = false)
    private Boolean temFrigobar;

    @Column(nullable = false)
    private Boolean temCafeDaManha;

    @Column(nullable = false)
    private Boolean temArCondicionado;

    @Column(nullable = false)
    private Boolean temTV;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Disponibilidade disponibilidade;

    @OneToMany(mappedBy = "quarto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cama> camas = new ArrayList<>();

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
    public Quarto(Integer numero, Integer capacidade, TipoQuarto tipo,
                  BigDecimal precoPorDiaria, Boolean temFrigobar, Boolean temCafeDaManha,
                  Boolean temArCondicionado, Boolean temTV, List<TipoCama> tiposCamas) {
        this.numero = numero;
        this.capacidade = capacidade;
        this.tipo = tipo;
        this.precoPorDiaria = precoPorDiaria;
        this.temFrigobar = temFrigobar;
        this.temCafeDaManha = temCafeDaManha;
        this.temArCondicionado = temArCondicionado;
        this.temTV = temTV;
        this.disponibilidade = Disponibilidade.LIVRE;
        
        if (tiposCamas != null) {
            tiposCamas.forEach(this::adicionarCama);
        }
    }

    public void alterarDisponibilidade(Disponibilidade novaDisponibilidade) {
        this.disponibilidade = novaDisponibilidade;
        this.atualizadoEm = LocalDateTime.now();
    }

    public boolean podeSerReservado() {
        return this.disponibilidade == Disponibilidade.LIVRE;
    }

    public void adicionarCama(TipoCama tipo) {
        Cama cama = new Cama(tipo);
        cama.setQuarto(this);
        this.camas.add(cama);
    }

    public void removerCama(UUID camaId) {
        this.camas.removeIf(cama -> cama.getId().equals(camaId));
    }

    public void atualizarDados(Integer numero, Integer capacidade, TipoQuarto tipo,
                              BigDecimal precoPorDiaria, Boolean temFrigobar, Boolean temCafeDaManha,
                              Boolean temArCondicionado, Boolean temTV, List<TipoCama> tiposCamas) {
        if (numero != null) this.numero = numero;
        if (capacidade != null) this.capacidade = capacidade;
        if (tipo != null) this.tipo = tipo;
        if (precoPorDiaria != null) this.precoPorDiaria = precoPorDiaria;
        if (temFrigobar != null) this.temFrigobar = temFrigobar;
        if (temCafeDaManha != null) this.temCafeDaManha = temCafeDaManha;
        if (temArCondicionado != null) this.temArCondicionado = temArCondicionado;
        if (temTV != null) this.temTV = temTV;
        
        if (tiposCamas != null) {
            this.camas.clear();
            tiposCamas.forEach(this::adicionarCama);
        }
        
        this.atualizadoEm = LocalDateTime.now();
    }

    public BigDecimal calcularValorTotal(int numeroDiarias) {
        return precoPorDiaria.multiply(BigDecimal.valueOf(numeroDiarias));
    }

    public List<Cama> getCamas() {
        return Collections.unmodifiableList(camas);
    }

    public void validar() {
        if (numero == null || numero <= 0) {
            throw new IllegalArgumentException("Número do quarto deve ser maior que zero");
        }
        
        if (capacidade == null || capacidade <= 0) {
            throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        }
        
        if (precoPorDiaria == null || precoPorDiaria.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço por diária deve ser maior que zero");
        }
        
        if (camas.isEmpty()) {
            throw new IllegalArgumentException("Quarto deve ter pelo menos uma cama");
        }
    }
}
