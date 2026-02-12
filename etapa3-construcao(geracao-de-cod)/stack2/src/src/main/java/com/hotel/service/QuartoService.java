package com.hotel.service;

import com.hotel.dto.QuartoDTO;
import com.hotel.entity.Quarto;
import com.hotel.exception.BusinessException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.repository.QuartoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuartoService {
    
    private final QuartoRepository quartoRepository;
    
    /**
     * Cria um novo quarto
     */
    @Transactional
    public QuartoDTO criar(QuartoDTO dto) {
        // Verifica se o número do quarto já está cadastrado
        if (quartoRepository.existsByNumero(dto.getNumero())) {
            throw new BusinessException("Número de quarto já cadastrado no sistema");
        }
        
        Quarto quarto = convertToEntity(dto);
        Quarto saved = quartoRepository.save(quarto);
        return convertToDTO(saved);
    }
    
    /**
     * Lista todos os quartos
     */
    @Transactional(readOnly = true)
    public List<QuartoDTO> listarTodos() {
        return quartoRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Lista apenas quartos disponíveis
     */
    @Transactional(readOnly = true)
    public List<QuartoDTO> listarDisponiveis() {
        return quartoRepository.findByDisponivelTrue()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Busca um quarto por ID
     */
    @Transactional(readOnly = true)
    public QuartoDTO buscarPorId(UUID id) {
        Quarto quarto = quartoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado com ID: " + id));
        return convertToDTO(quarto);
    }
    
    /**
     * Atualiza a disponibilidade do quarto
     */
    @Transactional
    public void atualizarDisponibilidade(UUID id, boolean disponivel) {
        Quarto quarto = quartoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado com ID: " + id));
        
        quarto.setDisponivel(disponivel);
        quartoRepository.save(quarto);
    }
    
    /**
     * Converte Entity para DTO
     */
    private QuartoDTO convertToDTO(Quarto quarto) {
        return new QuartoDTO(
            quarto.getId(),
            quarto.getNumero(),
            quarto.getTipo(),
            quarto.getPrecoDiaria(),
            quarto.getDisponivel(),
            quarto.getCriadoEm()
        );
    }
    
    /**
     * Converte DTO para Entity
     */
    private Quarto convertToEntity(QuartoDTO dto) {
        Quarto quarto = new Quarto();
        quarto.setNumero(dto.getNumero());
        quarto.setTipo(dto.getTipo());
        quarto.setPrecoDiaria(dto.getPrecoDiaria());
        quarto.setDisponivel(dto.getDisponivel() != null ? dto.getDisponivel() : true);
        return quarto;
    }
}
