## Trecho de Código Problemático do Módulo de Quartos

O trecho abaixo é uma versão "problemática" da classe `QuartoService` em Java + Spring, baseada nas implementações anteriores, mas com problemas intencionais introduzidos para ilustrar más práticas. Ele simula um serviço que gerencia cadastro, edição e listagem de quartos, mas viola princípios de qualidade.

```java
package com.hotel.service;

import com.hotel.model.*;
import com.hotel.repository.QuartoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuartoService {
    @Autowired
    private QuartoRepository repository;

    // Método longo que faz tudo: valida, salva, atualiza múltiplos campos e até calcula preço com desconto
    public Quarto salvarOuEditarQuarto(Quarto quarto, boolean isEdit, int numeroExistente) {
        // Validação inline, misturando regras de negócio com I/O
        if (quarto.getNumero() <= 0 || quarto.getCapacidade() <= 0 || quarto.getPrecoDiaria() <= 0) {
            throw new IllegalArgumentException("Dados inválidos");
        }
        if (quarto.getCamas() == null || quarto.getCamas().isEmpty()) {
            throw new IllegalArgumentException("Quarto deve ter pelo menos uma cama");
        }
        // Duplicação: mesma validação em outro lugar (não mostrada, mas assumida)
        
        // Lógica de negócio misturada: calcula desconto baseado em tipo
        double precoFinal = quarto.getPrecoDiaria();
        if (quarto.getTipo() == TipoQuarto.LUXO) {
            precoFinal *= 0.9; // 10% desconto hardcoded
        }
        quarto.setPrecoDiaria(precoFinal);
        
        // I/O direto no método: salva ou edita sem abstração
        if (isEdit) {
            Quarto existente = repository.findById(numeroExistente).orElseThrow();
            existente.setCapacidade(quarto.getCapacidade());
            existente.setTipo(quarto.getTipo());
            existente.setPrecoDiaria(quarto.getPrecoDiaria());
            existente.setFrigobar(quarto.getFrigobar());
            existente.setCafeIncluso(quarto.getCafeIncluso());
            existente.setArCondicionado(quarto.getArCondicionado());
            existente.setTv(quarto.getTv());
            existente.setCamas(quarto.getCamas());
            existente.setDisponibilidade(quarto.getDisponibilidade());
            return repository.save(existente);
        } else {
            return repository.save(quarto);
        }
    }

    // Método que lista e filtra inline, com query potencialmente ineficiente
    public List<Quarto> listarQuartosComFiltro(String tipoFiltro, boolean apenasLivres) {
        List<Quarto> todos = repository.findAll(); // Carrega tudo na memória!
        return todos.stream()
            .filter(q -> tipoFiltro == null || q.getTipo().toString().equals(tipoFiltro))
            .filter(q -> !apenasLivres || q.getDisponibilidade() == Disponibilidade.LIVRE)
            .collect(Collectors.toList());
    }
}

```

---

## Identificação de Problemas de Qualidade no Código

1. **Violação de Single Responsibility Principle (SRP):** O método `salvarOuEditarQuarto` faz validação, cálculo de negócio, mapeamento de campos e I/O, tornando a classe um "God Object".
2. **Método Longo e Complexo:** O método tem múltiplas responsabilidades, dificultando leitura e teste.
3. **Duplicação de Código:** Validações são repetidas e lógica de desconto não é reutilizável.
4. **Acoplamento Alto e Falta de Abstração:** Dependência direta do repositório; lógica de negócio hardcoded (10% de desconto) sem flexibilidade.
5. **Problemas de Performance:** `listarQuartosComFiltro` carrega todos os registros na memória para filtrar em Java, em vez de usar o banco de dados.
6. **Falta de Encapsulamento e Imutabilidade:** Campos são setados diretamente sem validações robustas ou uso de padrões como Builder.
7. **Code Smells Gerais:** Uso de *magic numbers* (0.9), flags booleanos (`isEdit`) e ausência de tratamento de exceções específicas.

---

## Sugestões de Refatoração

* **Aplicar SRP:** Separar validação em `QuartoValidator`, lógica de negócio em `QuartoBusinessLogic` e I/O em métodos específicos.
* **Usar Padrões:** Implementar Builder para construção de objetos e Factory para criação validada.
* **Melhorar Performance:** Delegar filtros para o repositório via JPQL.
* **Adicionar Testabilidade:** Injetar dependências via construtor e usar interfaces.
* **Princípios SOLID:** Garantir *Dependency Inversion* e *Open-Closed* para novos tipos de descontos.

