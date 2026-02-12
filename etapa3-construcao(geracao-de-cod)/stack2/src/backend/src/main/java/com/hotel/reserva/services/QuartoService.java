package com.hotel.reserva.services;

import com.hotel.reserva.domain.entities.Quarto;
import com.hotel.reserva.domain.enums.Disponibilidade;
import com.hotel.reserva.dto.AtualizarQuartoDTO;
import com.hotel.reserva.dto.CriarQuartoDTO;
import com.hotel.reserva.dto.QuartoResponseDTO;
import com.hotel.reserva.exceptions.BusinessException;
import com.hotel.reserva.exceptions.ResourceNotFoundException;
import com.hotel.reserva.repositories.QuartoRepository;
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

    @Transactional
    public QuartoResponseDTO criarQuarto(CriarQuartoDTO dto) {
        if (quartoRepository.existsByNumero(dto.getNumero())) {
            throw new BusinessException("Já existe um quarto com este número");
        }

        Quarto quarto = Quarto.builder()
                .numero(dto.getNumero())
                .capacidade(dto.getCapacidade())
                .tipo(dto.getTipo())
                .precoPorDiaria(dto.getPrecoPorDiaria())
                .temFrigobar(dto.getTemFrigobar())
                .temCafeDaManha(dto.getTemCafeDaManha())
                .temArCondicionado(dto.getTemArCondicionado())
                .temTV(dto.getTemTV())
                .tiposCamas(dto.getCamas())
                .build();

        quarto.validar();

        Quarto quartoSalvo = quartoRepository.save(quarto);
        return QuartoResponseDTO.fromEntity(quartoSalvo);
    }

    @Transactional
    public QuartoResponseDTO atualizarQuarto(UUID id, AtualizarQuartoDTO dto) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));

        if (dto.getNumero() != null && 
            quartoRepository.existsByNumeroAndIdNot(dto.getNumero(), id)) {
            throw new BusinessException("Já existe um quarto com este número");
        }

        quarto.atualizarDados(
                dto.getNumero(),
                dto.getCapacidade(),
                dto.getTipo(),
                dto.getPrecoPorDiaria(),
                dto.getTemFrigobar(),
                dto.getTemCafeDaManha(),
                dto.getTemArCondicionado(),
                dto.getTemTV(),
                dto.getCamas()
        );

        quarto.validar();

        Quarto quartoAtualizado = quartoRepository.save(quarto);
        return QuartoResponseDTO.fromEntity(quartoAtualizado);
    }

    @Transactional(readOnly = true)
    public List<QuartoResponseDTO> listarTodos() {
        return quartoRepository.findAll().stream()
                .map(QuartoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuartoResponseDTO buscarPorId(UUID id) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));
        
        return QuartoResponseDTO.fromEntity(quarto);
    }

    @Transactional
    public QuartoResponseDTO alterarDisponibilidade(UUID id, Disponibilidade disponibilidade) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));

        quarto.alterarDisponibilidade(disponibilidade);

        Quarto quartoAtualizado = quartoRepository.save(quarto);
        return QuartoResponseDTO.fromEntity(quartoAtualizado);
    }

    @Transactional(readOnly = true)
    public List<QuartoResponseDTO> listarPorDisponibilidade(Disponibilidade disponibilidade) {
        return quartoRepository.findByDisponibilidade(disponibilidade).stream()
                .map(QuartoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(UUID id) {
        if (!quartoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quarto não encontrado");
        }
        
        quartoRepository.deleteById(id);
    }
}
