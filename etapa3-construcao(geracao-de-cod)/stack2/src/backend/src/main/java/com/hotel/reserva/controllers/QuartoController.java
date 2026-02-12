package com.hotel.reserva.controllers;

import com.hotel.reserva.domain.enums.Disponibilidade;
import com.hotel.reserva.dto.AtualizarQuartoDTO;
import com.hotel.reserva.dto.CriarQuartoDTO;
import com.hotel.reserva.dto.QuartoResponseDTO;
import com.hotel.reserva.services.QuartoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quartos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuartoController {

    private final QuartoService quartoService;

    @PostMapping
    public ResponseEntity<QuartoResponseDTO> criarQuarto(@Valid @RequestBody CriarQuartoDTO dto) {
        QuartoResponseDTO response = quartoService.criarQuarto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<QuartoResponseDTO>> listarTodos() {
        List<QuartoResponseDTO> quartos = quartoService.listarTodos();
        return ResponseEntity.ok(quartos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponseDTO> buscarPorId(@PathVariable UUID id) {
        QuartoResponseDTO quarto = quartoService.buscarPorId(id);
        return ResponseEntity.ok(quarto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuartoResponseDTO> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody AtualizarQuartoDTO dto) {
        QuartoResponseDTO response = quartoService.atualizarQuarto(id, dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/disponibilidade")
    public ResponseEntity<QuartoResponseDTO> alterarDisponibilidade(
            @PathVariable UUID id,
            @RequestParam Disponibilidade disponibilidade) {
        QuartoResponseDTO response = quartoService.alterarDisponibilidade(id, disponibilidade);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/disponibilidade/{disponibilidade}")
    public ResponseEntity<List<QuartoResponseDTO>> listarPorDisponibilidade(
            @PathVariable Disponibilidade disponibilidade) {
        List<QuartoResponseDTO> quartos = quartoService.listarPorDisponibilidade(disponibilidade);
        return ResponseEntity.ok(quartos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        quartoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
