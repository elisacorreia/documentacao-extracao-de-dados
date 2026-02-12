package com.hotel.repository;

import com.hotel.entity.Reserva;
import com.hotel.entity.Reserva.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, UUID> {
    
    /**
     * Lista todas as reservas ativas
     */
    List<Reserva> findByStatus(StatusReserva status);
    
    /**
     * Verifica se existe alguma reserva ativa para o quarto
     */
    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.quarto.id = :quartoId AND r.status = 'ATIVA'")
    boolean existsReservaAtivaByQuartoId(@Param("quartoId") UUID quartoId);
    
    /**
     * Lista reservas por hóspede
     */
    List<Reserva> findByHospedeId(UUID hospedeId);
}
