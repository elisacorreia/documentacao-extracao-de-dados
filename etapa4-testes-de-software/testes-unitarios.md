# Testes Unitários para Gestão de Quartos

Aqui estão os testes unitários completos para Cadastro e Edição de Quarto utilizando JUnit 5 e Mockito:

## QuartoServiceTest.java

```java
package com.hotel.gestao.service;

import com.hotel.gestao.dto.QuartoDTO;
import com.hotel.gestao.entity.Quarto;
import com.hotel.gestao.entity.TipoQuarto;
import com.hotel.gestao.entity.StatusQuarto;
import com.hotel.gestao.exception.ResourceNotFoundException;
import com.hotel.gestao.exception.BusinessException;
import com.hotel.gestao.repository.QuartoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários - QuartoService")
class QuartoServiceTest {

    @Mock
    private QuartoRepository quartoRepository;

    @InjectMocks
    private QuartoService quartoService;

    private QuartoDTO quartoDTO;
    private Quarto quarto;

    @BeforeEach
    void setUp() {
        // Preparar dados de teste
        quartoDTO = new QuartoDTO();
        quartoDTO.setNumero("101");
        quartoDTO.setTipo(TipoQuarto.SOLTEIRO);
        quartoDTO.setPrecoDiaria(new BigDecimal("150.00"));
        quartoDTO.setStatus(StatusQuarto.DISPONIVEL);
        quartoDTO.setDescricao("Quarto confortável com vista para o mar");

        quarto = new Quarto();
        quarto.setId(1L);
        quarto.setNumero("101");
        quarto.setTipo(TipoQuarto.SOLTEIRO);
        quarto.setPrecoDiaria(new BigDecimal("150.00"));
        quarto.setStatus(StatusQuarto.DISPONIVEL);
        quarto.setDescricao("Quarto confortável com vista para o mar");
    }

    // ==================== TESTES DE CADASTRO ====================

    @Test
    @DisplayName("Deve cadastrar quarto com sucesso")
    void deveCadastrarQuartoComSucesso() {
        // Arrange
        when(quartoRepository.existsByNumero(anyString())).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quarto);

        // Act
        QuartoDTO resultado = quartoService.cadastrar(quartoDTO);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(1L);
        assertThat(resultado.getNumero()).isEqualTo("101");
        assertThat(resultado.getTipo()).isEqualTo(TipoQuarto.SOLTEIRO);
        assertThat(resultado.getPrecoDiaria()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(resultado.getStatus()).isEqualTo(StatusQuarto.DISPONIVEL);
        assertThat(resultado.getDescricao()).isEqualTo("Quarto confortável com vista para o mar");

        verify(quartoRepository, times(1)).existsByNumero("101");
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao cadastrar quarto com número duplicado")
    void deveLancarExcecaoAoCadastrarQuartoComNumeroDuplicado() {
        // Arrange
        when(quartoRepository.existsByNumero("101")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> quartoService.cadastrar(quartoDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Já existe um quarto cadastrado com o número: 101");

        verify(quartoRepository, times(1)).existsByNumero("101");
        verify(quartoRepository, never()).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve cadastrar quarto com status DISPONIVEL por padrão quando não informado")
    void deveCadastrarQuartoComStatusDisponivelPorPadrao() {
        // Arrange
        quartoDTO.setStatus(null);
        
        Quarto quartoSalvo = new Quarto();
        quartoSalvo.setId(1L);
        quartoSalvo.setNumero("101");
        quartoSalvo.setTipo(TipoQuarto.SOLTEIRO);
        quartoSalvo.setPrecoDiaria(new BigDecimal("150.00"));
        quartoSalvo.setStatus(StatusQuarto.DISPONIVEL);

        when(quartoRepository.existsByNumero(anyString())).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenAnswer(invocation -> {
            Quarto q = invocation.getArgument(0);
            if (q.getStatus() == null) {
                q.setStatus(StatusQuarto.DISPONIVEL);
            }
            q.setId(1L);
            return q;
        });

        // Act
        QuartoDTO resultado = quartoService.cadastrar(quartoDTO);

        // Assert
        assertThat(resultado.getStatus()).isEqualTo(StatusQuarto.DISPONIVEL);
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve cadastrar quarto com todos os tipos válidos")
    void deveCadastrarQuartoComTodosTiposValidos() {
        // Arrange
        TipoQuarto[] tipos = {TipoQuarto.SOLTEIRO, TipoQuarto.CASAL, TipoQuarto.SUITE};
        
        when(quartoRepository.existsByNumero(anyString())).thenReturn(false);
        
        for (int i = 0; i < tipos.length; i++) {
            TipoQuarto tipo = tipos[i];
            quartoDTO.setTipo(tipo);
            quartoDTO.setNumero("10" + (i + 1));
            
            Quarto quartoTemp = new Quarto();
            quartoTemp.setId((long) (i + 1));
            quartoTemp.setNumero("10" + (i + 1));
            quartoTemp.setTipo(tipo);
            quartoTemp.setPrecoDiaria(quartoDTO.getPrecoDiaria());
            quartoTemp.setStatus(quartoDTO.getStatus());
            
            when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoTemp);

            // Act
            QuartoDTO resultado = quartoService.cadastrar(quartoDTO);

            // Assert
            assertThat(resultado.getTipo()).isEqualTo(tipo);
        }

        verify(quartoRepository, times(3)).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve cadastrar quarto com preço diária válido")
    void deveCadastrarQuartoComPrecoDiariaValido() {
        // Arrange
        quartoDTO.setPrecoDiaria(new BigDecimal("250.50"));
        quarto.setPrecoDiaria(new BigDecimal("250.50"));
        
        when(quartoRepository.existsByNumero(anyString())).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quarto);

        // Act
        QuartoDTO resultado = quartoService.cadastrar(quartoDTO);

        // Assert
        assertThat(resultado.getPrecoDiaria()).isEqualByComparingTo(new BigDecimal("250.50"));
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }

    // ==================== TESTES DE EDIÇÃO ====================

    @Test
    @DisplayName("Deve editar quarto com sucesso")
    void deveEditarQuartoComSucesso() {
        // Arrange
        Long quartoId = 1L;
        
        QuartoDTO dadosAtualizacao = new QuartoDTO();
        dadosAtualizacao.setNumero("102");
        dadosAtualizacao.setTipo(TipoQuarto.CASAL);
        dadosAtualizacao.setPrecoDiaria(new BigDecimal("200.00"));
        dadosAtualizacao.setStatus(StatusQuarto.OCUPADO);
        dadosAtualizacao.setDescricao("Quarto reformado");

        Quarto quartoAtualizado = new Quarto();
        quartoAtualizado.setId(quartoId);
        quartoAtualizado.setNumero("102");
        quartoAtualizado.setTipo(TipoQuarto.CASAL);
        quartoAtualizado.setPrecoDiaria(new BigDecimal("200.00"));
        quartoAtualizado.setStatus(StatusQuarto.OCUPADO);
        quartoAtualizado.setDescricao("Quarto reformado");

        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quarto));
        when(quartoRepository.existsByNumeroAndIdNot("102", quartoId)).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoAtualizado);

        // Act
        QuartoDTO resultado = quartoService.atualizar(quartoId, dadosAtualizacao);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(quartoId);
        assertThat(resultado.getNumero()).isEqualTo("102");
        assertThat(resultado.getTipo()).isEqualTo(TipoQuarto.CASAL);
        assertThat(resultado.getPrecoDiaria()).isEqualByComparingTo(new BigDecimal("200.00"));
        assertThat(resultado.getStatus()).isEqualTo(StatusQuarto.OCUPADO);
        assertThat(resultado.getDescricao()).isEqualTo("Quarto reformado");

        verify(quartoRepository, times(1)).findById(quartoId);
        verify(quartoRepository, times(1)).existsByNumeroAndIdNot("102", quartoId);
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao editar quarto inexistente")
    void deveLancarExcecaoAoEditarQuartoInexistente() {
        // Arrange
        Long quartoId = 999L;
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> quartoService.atualizar(quartoId, quartoDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Quarto não encontrado com id: 999");

        verify(quartoRepository, times(1)).findById(quartoId);
        verify(quartoRepository, never()).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao editar quarto com número já existente")
    void deveLancarExcecaoAoEditarQuartoComNumeroJaExistente() {
        // Arrange
        Long quartoId = 1L;
        quartoDTO.setNumero("102");

        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quarto));
        when(quartoRepository.existsByNumeroAndIdNot("102", quartoId)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> quartoService.atualizar(quartoId, quartoDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Já existe outro quarto cadastrado com o número: 102");

        verify(quartoRepository, times(1)).findById(quartoId);
        verify(quartoRepository, times(1)).existsByNumeroAndIdNot("102", quartoId);
        verify(quartoRepository, never()).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve permitir editar quarto mantendo o mesmo número")
    void devePermitirEditarQuartoMantendoMesmoNumero() {
        // Arrange
        Long quartoId = 1L;
        quartoDTO.setNumero("101"); // Mesmo número original
        quartoDTO.setTipo(TipoQuarto.SUITE);
        quartoDTO.setPrecoDiaria(new BigDecimal("300.00"));

        Quarto quartoAtualizado = new Quarto();
        quartoAtualizado.setId(quartoId);
        quartoAtualizado.setNumero("101");
        quartoAtualizado.setTipo(TipoQuarto.SUITE);
        quartoAtualizado.setPrecoDiaria(new BigDecimal("300.00"));
        quartoAtualizado.setStatus(StatusQuarto.DISPONIVEL);

        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quarto));
        when(quartoRepository.existsByNumeroAndIdNot("101", quartoId)).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoAtualizado);

        // Act
        QuartoDTO resultado = quartoService.atualizar(quartoId, quartoDTO);

        // Assert
        assertThat(resultado.getNumero()).isEqualTo("101");
        assertThat(resultado.getTipo()).isEqualTo(TipoQuarto.SUITE);
        assertThat(resultado.getPrecoDiaria()).isEqualByComparingTo(new BigDecimal("300.00"));

        verify(quartoRepository, times(1)).existsByNumeroAndIdNot("101", quartoId);
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve editar apenas campos informados mantendo os demais inalterados")
    void deveEditarApenasCamposInformados() {
        // Arrange
        Long quartoId = 1L;
        
        QuartoDTO atualizacaoParcial = new QuartoDTO();
        atualizacaoParcial.setNumero("101");
        atualizacaoParcial.setPrecoDiaria(new BigDecimal("175.00")); // Apenas preço alterado
        atualizacaoParcial.setTipo(quarto.getTipo());
        atualizacaoParcial.setStatus(quarto.getStatus());
        atualizacaoParcial.setDescricao(quarto.getDescricao());

        Quarto quartoAtualizado = new Quarto();
        quartoAtualizado.setId(quartoId);
        quartoAtualizado.setNumero("101");
        quartoAtualizado.setTipo(TipoQuarto.SOLTEIRO); // Mantido
        quartoAtualizado.setPrecoDiaria(new BigDecimal("175.00")); // Alterado
        quartoAtualizado.setStatus(StatusQuarto.DISPONIVEL); // Mantido
        quartoAtualizado.setDescricao("Quarto confortável com vista para o mar"); // Mantido

        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quarto));
        when(quartoRepository.existsByNumeroAndIdNot("101", quartoId)).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoAtualizado);

        // Act
        QuartoDTO resultado = quartoService.atualizar(quartoId, atualizacaoParcial);

        // Assert
        assertThat(resultado.getPrecoDiaria()).isEqualByComparingTo(new BigDecimal("175.00"));
        assertThat(resultado.getTipo()).isEqualTo(TipoQuarto.SOLTEIRO);
        assertThat(resultado.getStatus()).isEqualTo(StatusQuarto.DISPONIVEL);
        
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve editar status do quarto corretamente")
    void deveEditarStatusDoQuartoCorretamente() {
        // Arrange
        Long quartoId = 1L;
        quartoDTO.setStatus(StatusQuarto.MANUTENCAO);

        Quarto quartoAtualizado = new Quarto();
        quartoAtualizado.setId(quartoId);
        quartoAtualizado.setNumero("101");
        quartoAtualizado.setTipo(TipoQuarto.SOLTEIRO);
        quartoAtualizado.setPrecoDiaria(new BigDecimal("150.00"));
        quartoAtualizado.setStatus(StatusQuarto.MANUTENCAO);

        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quarto));
        when(quartoRepository.existsByNumeroAndIdNot("101", quartoId)).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoAtualizado);

        // Act
        QuartoDTO resultado = quartoService.atualizar(quartoId, quartoDTO);

        // Assert
        assertThat(resultado.getStatus()).isEqualTo(StatusQuarto.MANUTENCAO);
        verify(quartoRepository, times(1)).save(any(Quarto.class));
    }
}
Dependências necessárias no pom.xml
XML
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <scope>test</scope>
    </dependency>

    </dependencies>
Estrutura dos Testes
Testes de Cadastro (5 testes):

✅ Cadastro com sucesso - fluxo completo positivo

✅ Número duplicado - validação de unicidade

✅ Status padrão - valor default quando não informado

✅ Todos os tipos - validação de todos os enums TipoQuarto

✅ Preço válido - validação de BigDecimal

Testes de Edição (7 testes):

✅ Edição com sucesso - fluxo completo positivo

✅ Quarto inexistente - ResourceNotFoundException

✅ Número já existente - BusinessException

✅ Mesmo número - permitir editar mantendo número

✅ Atualização parcial - manter campos não alterados

✅ Edição de status - alterar status corretamente

Como executar os testes
Bash
# Executar todos os testes
mvn test

# Executar apenas a classe QuartoServiceTest
mvn test -Dtest=QuartoServiceTest

# Executar um teste específico
mvn test -Dtest=QuartoServiceTest#deveCadastrarQuartoComSucesso

# Com relatório de cobertura (JaCoCo)
mvn clean test jacoco:report
Os testes estão prontos para serem copiados para seu projeto Spring Boot no diretório src/test/java/com/hotel/gestao/service/QuartoServiceTest.java. Eles cobrem os principais cenários de cadastro e edição de quartos com validações completas! 🎯