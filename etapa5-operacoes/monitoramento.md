Estratégia de Observabilidade - Sistema de Gestão Hotelaria
1. Arquitetura de Monitoramento
┌─────────────────────────────────────────────────────────────────────┐
│                    PILARES DE OBSERVABILIDADE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. MÉTRICAS (Prometheus + Micrometer)                              │
│     └─► Disponibilidade, Latência, Taxa de Erro, Saturação         │
│                                                                      │
│  2. LOGS (ELK Stack / Loki)                                         │
│     └─► Eventos de aplicação, Erros, Auditoria                     │
│                                                                      │
│  3. TRACES (Jaeger / Zipkin)                                        │
│     └─► Distributed Tracing, Análise de performance                │
│                                                                      │
│  4. DASHBOARDS (Grafana)                                            │
│     └─► Visualização unificada                                     │
│                                                                      │
│  5. ALERTAS (AlertManager + PagerDuty)                              │
│     └─► Notificações proativas                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
2. Golden Signals (SRE Google)
2.1 Latência (Latency)
Configuração Spring Boot
application.properties

# Métricas de latência
management.metrics.enable.http.server.requests=true
management.metrics.distribution.percentiles-histogram.http.server.requests=true
management.metrics.distribution.sla.http.server.requests=50ms,100ms,200ms,500ms,1s,2s
Métricas a Coletar
Métrica	Descrição	SLO	Alert
http_server_requests_seconds	Latência de requisições HTTP	P95 < 500ms	P95 > 1s
http_server_requests_seconds_bucket	Histogram de latência	P99 < 1s	P99 > 2s
database_query_duration_seconds	Tempo de queries SQL	P95 < 100ms	P95 > 500ms
reserva_creation_duration_seconds	Tempo de criar reserva	P95 < 300ms	P95 > 1s
Query Prometheus
# P95 latência por endpoint
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
)

# Latência média últimos 5 minutos
rate(http_server_requests_seconds_sum[5m]) / 
rate(http_server_requests_seconds_count[5m])

# Requisições lentas (> 1s)
sum(rate(http_server_requests_seconds_bucket{le="1"}[5m])) by (uri)
2.2 Tráfego (Traffic)
Métricas a Coletar
Métrica	Descrição	Uso
http_server_requests_total	Total de requisições	Taxa de requisições/seg
reservas_created_total	Reservas criadas	Métrica de negócio
hospedes_created_total	Hóspedes cadastrados	Métrica de negócio
quartos_occupied_total	Quartos ocupados	Taxa de ocupação
Query Prometheus
# Requisições por segundo
rate(http_server_requests_total[1m])

# Top 5 endpoints mais acessados
topk(5, sum(rate(http_server_requests_total[5m])) by (uri))

# Reservas criadas por hora
increase(reservas_created_total[1h])

# Taxa de ocupação (%)
(quartos_occupied_total / quartos_total) * 100
2.3 Erros (Errors)
Métricas a Coletar
Métrica	Descrição	SLO	Alert
http_server_requests_total{status="5xx"}	Erros de servidor	< 0.1%	> 1%
http_server_requests_total{status="4xx"}	Erros de cliente	< 5%	> 10%
reserva_conflict_total	Conflitos de reserva	< 2%	> 5%
database_connection_errors_total	Erros de conexão DB	0	> 0
circuit_breaker_opened_total	Circuit breaker aberto	0	> 0
Query Prometheus
# Taxa de erro (%)
(
  sum(rate(http_server_requests_total{status=~"5.."}[5m])) 
  / 
  sum(rate(http_server_requests_total[5m]))
) * 100

# Erros por endpoint
sum(rate(http_server_requests_total{status=~"5.."}[5m])) by (uri, status)