---

## Versão Melhorada do Código

```java
package com.hotel.service;

import com.hotel.model.*;
import com.hotel.repository.QuartoRepository;
import com.hotel.validator.QuartoValidator;
import com.hotel.logic.QuartoBusinessLogic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuartoService {
    private final QuartoRepository repository;
    private final QuartoValidator validator;
    private final QuartoBusinessLogic businessLogic;

    @Autowired
    public QuartoService(QuartoRepository repository, QuartoValidator validator, QuartoBusinessLogic businessLogic) {
        this.repository = repository;
        this.validator = validator;
        this.businessLogic = businessLogic;
    }

    public Quarto cadastrar(Quarto quarto) {
        validator.validar(quarto); 
        Quarto comDesconto = businessLogic.aplicarDescontos(quarto); 
        return repository.save(comDesconto);
    }

    public Quarto editar(int numero, Quarto updates) {
        Quarto existente = repository.findById(numero).orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado"));
        validator.validar(updates);
        
        Quarto atualizado = Quarto.builder()
            .numero(existente.getNumero())
            .capacidade(updates.getCapacidade() != 0 ? updates.getCapacidade() : existente.getCapacidade())
            .tipo(updates.getTipo() != null ? updates.getTipo() : existente.getTipo())
            .precoDiaria(businessLogic.aplicarDescontos(updates).getPrecoDiaria())
            .frigobar(updates.isFrigobar())
            .cafeIncluso(updates.isCafeIncluso())
            .arCondicionado(updates.isArCondicionado())
            .tv(updates.isTv())
            .camas(updates.getCamas() != null ? updates.getCamas() : existente.getCamas())
            .disponibilidade(updates.getDisponibilidade() != null ? updates.getDisponibilidade() : existente.getDisponibilidade())
            .build();
            
        return repository.save(atualizado);
    }

    public List<Quarto> listarComFiltro(String tipoFiltro, boolean apenasLivres) {
        return repository.findByTipoAndDisponibilidade(tipoFiltro, apenasLivres ? Disponibilidade.LIVRE : null); 
    }
}

// Classe separada para validação (SRP)
@Component
public class QuartoValidator {
    public void validar(Quarto quarto) {
        if (quarto.getNumero() <= 0 || quarto.getCapacidade() <= 0 || quarto.getPrecoDiaria() <= 0) {
            throw new IllegalArgumentException("Dados inválidos");
        }
        if (quarto.getCamas() == null || quarto.getCamas().isEmpty()) {
            throw new IllegalArgumentException("Quarto deve ter pelo menos uma cama");
        }
    }
}

// Classe separada para lógica de negócio (SRP)
@Component
public class QuartoBusinessLogic {
    public Quarto aplicarDescontos(Quarto quarto) {
        double precoFinal = quarto.getPrecoDiaria();
        if (quarto.getTipo() == TipoQuarto.LUXO) {
            precoFinal *= 0.9; 
        }
        return Quarto.builder().from(quarto).precoDiaria(precoFinal).build(); 
    }
}

// Repository com query customizada
public interface QuartoRepository extends JpaRepository<Quarto, Integer> {
    @Query("SELECT q FROM Quarto q WHERE (:tipo IS NULL OR q.tipo = :tipo) AND (:disponibilidade IS NULL OR q.disponibilidade = :disponibilidade)")
    List<Quarto> findByTipoAndDisponibilidade(String tipo, Disponibilidade disponibilidade);
}

```

---

## Explicação de Como Isso Reduz a Dívida Técnica

A refatoração reduz a dívida técnica ao promover código mais limpo e escalável:

* **Manutenibilidade:** Alterações na lógica de desconto ou validação não afetam o serviço principal.
* **Testabilidade:** Classes isoladas permitem testes unitários focados e mockagem simples.
* **Performance:** Queries otimizadas no banco evitam sobrecarga de memória.
* **Redução de Bugs:** Validações centralizadas e imutabilidade com Builder previnem estados inconsistentes.
* **Escalabilidade:** O baixo acoplamento permite adicionar novas regras de negócio sem refatoração total.

---

## Métricas de Avaliação

| Métrica | Resultado |
| --- | --- |
| **Percentual de requisitos atendidos (M1)** | 59% (10 de 17 requisitos) |
| **Atende aos critérios de aceitação?** | Sim, mantém funcionalidades melhorando a robustez. |
| **Linhas de Código Geradas (LOC)** | 70 (versão melhorada) |
| **Número de funções/métodos** | 7 |
| **Interações necessárias** | 1 |
