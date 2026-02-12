package com.hotel.controller;

import com.hotel.dto.HospedeDTO;
import com.hotel.service.HospedeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hospedes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HospedeController {
    
    private final HospedeService hospedeService;
    
    /**
     * POST /api/hospedes - Criar novo hóspede
     */
    @PostMapping
    public ResponseEntity<HospedeDTO> criar(@Valid @RequestBody HospedeDTO dto) {
        HospedeDTO created = hospedeService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * GET /api/hospedes - Listar todos os hóspedes
     */
    @GetMapping
    public ResponseEntity<List<HospedeDTO>> listarTodos() {
        List<HospedeDTO> hospedes = hospedeService.listarTodos();
        return ResponseEntity.ok(hospedes);
    }
    
    /**
     * GET /api/hospedes/{id} - Buscar hóspede por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HospedeDTO> buscarPorId(@PathVariable UUID id) {
        HospedeDTO hospede = hospedeService.buscarPorId(id);
        return ResponseEntity.ok(hospede);
    }
    
    /**
     * GET /api/hospedes/cpf/{cpf} - Buscar hóspede por CPF
     */
    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<HospedeDTO> buscarPorCpf(@PathVariable String cpf) {
        HospedeDTO hospede = hospedeService.buscarPorCpf(cpf);
        return ResponseEntity.ok(hospede);
    }
}
