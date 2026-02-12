package com.hotel.reserva.repositories;

import com.hotel.reserva.domain.entities.Quarto;
import com.hotel.reserva.domain.enums.Disponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, UUID> {
    
    Optional<Quarto> findByNumero(Integer numero);
    
    boolean existsByNumero(Integer numero);
    
    boolean existsByNumeroAndIdNot(Integer numero, UUID id);
    
    List<Quarto> findByDisponibilidade(Disponibilidade disponibilidade);
}