# Top 5 erros mais frequentes
topk(5, sum(rate(application_exceptions_total[5m])) by (exception))
2.4 Saturação (Saturation)
Métricas a Coletar
Métrica	Descrição	Threshold	Alert
jvm_memory_used_bytes	Memória JVM usada	< 80%	> 90%
jvm_threads_live_threads	Threads ativas	< 200	> 500
system_cpu_usage	CPU do sistema	< 70%	> 85%
hikaricp_connections_active	Conexões DB ativas	< 80%	> 90%
disk_free_bytes	Espaço em disco livre	> 10GB	< 5GB
Query Prometheus
# Uso de memória JVM (%)
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100

# Pool de conexões saturado (%)
(hikaricp_connections_active / hikaricp_connections_max) * 100

# CPU usage
rate(process_cpu_seconds_total[1m]) * 100

# Previsão de saturação (linear regression)
predict_linear(jvm_memory_used_bytes[1h], 3600) > jvm_memory_max_bytes
3. Implementação - Spring Boot
3.1 Dependências Maven
pom.xml

<dependencies>
    <!-- Spring Boot Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Micrometer Prometheus -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>

    <!-- Distributed Tracing -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-tracing-bridge-brave</artifactId>
    </dependency>
    <dependency>
        <groupId>io.zipkin.reporter2</groupId>
        <artifactId>zipkin-reporter-brave</artifactId>
    </dependency>

    <!-- Structured Logging -->
    <dependency>
        <groupId>net.logstash.logback</groupId>
        <artifactId>logstash-logback-encoder</artifactId>
        <version>7.4</version>
    </dependency>
</dependencies>
3.2 Configuração de Métricas
application.yml

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,loggers
      base-path: /actuator
  
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
    metrics:
      enabled: true
  
  metrics:
    enable:
      jvm: true
      system: true
      http: true
      logback: true
      jdbc: true
      hikaricp: true
    
    distribution:
      percentiles-histogram:
        http.server.requests: true
      
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
      
      sla:
        http.server.requests: 50ms, 100ms, 200ms, 500ms, 1s, 2s
    
    tags:
      application: ${spring.application.name}
      environment: ${ENVIRONMENT:dev}
      region: ${AWS_REGION:us-east-1}
  
  tracing:
    sampling:
      probability: 1.0  # 100% em dev, 0.1 em prod

spring:
  application:
    name: hotel-gestao

logging:
  level:
    com.hotel.gestao: INFO
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
3.3 Métricas Customizadas
MetricsConfig.java

package com.hotel.gestao.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    // ==================== CONTADORES ====================
    
    @Bean
    public Counter reservasCriadasCounter(MeterRegistry registry) {
        return Counter.builder("reservas.created.total")
                .description("Total de reservas criadas")
                .tag("type", "business")
                .register(registry);
    }

    @Bean
    public Counter reservasCanceladasCounter(MeterRegistry registry) {
        return Counter.builder("reservas.cancelled.total")
                .description("Total de reservas canceladas")
                .tag("type", "business")
                .register(registry);
    }

    @Bean
    public Counter reservasConflictCounter(MeterRegistry registry) {
        return Counter.builder("reservas.conflict.total")
                .description("Tentativas de reserva em quarto ocupado")
                .tag("type", "error")
                .register(registry);
    }

    @Bean
    public Counter hospedesCadastradosCounter(MeterRegistry registry) {
        return Counter.builder("hospedes.created.total")
                .description("Total de hóspedes cadastrados")
                .tag("type", "business")
                .register(registry);
    }

    @Bean
    public Counter cpfDuplicadoCounter(MeterRegistry registry) {
        return Counter.builder("hospedes.cpf.duplicate.total")
                .description("Tentativas de cadastro com CPF duplicado")
                .tag("type", "validation_error")
                .register(registry);
    }

    // ==================== TIMERS ====================
    
    @Bean
    public Timer reservaCreationTimer(MeterRegistry registry) {
        return Timer.builder("reserva.creation.duration")
                .description("Tempo para criar uma reserva")
                .tag("type", "performance")
                .publishPercentiles(0.5, 0.95, 0.99)
                .publishPercentileHistogram()
                .register(registry);
    }

    @Bean
    public Timer databaseQueryTimer(MeterRegistry registry) {
        return Timer.builder("database.query.duration")
                .description("Tempo de execução de queries")
                .tag("type", "performance")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(registry);
    }

    // ==================== GAUGES ====================
    
    @Bean
    public io.micrometer.core.instrument.Gauge quartosDisponiveisGauge(
            MeterRegistry registry, 
            QuartoRepository quartoRepository) {
        
        return io.micrometer.core.instrument.Gauge
                .builder("quartos.disponiveis", quartoRepository, repo -> 
                    repo.countByStatus(StatusQuarto.DISPONIVEL))
                .description("Número de quartos disponíveis")
                .tag("type", "business")
                .register(registry);
    }

    @Bean
    public io.micrometer.core.instrument.Gauge quartosOcupadosGauge(
            MeterRegistry registry, 
            QuartoRepository quartoRepository) {
        
        return io.micrometer.core.instrument.Gauge
                .builder("quartos.ocupados", quartoRepository, repo -> 
                    repo.countByStatus(StatusQuarto.OCUPADO))
                .description("Número de quartos ocupados")
                .tag("type", "business")
                .register(registry);
    }

    @Bean
    public io.micrometer.core.instrument.Gauge taxaOcupacaoGauge(
            MeterRegistry registry, 
            QuartoRepository quartoRepository) {
        
        return io.micrometer.core.instrument.Gauge
                .builder("quartos.taxa_ocupacao", quartoRepository, repo -> {
                    long total = repo.count();
                    if (total == 0) return 0.0;
                    long ocupados = repo.countByStatus(StatusQuarto.OCUPADO);
                    return (ocupados * 100.0) / total;
                })
                .description("Taxa de ocupação dos quartos (%)")
                .tag("type", "business")
                .register(registry);
    }
}
3.4 Instrumentação no Service
ReservaService.java

