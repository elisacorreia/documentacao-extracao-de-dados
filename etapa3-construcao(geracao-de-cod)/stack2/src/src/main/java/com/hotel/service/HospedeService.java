package com.hotel.service;

import com.hotel.dto.HospedeDTO;
import com.hotel.entity.Hospede;
import com.hotel.exception.BusinessException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.repository.HospedeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HospedeService {
    
    private final HospedeRepository hospedeRepository;
    
    /**
     * Cria um novo hóspede
     */
    @Transactional
    public HospedeDTO criar(HospedeDTO dto) {
        // Verifica se o CPF já está cadastrado
        if (hospedeRepository.existsByCpf(dto.getCpf())) {
            throw new BusinessException("CPF já cadastrado no sistema");
        }
        
        Hospede hospede = convertToEntity(dto);
        Hospede saved = hospedeRepository.save(hospede);
        return convertToDTO(saved);
    }
    
    /**
     * Lista todos os hóspedes
     */
    @Transactional(readOnly = true)
    public List<HospedeDTO> listarTodos() {
        return hospedeRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Busca um hóspede por ID
     */
    @Transactional(readOnly = true)
    public HospedeDTO buscarPorId(UUID id) {
        Hospede hospede = hospedeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado com ID: " + id));
        return convertToDTO(hospede);
    }
    
    /**
     * Busca um hóspede por CPF
     */
    @Transactional(readOnly = true)
    public HospedeDTO buscarPorCpf(String cpf) {
        Hospede hospede = hospedeRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado com CPF: " + cpf));
        return convertToDTO(hospede);
    }
    
    /**
     * Converte Entity para DTO
     */
    private HospedeDTO convertToDTO(Hospede hospede) {
        return new HospedeDTO(
            hospede.getId(),
            hospede.getNome(),
            hospede.getSobrenome(),
            hospede.getCpf(),
            hospede.getEmail(),
            hospede.getCriadoEm()
        );
    }
    
    /**
     * Converte DTO para Entity
     */
    private Hospede convertToEntity(HospedeDTO dto) {
        Hospede hospede = new Hospede();
        hospede.setNome(dto.getNome());
        hospede.setSobrenome(dto.getSobrenome());
        hospede.setCpf(dto.getCpf());
        hospede.setEmail(dto.getEmail());
        return hospede;
    }
}
