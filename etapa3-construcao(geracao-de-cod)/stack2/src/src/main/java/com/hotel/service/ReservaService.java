package com.hotel.service;

import com.hotel.dto.ReservaDTO;
import com.hotel.entity.Hospede;
import com.hotel.entity.Quarto;
import com.hotel.entity.Reserva;
import com.hotel.entity.Reserva.StatusReserva;
import com.hotel.exception.BusinessException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.repository.HospedeRepository;
import com.hotel.repository.QuartoRepository;
import com.hotel.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {
    
    private final ReservaRepository reservaRepository;
    private final HospedeRepository hospedeRepository;
    private final QuartoRepository quartoRepository;
    private final QuartoService quartoService;
    
    /**
     * Cria uma nova reserva
     */
    @Transactional
    public ReservaDTO criar(ReservaDTO dto) {
        // Valida datas
        validarDatas(dto.getDataCheckIn(), dto.getDataCheckOut());
        
        // Busca hóspede
        Hospede hospede = hospedeRepository.findById(dto.getHospedeId())
            .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado"));
        
        // Busca quarto
        Quarto quarto = quartoRepository.findById(dto.getQuartoId())
            .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));
        
        // Verifica se o quarto está disponível
        if (!quarto.getDisponivel()) {
            throw new BusinessException("Quarto não está disponível para reserva");
        }
        
        // Verifica se já existe reserva ativa para este quarto
        if (reservaRepository.existsReservaAtivaByQuartoId(quarto.getId())) {
            throw new BusinessException("Já existe uma reserva ativa para este quarto");
        }
        
        // Cria a reserva
        Reserva reserva = new Reserva();
        reserva.setHospede(hospede);
        reserva.setQuarto(quarto);
        reserva.setDataCheckIn(dto.getDataCheckIn());
        reserva.setDataCheckOut(dto.getDataCheckOut());
        reserva.setStatus(StatusReserva.ATIVA);
        
        // Salva a reserva
        Reserva saved = reservaRepository.save(reserva);
        
        // Atualiza a disponibilidade do quarto
        quartoService.atualizarDisponibilidade(quarto.getId(), false);
        
        return convertToDTO(saved);
    }
    
    /**
     * Lista todas as reservas
     */
    @Transactional(readOnly = true)
    public List<ReservaDTO> listarTodas() {
        return reservaRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Lista apenas reservas ativas
     */
    @Transactional(readOnly = true)
    public List<ReservaDTO> listarAtivas() {
        return reservaRepository.findByStatus(StatusReserva.ATIVA)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Busca uma reserva por ID
     */
    @Transactional(readOnly = true)
    public ReservaDTO buscarPorId(UUID id) {
        Reserva reserva = reservaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));
        return convertToDTO(reserva);
    }
    
    /**
     * Atualiza uma reserva existente
     */
    @Transactional
    public ReservaDTO atualizar(UUID id, ReservaDTO dto) {
        Reserva reserva = reservaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));
        
        // Valida datas
        validarDatas(dto.getDataCheckIn(), dto.getDataCheckOut());
        
        // Atualiza apenas as datas
        reserva.setDataCheckIn(dto.getDataCheckIn());
        reserva.setDataCheckOut(dto.getDataCheckOut());
        
        Reserva updated = reservaRepository.save(reserva);
        return convertToDTO(updated);
    }
    
    /**
     * Cancela uma reserva
     */
    @Transactional
    public void cancelar(UUID id) {
        Reserva reserva = reservaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));
        
        if (reserva.getStatus() != StatusReserva.ATIVA) {
            throw new BusinessException("Apenas reservas ativas podem ser canceladas");
        }
        
        // Atualiza o status da reserva
        reserva.setStatus(StatusReserva.CANCELADA);
        reservaRepository.save(reserva);
        
        // Libera o quarto
        quartoService.atualizarDisponibilidade(reserva.getQuarto().getId(), true);
    }
    
    /**
     * Valida se as datas são válidas
     */
    private void validarDatas(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new BusinessException("Datas de check-in e check-out são obrigatórias");
        }
        
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new BusinessException("Data de check-out deve ser posterior à data de check-in");
        }
        
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BusinessException("Data de check-in não pode ser no passado");
        }
    }
    
    /**
     * Converte Entity para DTO
     */
    private ReservaDTO convertToDTO(Reserva reserva) {
        ReservaDTO dto = new ReservaDTO();
        dto.setId(reserva.getId());
        dto.setHospedeId(reserva.getHospede().getId());
        dto.setQuartoId(reserva.getQuarto().getId());
        dto.setDataCheckIn(reserva.getDataCheckIn());
        dto.setDataCheckOut(reserva.getDataCheckOut());
        dto.setValorTotal(reserva.getValorTotal());
        dto.setStatus(reserva.getStatus());
        dto.setCriadoEm(reserva.getCriadoEm());
        dto.setAtualizadoEm(reserva.getAtualizadoEm());
        
        // Campos adicionais
        dto.setHospedeNome(reserva.getHospede().getNome() + " " + reserva.getHospede().getSobrenome());
        dto.setQuartoNumero(reserva.getQuarto().getNumero());
        
        return dto;
    }
}