package com.hotel.gestao.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final QuartoRepository quartoRepository;
    private final HospedeRepository hospedeRepository;
    
    // Métricas injetadas
    private final Counter reservasCriadasCounter;
    private final Counter reservasConflictCounter;
    private final Timer reservaCreationTimer;

    @Transactional
    public ReservaDTO criar(ReservaDTO dto) {
        // Medir tempo de execução
        return reservaCreationTimer.record(() -> {
            
            log.info("Iniciando criação de reserva - HospedeId: {}, QuartoId: {}", 
                    dto.getHospedeId(), dto.getQuartoId());
            
            try {
                // Validar hóspede
                Hospede hospede = hospedeRepository.findById(dto.getHospedeId())
                        .orElseThrow(() -> {
                            log.error("Hóspede não encontrado: {}", dto.getHospedeId());
                            return new ResourceNotFoundException(
                                "Hóspede não encontrado com id: " + dto.getHospedeId());
                        });

                // Validar quarto
                Quarto quarto = quartoRepository.findById(dto.getQuartoId())
                        .orElseThrow(() -> {
                            log.error("Quarto não encontrado: {}", dto.getQuartoId());
                            return new ResourceNotFoundException(
                                "Quarto não encontrado com id: " + dto.getQuartoId());
                        });

                // Validar disponibilidade
                if (quarto.getStatus() != StatusQuarto.DISPONIVEL) {
                    log.warn("Tentativa de reserva em quarto não disponível - QuartoId: {}, Status: {}", 
                            quarto.getId(), quarto.getStatus());
                    
                    // Incrementar contador de conflitos
                    reservasConflictCounter.increment();
                    
                    throw new BusinessException(
                        "Quarto não está disponível para reserva. Status: " + quarto.getStatus());
                }

                // Validar datas
                if (dto.getDataSaida().isBefore(dto.getDataEntrada()) || 
                    dto.getDataSaida().isEqual(dto.getDataEntrada())) {
                    log.error("Datas inválidas - Entrada: {}, Saída: {}", 
                            dto.getDataEntrada(), dto.getDataSaida());
                    throw new BusinessException(
                        "Data de saída deve ser posterior à data de entrada");
                }

                // Calcular valor
                long dias = ChronoUnit.DAYS.between(dto.getDataEntrada(), dto.getDataSaida());
                BigDecimal valorTotal = quarto.getPrecoDiaria().multiply(BigDecimal.valueOf(dias));

                // Criar reserva
                Reserva reserva = new Reserva();
                reserva.setHospede(hospede);
                reserva.setQuarto(quarto);
                reserva.setDataEntrada(dto.getDataEntrada());
                reserva.setDataSaida(dto.getDataSaida());
                reserva.setValorTotal(valorTotal);
                reserva.setStatus(StatusReserva.CONFIRMADA);

                reserva = reservaRepository.save(reserva);

                // Atualizar status do quarto
                quarto.setStatus(StatusQuarto.OCUPADO);
                quartoRepository.save(quarto);

                log.info("Reserva criada com sucesso - ReservaId: {}, Valor: {}", 
                        reserva.getId(), valorTotal);

                // Incrementar contador de sucesso
                reservasCriadasCounter.increment();

                return mapToDTO(reserva);
                
            } catch (Exception e) {
                log.error("Erro ao criar reserva", e);
                throw e;
            }
        });
    }

    @Transactional
    public void cancelar(Long id) {
        log.info("Iniciando cancelamento de reserva - ReservaId: {}", id);
        
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Reserva não encontrada com id: " + id));

        reserva.setStatus(StatusReserva.CANCELADA);
        
        // Liberar quarto
        Quarto quarto = reserva.getQuarto();
        quarto.setStatus(StatusQuarto.DISPONIVEL);
        quartoRepository.save(quarto);
        
        reservaRepository.save(reserva);

        log.info("Reserva cancelada com sucesso - ReservaId: {}", id);
        reservasCanceladasCounter.increment();
    }
}
4. Logs Estruturados
4.1 Configuração Logback
logback-spring.xml

