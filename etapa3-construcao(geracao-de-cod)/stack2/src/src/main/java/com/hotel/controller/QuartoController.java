package com.hotel.controller;

import com.hotel.dto.QuartoDTO;
import com.hotel.service.QuartoService;
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
    
    /**
     * POST /api/quartos - Criar novo quarto
     */
    @PostMapping
    public ResponseEntity<QuartoDTO> criar(@Valid @RequestBody QuartoDTO dto) {
        QuartoDTO created = quartoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * GET /api/quartos - Listar todos os quartos
     */
    @GetMapping
    public ResponseEntity<List<QuartoDTO>> listarTodos() {
        List<QuartoDTO> quartos = quartoService.listarTodos();
        return ResponseEntity.ok(quartos);
    }
    
    /**
     * GET /api/quartos/disponiveis - Listar quartos disponíveis
     */
    @GetMapping("/disponiveis")
    public ResponseEntity<List<QuartoDTO>> listarDisponiveis() {
        List<QuartoDTO> quartos = quartoService.listarDisponiveis();
        return ResponseEntity.ok(quartos);
    }
    
    /**
     * GET /api/quartos/{id} - Buscar quarto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuartoDTO> buscarPorId(@PathVariable UUID id) {
        QuartoDTO quarto = quartoService.buscarPorId(id);
        return ResponseEntity.ok(quarto);
    }
}
