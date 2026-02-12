package com.hotel.repository;

import com.hotel.entity.Quarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, UUID> {
    
    /**
     * Verifica se já existe um quarto com o número informado
     */
    boolean existsByNumero(Integer numero);
    
    /**
     * Busca um quarto pelo número
     */
    Optional<Quarto> findByNumero(Integer numero);
    
    /**
     * Lista todos os quartos disponíveis
     */
    List<Quarto> findByDisponivelTrue();
}
