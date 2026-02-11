## Implementação em Java + Spring

A implementação utiliza **Spring Boot** com **JPA (Hibernate)** para persistência, seguindo uma arquitetura em camadas (**Controller, Service, Repository**). As classes de domínio são entidades JPA, promovendo *Single Responsibility* (cada classe gerencia seus dados).

**Princípios SOLID aplicados:** * **Dependency Inversion:** via injeção de dependências (ex.: `@Autowired`).

* **Open-Closed:** para enums extensíveis.
* **Liskov Substitution:** em heranças potenciais.

*Clean code* inclui nomes descritivos, validações em métodos e separação de responsabilidades (ex.: Service para lógica de negócio).

---

### Classes de Domínio (Entidades JPA)

```java
package com.hotel.model;

import javax.persistence.*;
import java.util.List;

// Enum para tipo de quarto, extensível sem modificar código (Open-Closed Principle).
enum TipoQuarto {
    BASICO, MODERNO, LUXO
}

// Enum para tipo de cama.
enum TipoCama {
    SOLTEIRO, KING, QUEEN
}

// Enum para disponibilidade.
enum Disponibilidade {
    OCUPADO, LIVRE, MANUTENCAO, LIMPEZA
}

// Entidade para cama, permitindo múltiplas por quarto (Single Responsibility: representa apenas cama).
@Entity
public class Cama {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    private TipoCama tipo;
    
    // Construtores, getters e setters omitidos para brevidade, mas presentes em implementação real.
}

// Classe Quarto: Entidade JPA com validação (Single Responsibility: gerencia dados de quarto).
@Entity
public class Quarto {
    @Id
    private int numero;
    
    private int capacidade;
    
    @Enumerated(EnumType.STRING)
    private TipoQuarto tipo;
    
    private double precoDiaria; // Mantido como "diária" conforme domínio; ajuste se necessário.
    
    private boolean frigobar;
    private boolean cafeIncluso;
    private boolean arCondicionado;
    private boolean tv;
    
    @OneToMany(cascade = CascadeType.ALL) // Suporte a múltiplas camas (relacionamento one-to-many).
    private List<Cama> camas;
    
    @Enumerated(EnumType.STRING)
    private Disponibilidade disponibilidade = Disponibilidade.LIVRE;
    
    // Método para validar dados (Liskov Substitution: pode ser sobrescrito em subclasses).
    public boolean validar() {
        return numero > 0 && capacidade > 0 && precoDiaria > 0 && camas != null && !camas.isEmpty();
    }
    
    // Método para atualizar disponibilidade, promovendo imutabilidade parcial via cópia.
    public Quarto atualizarDisponibilidade(Disponibilidade nova) {
        Quarto novo = new Quarto();
        // Copiar atributos (usando setters/getters reais).
        novo.setNumero(this.numero);
        novo.setDisponibilidade(nova);
        // Outros campos copiados...
        return novo;
    }
    
    // Construtores, getters e setters.
}

// Classe Hospede: Entidade simples com validação.
@Entity
public class Hospede {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String sobrenome;
    private String cpf;
    private String email;
    
    public boolean validar() {
        return nome != null && !nome.isEmpty() && cpf != null && cpf.matches("\\d{11}") && email != null && email.matches("[^@]+@[^@]+\\.[^@]+");
    }
    
    // Construtores, getters e setters.
}

// Classe Reserva: Entidade com regras de negócio (Dependency Inversion: valida via injeção se necessário).
@Entity
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Hospede hospede;
    
    @ManyToOne
    private Quarto quarto;
    
    private java.util.Date dataInicio;
    private java.util.Date dataFim;
    
    // Regra de negócio: Verifica disponibilidade.
    public boolean podeReservar() {
        return quarto.getDisponibilidade() == Disponibilidade.LIVRE;
    }
    
    // Método para confirmar, atualizando quarto (Single Responsibility).
    public Reserva confirmar() {
        if (!podeReservar()) throw new IllegalStateException("Quarto não disponível.");
        quarto = quarto.atualizarDisponibilidade(Disponibilidade.OCUPADO);
        return this;
    }
    
    // Construtores, getters e setters.
}

```

---

### Módulo de Gestão de Quartos (Spring MVC)

```java
package com.hotel.controller;

import com.hotel.model.*;
import com.hotel.service.QuartoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// Controller REST para gestão de quartos (Interface Segregation: apenas endpoints necessários).
@RestController
@RequestMapping("/quartos")
public class QuartoController {
    @Autowired
    private QuartoService quartoService; // Dependency Inversion via injeção.
    
    @PostMapping
    public Quarto cadastrar(@RequestBody Quarto quarto) {
        return quartoService.salvar(quarto);
    }
    
    @PutMapping("/{numero}")
    public Quarto editar(@PathVariable int numero, @RequestBody Quarto updates) {
        return quartoService.editar(numero, updates);
    }
    
    @GetMapping
    public List<Quarto> listar() {
        return quartoService.listar();
    }
}

package com.hotel.service;

import com.hotel.model.*;
import com.hotel.repository.QuartoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// Service para lógica de negócio (Single Responsibility: orquestra operações de quarto).
@Service
public class QuartoService {
    @Autowired
    private QuartoRepository repository;
    
    public Quarto salvar(Quarto quarto) {
        if (!quarto.validar()) throw new IllegalArgumentException("Dados inválidos.");
        return repository.save(quarto);
    }
    
    public Quarto editar(int numero, Quarto updates) {
        Quarto existente = repository.findById(numero).orElseThrow();
        // Aplicar updates (ex.: existente.setPrecoDiaria(updates.getPrecoDiaria());).
        return repository.save(existente);
    }
    
    public List<Quarto> listar() {
        return repository.findAll();
    }
}

package com.hotel.repository;

import com.hotel.model.Quarto;
import org.springframework.data.jpa.repository.JpaRepository;

// Repository JPA (Dependency Inversion: abstrai acesso a dados).
public interface QuartoRepository extends JpaRepository<Quarto, Integer> {}

```
