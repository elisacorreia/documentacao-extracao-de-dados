package com.hotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospedeDTO {
    private UUID id;
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nome;
    
    @NotBlank(message = "Sobrenome é obrigatório")
    @Size(min = 2, max = 100, message = "Sobrenome deve ter entre 2 e 100 caracteres")
    private String sobrenome;
    
    @CPF(message = "CPF inválido")
    @NotBlank(message = "CPF é obrigatório")
    private String cpf;
    
    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    private String email;
    
    private LocalDateTime criadoEm;
}
