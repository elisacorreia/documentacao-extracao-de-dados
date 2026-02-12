package com.hotel.reserva.repositories;

import com.hotel.reserva.domain.entities.Hospede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospedeRepository extends JpaRepository<Hospede, UUID> {
    
    @Query("SELECT h FROM Hospede h WHERE h.cpf.valor = :cpf")
    Optional<Hospede> findByCpf(@Param("cpf") String cpf);
    
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM Hospede h WHERE h.cpf.valor = :cpf")
    boolean existsByCpf(@Param("cpf") String cpf);
    
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM Hospede h WHERE h.cpf.valor = :cpf AND h.id != :id")
    boolean existsByCpfAndIdNot(@Param("cpf") String cpf, @Param("id") UUID id);
}