<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- Console Appender (Development) -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- JSON Appender (Production - ELK Stack) -->
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"app":"hotel-gestao","environment":"${ENVIRONMENT:-dev}"}</customFields>
            <includeMdcKeyName>traceId</includeMdcKeyName>
            <includeMdcKeyName>spanId</includeMdcKeyName>
            <includeMdcKeyName>userId</includeMdcKeyName>
            <includeMdcKeyName>requestId</includeMdcKeyName>
        </encoder>
    </appender>

    <!-- File Appender (Rotativo) -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/hotel-gestao.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/hotel-gestao.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy 
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <!-- Error Appender (apenas erros) -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/error.log</file>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/error.%d{yyyy-MM-dd}.log.gz</fileNamePattern>
            <maxHistory>90</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <!-- Audit Appender (logs de auditoria) -->
    <appender name="AUDIT" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/audit.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/audit.%d{yyyy-MM-dd}.log.gz</fileNamePattern>
            <maxHistory>365</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <!-- Loggers -->
    <logger name="com.hotel.gestao" level="INFO"/>
    <logger name="com.hotel.gestao.audit" level="INFO" additivity="false">
        <appender-ref ref="AUDIT"/>
    </logger>
    
    <logger name="org.springframework.web" level="DEBUG"/>
    <logger name="org.hibernate.SQL" level="DEBUG"/>
    <logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE"/>

    <!-- Root Logger -->
    <springProfile name="dev,test">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>

    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="JSON"/>
            <appender-ref ref="FILE"/>
            <appender-ref ref="ERROR_FILE"/>
        </root>
    </springProfile>
</configuration>
4.2 Logs Críticos para Monitorar
Categoria	Nível	Exemplo	Ação
Reserva criada	INFO	Reserva criada - ID: 123, Valor: R$ 500	Dashboard
Reserva cancelada	INFO	Reserva cancelada - ID: 123	Dashboard
Conflito de reserva	WARN	Quarto 101 não disponível (OCUPADO)	Alert
Erro de validação	WARN	CPF duplicado: 123.456.789-00	Métrica
Erro de banco	ERROR	SQLException: Connection timeout	Alert CRÍTICO
Erro não tratado	ERROR	NullPointerException em ReservaService	Alert CRÍTICO
Lentidão	WARN	Query demorou 5s: SELECT * FROM reservas	Alert
Login/Logout	INFO	Usuário admin@hotel.com fez login	Auditoria
Mudança de dados	INFO	Quarto 101 status: DISPONIVEL → OCUPADO	Auditoria
4.3 MDC (Mapped Diagnostic Context)
LoggingInterceptor.java

