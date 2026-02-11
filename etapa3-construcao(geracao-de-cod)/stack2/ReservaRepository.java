package com.hotel.reserva.repositories;

import com.hotel.reserva.domain.entities.Reserva;
import com.hotel.reserva.domain.enums.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, UUID> {
    
    List<Reserva> findByQuartoId(UUID quartoId);
    
    List<Reserva> findByHospedeId(UUID hospedeId);
    
    List<Reserva> findByStatusIn(List<StatusReserva> statuses);
    
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reserva r " +
           "WHERE r.quarto.id = :quartoId AND r.status IN ('CONFIRMADA', 'EM_ANDAMENTO')")
    boolean existsReservaAtivaByQuartoId(@Param("quartoId") UUID quartoId);
}
