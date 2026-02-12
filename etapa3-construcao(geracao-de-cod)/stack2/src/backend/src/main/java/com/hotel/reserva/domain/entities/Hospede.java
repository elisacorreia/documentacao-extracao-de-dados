package com.hotel.reserva.domain.entities;

import com.hotel.reserva.domain.valueobjects.CPF;
import com.hotel.reserva.domain.valueobjects.Email;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospedes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Hospede {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String sobrenome;

    @Embedded
    @AttributeOverride(name = "valor", column = @Column(name = "cpf", nullable = false, unique = true))
    private CPF cpf;

    @Embedded
    @AttributeOverride(name = "valor", column = @Column(name = "email", nullable = false))
    private Email email;

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
    public Hospede(String nome, String sobrenome, String cpf, String email) {
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.cpf = CPF.criar(cpf);
        this.email = Email.criar(email);
    }

    public String getNomeCompleto() {
        return nome + " " + sobrenome;
    }

    public void atualizarEmail(Email novoEmail) {
        this.email = novoEmail;
        this.atualizadoEm = LocalDateTime.now();
    }

    public void atualizarDados(String nome, String sobrenome, String email) {
        if (nome != null && !nome.isBlank()) {
            this.nome = nome;
        }
        
        if (sobrenome != null && !sobrenome.isBlank()) {
            this.sobrenome = sobrenome;
        }
        
        if (email != null && !email.isBlank()) {
            this.email = Email.criar(email);
        }
        
        this.atualizadoEm = LocalDateTime.now();
    }

    public void validar() {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        
        if (sobrenome == null || sobrenome.isBlank()) {
            throw new IllegalArgumentException("Sobrenome é obrigatório");
        }
    }
}
