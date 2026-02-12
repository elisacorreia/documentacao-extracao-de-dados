package com.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospedes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospede {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;
    
    @NotBlank(message = "Sobrenome é obrigatório")
    @Size(min = 2, max = 100, message = "Sobrenome deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String sobrenome;
    
    @CPF(message = "CPF inválido")
    @NotBlank(message = "CPF é obrigatório")
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;
    
    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    @Column(nullable = false, length = 150)
    private String email;
    
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
    
    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}
