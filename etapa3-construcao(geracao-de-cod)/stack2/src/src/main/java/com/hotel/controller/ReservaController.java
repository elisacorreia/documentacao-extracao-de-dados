package com.hotel.controller;

import com.hotel.dto.ReservaDTO;
import com.hotel.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservaController {
    
    private final ReservaService reservaService;
    
    /**
     * POST /api/reservas - Criar nova reserva
     */
    @PostMapping
    public ResponseEntity<ReservaDTO> criar(@Valid @RequestBody ReservaDTO dto) {
        ReservaDTO created = reservaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * GET /api/reservas - Listar todas as reservas
     */
    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listarTodas() {
        List<ReservaDTO> reservas = reservaService.listarTodas();
        return ResponseEntity.ok(reservas);
    }
    
    /**
     * GET /api/reservas/ativas - Listar reservas ativas
     */
    @GetMapping("/ativas")
    public ResponseEntity<List<ReservaDTO>> listarAtivas() {
        List<ReservaDTO> reservas = reservaService.listarAtivas();
        return ResponseEntity.ok(reservas);
    }
    
    /**
     * GET /api/reservas/{id} - Buscar reserva por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> buscarPorId(@PathVariable UUID id) {
        ReservaDTO reserva = reservaService.buscarPorId(id);
        return ResponseEntity.ok(reserva);
    }
    
    /**
     * PUT /api/reservas/{id} - Atualizar reserva
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReservaDTO> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ReservaDTO dto) {
        ReservaDTO updated = reservaService.atualizar(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * PATCH /api/reservas/{id}/cancelar - Cancelar reserva
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable UUID id) {
        reservaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
