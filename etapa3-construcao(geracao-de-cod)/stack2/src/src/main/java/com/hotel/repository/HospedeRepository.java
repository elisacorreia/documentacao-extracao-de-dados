package com.hotel.repository;

import com.hotel.entity.Hospede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospedeRepository extends JpaRepository<Hospede, UUID> {
    
    /**
     * Verifica se já existe um hóspede com o CPF informado
     */
    boolean existsByCpf(String cpf);
    
    /**
     * Busca um hóspede pelo CPF
     */
    Optional<Hospede> findByCpf(String cpf);
}