package com.hotel.gestao.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class LoggingInterceptor implements HandlerInterceptor {

    private static final String REQUEST_ID = "requestId";
    private static final String USER_ID = "userId";
    private static final String IP_ADDRESS = "ipAddress";

    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        
        // Gerar ID único para a requisição
        String requestId = UUID.randomUUID().toString();
        MDC.put(REQUEST_ID, requestId);
        
        // Adicionar IP do cliente
        String ipAddress = getClientIP(request);
        MDC.put(IP_ADDRESS, ipAddress);
        
        // Adicionar userId (se autenticado)
        // String userId = SecurityContextHolder.getContext()
        //     .getAuthentication().getName();
        // MDC.put(USER_ID, userId);
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) {
        // Limpar MDC após requisição
        MDC.clear();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
WebConfig.java

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private LoggingInterceptor loggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor);
    }
}
5. Stack de Monitoramento
5.1 docker-compose.monitoring.yml
version: '3.8'

services:
  # ==================== PROMETHEUS ====================
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alerts.yml:/etc/prometheus/alerts.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  # ==================== GRAFANA ====================
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - monitoring

  # ==================== ALERTMANAGER ====================
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - monitoring

  # ==================== LOKI (Logs) ====================
  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - monitoring

  # ==================== PROMTAIL (Log Shipper) ====================
  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - ./promtail/promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log
      - ../logs:/app/logs  # Logs da aplicação
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

  # ==================== JAEGER (Tracing) ====================
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: jaeger
    ports:
      - "5775:5775/udp"
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"  # UI
      - "14268:14268"
      - "14250:14250"
      - "9411:9411"    # Zipkin compatible
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
    networks:
      - monitoring

  # ==================== NODE EXPORTER ====================
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:
  loki-data:
5.2 Prometheus Configuration
prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'hotel-gestao-prod'
    region: 'us-east-1'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# Regras de alerta
rule_files:
  - 'alerts.yml'

# Scrape configs
scrape_configs:
  # Spring Boot Application
  - job_name: 'hotel-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['hotel-backend:8080']
        labels:
          service: 'hotel-gestao'
          environment: 'production'
  
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  # Node Exporter (métricas de sistema)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
  
  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
5.3 Alertas
prometheus/alerts.yml

groups:
  # ==================== DISPONIBILIDADE ====================
  - name: availability
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: up{job="hotel-backend"} == 0
        for: 1m
        labels:
          severity: critical
          category: availability
        annotations:
          summary: "Serviço hotel-gestao está DOWN"
          description: "O serviço {{ $labels.instance }} está inacessível há mais de 1 minuto."
          runbook: "https://wiki.hotel.com/runbook/service-down"
      
      - alert: HighHealthCheckFailure
        expr: |
          (1 - avg(up{job="hotel-backend"})) * 100 > 10
        for: 5m
        labels:
          severity: warning
          category: availability
        annotations:
          summary: "Taxa de falha de health check alta"
          description: "{{ $value }}% das instâncias falharam no health check."

  # ==================== LATÊNCIA ====================
  - name: latency
    interval: 30s
    rules:
      - alert: HighLatencyP95
        expr: |
          histogram_quantile(0.95, 
            sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
          ) > 1
        for: 5m
        labels:
          severity: warning
          category: latency
        annotations:
          summary: "Latência P95 alta no endpoint {{ $labels.uri }}"
          description: "P95 = {{ $value }}s (SLO: < 1s)"
      
      - alert: CriticalLatencyP99
        expr: |
          histogram_quantile(0.99, 
            sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
          ) > 2
        for: 2m
        labels:
          severity: critical
          category: latency
        annotations:
          summary: "Latência P99 CRÍTICA no endpoint {{ $labels.uri }}"
          description: "P99 = {{ $value }}s (SLO: < 2s)"
      
      - alert: SlowDatabaseQueries
        expr: |
          histogram_quantile(0.95, 
            rate(database_query_duration_seconds_bucket[5m])
          ) > 0.5
        for: 5m
        labels:
          severity: warning
          category: database
        annotations:
          summary: "Queries SQL lentas detectadas"
          description: "P95 de queries = {{ $value }}s (esperado < 0.5s)"

  # ==================== TAXA DE ERRO ====================
  - name: errors
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_server_requests_total{status=~"5.."}[5m])) 
            / 
            sum(rate(http_server_requests_total[5m]))
          ) * 100 > 1
        for: 5m
        labels:
          severity: critical
          category: errors
        annotations:
          summary: "Taxa de erro 5xx alta: {{ $value }}%"
          description: "SLO violado: taxa de erro > 1%"
      
      - alert: HighClientErrorRate
        expr: |
          (
            sum(rate(http_server_requests_total{status=~"4.."}[5m])) 
            / 
            sum(rate(http_server_requests_total[5m]))
          ) * 100 > 10
        for: 10m
        labels:
          severity: warning
          category: errors
        annotations:
          summary: "Taxa de erro 4xx alta: {{ $value }}%"
          description: "Possível problema com clientes ou validações"
      
      - alert: ReservaConflictSpike
        expr: |
          rate(reservas_conflict_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
          category: business
        annotations:
          summary: "Pico de conflitos de reserva"
          description: "{{ $value }} conflitos/seg nos últimos 5min"
      
      - alert: DatabaseConnectionErrors
        expr: |
          increase(database_connection_errors_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
          category: database
        annotations:
          summary: "Erros de conexão com banco de dados"
          description: "{{ $value }} erros de conexão nos últimos 5min"

  # ==================== SATURAÇÃO ====================
  - name: saturation
    interval: 30s
    rules:
      - alert: HighMemoryUsage
        expr: |
          (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100 > 85
        for: 5m
        labels:
          severity: warning
          category: saturation
        annotations:
          summary: "Uso de memória JVM alto: {{ $value }}%"
          description: "Memória heap acima de 85% há 5 minutos"
      
      - alert: CriticalMemoryUsage
        expr: |
          (jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100 > 95
        for: 2m
        labels:
          severity: critical
          category: saturation
        annotations:
          summary: "Uso de memória JVM CRÍTICO: {{ $value }}%"
          description: "Risco iminente de OutOfMemoryError"
      
      - alert: HighCPUUsage
        expr: |
          rate(process_cpu_seconds_total[5m]) * 100 > 80
        for: 5m
        labels:
          severity: warning
          category: saturation
        annotations:
          summary: "Uso de CPU alto: {{ $value }}%"
          description: "CPU acima de 80% há 5 minutos"
      
      - alert: ConnectionPoolNearExhaustion
        expr: |
          (hikaricp_connections_active / hikaricp_connections_max) * 100 > 85
        for: 3m
        labels:
          severity: warning
          category: database
        annotations:
          summary: "Pool de conexões DB próximo do limite"
          description: "{{ $value }}% das conexões em uso"
      
      - alert: HighThreadCount
        expr: |
          jvm_threads_live_threads > 500
        for: 5m
        labels:
          severity: warning
          category: saturation
        annotations:
          summary: "Número alto de threads: {{ $value }}"
          description: "Possível thread leak ou carga excessiva"
      
      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 5m
        labels:
          severity: critical
          category: infrastructure
        annotations:
          summary: "Espaço em disco baixo: {{ $value }}%"
          description: "Menos de 15% de espaço livre"

  # ==================== NEGÓCIO ====================
  - name: business
    interval: 1m
    rules:
      - alert: TaxaOcupacaoBaixa
        expr: |
          quartos_taxa_ocupacao < 30
        for: 30m
        labels:
          severity: info
          category: business
        annotations:
          summary: "Taxa de ocupação baixa: {{ $value }}%"
          description: "Taxa de ocupação abaixo de 30%"
      
      - alert: PicoReservasCanceladas
        expr: |
          rate(reservas_cancelled_total[1h]) > 0.1
        for: 10m
        labels:
          severity: warning
          category: business
        annotations:
          summary: "Pico de cancelamentos detectado"
          description: "{{ $value }} cancelamentos/seg na última hora"
      
      - alert: SemReservasNovas
        expr: |
          rate(reservas_created_total[1h]) == 0
        for: 2h
        labels:
          severity: warning
          category: business
        annotations:
          summary: "Nenhuma reserva criada nas últimas 2 horas"
          description: "Possível problema no sistema de reservas"
5.4 AlertManager Configuration
alertmanager/alertmanager.yml

global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  
  routes:
    # Alertas críticos -> PagerDuty + Slack
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
    
    - match:
        severity: critical
      receiver: 'slack-critical'
    
    # Alertas de warning -> Slack apenas
    - match:
        severity: warning
      receiver: 'slack-warnings'
    
    # Alertas de negócio -> Slack business channel
    - match:
        category: business
      receiver: 'slack-business'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'slack-critical'
    slack_configs:
      - channel: '#alerts-critical'
        color: 'danger'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: |
          *Summary:* {{ .CommonAnnotations.summary }}
          *Description:* {{ .CommonAnnotations.description }}
          *Runbook:* {{ .CommonAnnotations.runbook }}
  
  - name: 'slack-warnings'
    slack_configs:
      - channel: '#alerts'
        color: 'warning'
        title: '⚠️  WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.summary }}'
  
  - name: 'slack-business'
    slack_configs:
      - channel: '#business-metrics'
        color: 'good'
        title: '📊 Business Alert: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
  
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        description: '{{ .CommonAnnotations.summary }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
6. Dashboard Grafana
6.1 Dashboard Principal - hotel-gestao-overview.json
{
  "dashboard": {
    "title": "Hotel Gestão - Overview",
    "panels": [
      {
        "title": "Disponibilidade (Uptime)",
        "targets": [
          {
            "expr": "avg(up{job='hotel-backend'}) * 100"
          }
        ],
        "type": "stat",
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"value": 0, "color": "red"},
                {"value": 99, "color": "yellow"},
                {"value": 99.9, "color": "green"}
              ]
            }
          }
        }
      },
      {
        "title": "Taxa de Requisições",
        "targets": [
          {
            "expr": "sum(rate(http_server_requests_total[5m]))",
            "legendFormat": "req/s"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Latência (P50, P95, P99)",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))",
            "legendFormat": "P50"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))",
            "legendFormat": "P99"
          }
        ],
        "type": "graph",
        "yaxes": [{"format": "s"}]
      },
      {
        "title": "Taxa de Erro",
        "targets": [
          {
            "expr": "(sum(rate(http_server_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_server_requests_total[5m]))) * 100",
            "legendFormat": "5xx"
          },
          {
            "expr": "(sum(rate(http_server_requests_total{status=~\"4..\"}[5m])) / sum(rate(http_server_requests_total[5m]))) * 100",
            "legendFormat": "4xx"
          }
        ],
        "type": "graph",
        "fieldConfig": {
          "defaults": {
            "unit": "percent"
          }
        }
      },
      {
        "title": "Memória JVM",
        "targets": [
          {
            "expr": "jvm_memory_used_bytes{area='heap'}",
            "legendFormat": "Used"
          },
          {
            "expr": "jvm_memory_max_bytes{area='heap'}",
            "legendFormat": "Max"
          }
        ],
        "type": "graph",
        "fieldConfig": {
          "defaults": {
            "unit": "bytes"
          }
        }
      },
      {
        "title": "Taxa de Ocupação",
        "targets": [
          {
            "expr": "quartos_taxa_ocupacao"
          }
        ],
        "type": "gauge",
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "thresholds": {
              "steps": [
                {"value": 0, "color": "red"},
                {"value": 50, "color": "yellow"},
                {"value": 80, "color": "green"}
              ]
            }
          }
        }
      },
      {
        "title": "Reservas (últimas 24h)",
        "targets": [
          {
            "expr": "increase(reservas_created_total[24h])",
            "legendFormat": "Criadas"
          },
          {
            "expr": "increase(reservas_cancelled_total[24h])",
            "legendFormat": "Canceladas"
          },
          {
            "expr": "increase(reservas_conflict_total[24h])",
            "legendFormat": "Conflitos"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Top 5 Endpoints (Latência)",
        "targets": [
          {
            "expr": "topk(5, histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)))"
          }
        ],
        "type": "table"
      },
      {
        "title": "Pool de Conexões DB",
        "targets": [
          {
            "expr": "hikaricp_connections_active",
            "legendFormat": "Active"
          },
          {
            "expr": "hikaricp_connections_idle",
            "legendFormat": "Idle"
          },
          {
            "expr": "hikaricp_connections_max",
            "legendFormat": "Max"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
7. SLIs, SLOs e SLAs
Service Level Indicators (SLIs)
SLI	Medição	Fonte
Disponibilidade	% de requisições com sucesso (não 5xx)	http_server_requests_total
Latência	P95 de tempo de resposta	http_server_requests_seconds_bucket
Taxa de Erro	% de requisições 5xx	http_server_requests_total{status=~"5.."}
Durabilidade	% de transações commitadas com sucesso	JPA metrics
Service Level Objectives (SLOs)
Métrica	SLO	Janela	Budget de Erro
Disponibilidade	99.9%	30 dias	43.2 min/mês
Latência P95	< 500ms	7 dias	-
Latência P99	< 1s	7 dias	-
Taxa de Erro	< 0.1%	30 dias	129.6 req/mês (se 30k req/dia)
Service Level Agreements (SLAs)
Tier	Disponibilidade	Latência P95	Suporte	Penalidade
Premium	99.95%	< 200ms	24/7	25% crédito
Standard	99.9%	< 500ms	Business hours	10% crédito
Basic	99.0%	< 1s	Best effort	Sem garantia
8. Comandos Úteis
# Verificar métricas localmente
curl http://localhost:8080/actuator/prometheus

# Validar configuração Prometheus
promtool check config prometheus.yml

# Validar alertas
promtool check rules alerts.yml

# Testar alerta
curl -X POST http://localhost:9093/api/v1/alerts

# Query Prometheus CLI
curl 'http://localhost:9090/api/v1/query?query=up'

# Ver logs estruturados
docker logs hotel-backend | jq .

# Buscar logs por traceId
grep "traceId=abc123" logs/hotel-gestao.log

# Estatísticas de logs
cat logs/hotel-gestao.log | jq -r '.level' | sort | uniq -c
9. Checklist de Monitoramento
✅ Configuração Inicial
 Actuator endpoints habilitados
 Prometheus configurado
 Grafana dashboards criados
 Alertas configurados
 Logs estruturados (JSON)
 Tracing distribuído ativado
✅ Métricas Essenciais
 Golden Signals implementados
 Métricas de negócio customizadas
 Health checks funcionando
 Pool de conexões monitorado
✅ Logs
 Níveis de log adequados
 MDC com requestId/traceId
 Rotação de logs configurada
 Logs de auditoria separados
✅ Alertas
 Alertas críticos com PagerDuty
 Slack integrado
 Runbooks documentados
 Testes de alerta realizados
✅ Dashboards
 Overview dashboard
 Dashboards por domínio (Reservas, Quartos)
 Dashboard de negócio (KPIs)
 Dashboard de infraestrutura
10. Resumo
Estratégia completa de observabilidade implementada com:

✅ Métricas: 25+ métricas (Golden Signals + Business)
✅ Logs: Estruturados em JSON com MDC
✅ Traces: Jaeger para distributed tracing
✅ Alertas: 20+ regras com severidade e escalação
✅ Dashboards: Grafana com visualização unificada
✅ SLOs: Definidos e mensuráveis

Sistema pronto para produção com observabilidade de classe mundial! 📊🔍🚨

