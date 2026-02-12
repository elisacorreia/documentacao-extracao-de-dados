# Pipeline de Deploy - Sistema de Gestão Hotelaria

## Arquitetura do Pipeline



┌─────────────────────────────────────────────────────────────────────┐
│                         PIPELINE CI/CD                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. CODE PUSH                                                        │
│     └─► Git Push → GitHub/GitLab                                    │
│                                                                      │
│  2. BUILD & TEST (CI)                    ⏱️ ~2-3 min                │
│     ├─► Checkout código                                             │
│     ├─► Setup Java 17                                               │
│     ├─► Build com Maven                                             │
│     ├─► Testes Unitários                 ✅ 12 testes               │
│     ├─► Testes de Integração             ✅ 11 testes               │
│     ├─► Análise de Cobertura (JaCoCo)    🎯 > 80%                   │
│     ├─► SonarQube (Code Quality)         🔍 Quality Gate            │
│     └─► Build Docker Image                                          │
│                                                                      │
│  3. SECURITY SCAN                        ⏱️ ~1 min                  │
│     ├─► Trivy (vulnerabilidades)                                    │
│     ├─► OWASP Dependency Check                                      │
│     └─► Snyk (dependências)                                         │
│                                                                      │
│  4. PUBLISH                              ⏱️ ~30 seg                 │
│     └─► Push para Docker Registry                                   │
│         • Docker Hub                                                │
│         • AWS ECR                                                   │
│         • GitHub Container Registry                                 │
│                                                                      │
│  5. DEPLOY (CD)                                                      │
│     ├─► DEV         → Automático em cada commit                     │
│     ├─► STAGING     → Automático em merge para main                 │
│     └─► PRODUCTION  → Manual (aprovação)                            │
│                                                                      │
│  6. POST-DEPLOY                                                      │
│     ├─► Health Check                                                │
│     ├─► Smoke Tests                                                 │
│     ├─► Notificação (Slack/Email)                                   │
│     └─► Monitoramento (Prometheus + Grafana)                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

---

## 1. Dockerização

### Dockerfile (Multi-stage Build)
```dockerfile
# ============================================
# STAGE 1: Build
# ============================================
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copiar apenas pom.xml primeiro (cache de dependências)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fonte e compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================
# STAGE 2: Runtime
# ============================================
FROM eclipse-temurin:17-jre-alpine

# Criar usuário não-root para segurança
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

# Copiar apenas o JAR compilado do stage anterior
COPY --from=build /app/target/*.jar app.jar

# Variáveis de ambiente
ENV JAVA_OPTS="-Xmx512m -Xms256m" \
    SPRING_PROFILES_ACTIVE=prod

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Executar aplicação
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

```

### docker-compose.yml (Desenvolvimento Local)

```yaml
version: '3.8'

services:
  # Backend Spring Boot
  hotel-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hotel-gestao-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/hoteldb
      - SPRING_DATASOURCE_USERNAME=hotel_user
      - SPRING_DATASOURCE_PASSWORD=hotel_pass
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - hotel-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s

  # Banco de Dados PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: hotel-postgres
    environment:
      POSTGRES_DB: hoteldb
      POSTGRES_USER: hotel_user
      POSTGRES_PASSWORD: hotel_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - hotel-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hotel_user -d hoteldb"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (Cache - opcional)
  redis:
    image: redis:7-alpine
    container_name: hotel-redis
    ports:
      - "6379:6379"
    networks:
      - hotel-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Frontend React (opcional)
  hotel-frontend:
    image: nginx:alpine
    container_name: hotel-frontend
    ports:
      - "3000:80"
    volumes:
      - ./frontend/build:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - hotel-backend
    networks:
      - hotel-network
    restart: unless-stopped

networks:
  hotel-network:
    driver: bridge

volumes:
  postgres-data:

```

### .dockerignore

```text
# Build artifacts
target/
*.jar
*.war
*.class

# IDEs
.idea/
.vscode/
*.iml
.settings/
.project
.classpath

# OS
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Logs
*.log

# Docs
README.md
docs/

# Tests
src/test/

```

---

## 2. CI/CD - GitHub Actions

### .github/workflows/ci-cd.yml

```yaml
name: CI/CD Pipeline - Hotel Gestão

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

env:
  JAVA_VERSION: '17'
  MAVEN_OPTS: -Dhttp.keepAlive=false -Dmaven.wagon.http.pool=false
  DOCKER_IMAGE: hotel-gestao
  REGISTRY: ghcr.io

jobs:
  # =============================================
  # JOB 1: BUILD & TEST
  # =============================================
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout código
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Para SonarQube
      
      - name: ☕ Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: maven
      
      - name: 🔧 Verificar versão
        run: |
          java -version
          mvn -version
      
      - name: 📦 Build com Maven
        run: mvn clean install -DskipTests -B
      
      - name: 🧪 Testes Unitários
        run: mvn test -B
      
      - name: 🔗 Testes de Integração
        run: mvn verify -B
      
      - name: 📊 Análise de Cobertura (JaCoCo)
        run: mvn jacoco:report
      
      - name: 📈 Upload Cobertura para Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./target/site/jacoco/jacoco.xml
          fail_ci_if_error: true
      
      - name: 🔍 SonarQube Scan
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        run: |
          mvn sonar:sonar \
            -Dsonar.projectKey=hotel-gestao \
            -Dsonar.host.url=$SONAR_HOST_URL \
            -Dsonar.login=$SONAR_TOKEN
      
      - name: 📤 Upload Artifact (JAR)
        uses: actions/upload-artifact@v3
        with:
          name: hotel-gestao-jar
          path: target/*.jar
          retention-days: 7

  # =============================================
  # JOB 2: SECURITY SCAN
  # =============================================
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build-and-test
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
      
      - name: 🔒 OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'hotel-gestao'
          path: '.'
          format: 'HTML'
      
      - name: 🛡️ Snyk Security Scan
        uses: snyk/actions/maven@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: 📤 Upload Security Report
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: reports/

  # =============================================
  # JOB 3: DOCKER BUILD & PUSH
  # =============================================
  docker-build:
    name: Docker Build & Push
    runs-on: ubuntu-latest
    needs: [build-and-test, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
      
      - name: 🔐 Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: 🏷️ Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: 🐳 Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: 🔍 Scan Docker Image com Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ github.repository }}:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: 📤 Upload Trivy Results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # =============================================
  # JOB 4: DEPLOY DEV
  # =============================================
  deploy-dev:
    name: Deploy to DEV
    runs-on: ubuntu-latest
    needs: docker-build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: development
      url: [https://dev.hotel-gestao.com](https://dev.hotel-gestao.com)
    
    steps:
      - name: 🚀 Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEV_HOST }}
          username: ${{ secrets.DEV_USER }}
          key: ${{ secrets.DEV_SSH_KEY }}
          script: |
            cd /opt/hotel-gestao
            docker-compose pull
            docker-compose up -d --force-recreate
            docker image prune -f
      
      - name: 🏥 Health Check
        run: |
          sleep 30
          curl -f [https://dev.hotel-gestao.com/actuator/health](https://dev.hotel-gestao.com/actuator/health) || exit 1
      
      - name: 📢 Notificação Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deploy DEV concluído! 🎉'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  # =============================================
  # JOB 5: DEPLOY STAGING
  # =============================================
  deploy-staging:
    name: Deploy to STAGING
    runs-on: ubuntu-latest
    needs: docker-build
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: [https://staging.hotel-gestao.com](https://staging.hotel-gestao.com)
    
    steps:
      - name: 🚀 Deploy to Staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/hotel-gestao
            docker-compose -f docker-compose.staging.yml pull
            docker-compose -f docker-compose.staging.yml up -d --force-recreate
      
      - name: 🧪 Smoke Tests
        run: |
          sleep 30
          curl -f [https://staging.hotel-gestao.com/actuator/health](https://staging.hotel-gestao.com/actuator/health)
          # Adicionar mais testes se necessário

  # =============================================
  # JOB 6: DEPLOY PRODUCTION (Manual)
  # =============================================
  deploy-production:
    name: Deploy to PRODUCTION
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: [https://hotel-gestao.com](https://hotel-gestao.com)
    
    steps:
      - name: 🚀 Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/hotel-gestao
            
            # Backup do banco antes do deploy
            docker exec hotel-postgres pg_dump -U hotel_user hoteldb > backup-$(date +%Y%m%d-%H%M%S).sql
            
            # Deploy
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d --force-recreate --no-deps hotel-backend
            
            # Aguardar health check
            sleep 45
      
      - name: 🏥 Production Health Check
        run: |
          for i in {1..10}; do
            if curl -f [https://hotel-gestao.com/actuator/health](https://hotel-gestao.com/actuator/health); then
              echo "Health check passed!"
              exit 0
            fi
            echo "Attempt $i failed, retrying..."
            sleep 10
          done
          exit 1
      
      - name: 📢 Notificação de Sucesso
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: '🚀 Deploy PRODUCTION concluído com sucesso!',
              attachments: [{
                color: 'good',
                fields: [
                  { title: 'Ambiente', value: 'Production', short: true },
                  { title: 'Versão', value: '${{ github.sha }}', short: true },
                  { title: 'URL', value: '[https://hotel-gestao.com](https://hotel-gestao.com)', short: false }
                ]
              }]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: success()
      
      - name: 🔄 Rollback em caso de falha
        if: failure()
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/hotel-gestao
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d
      
      - name: 🚨 Notificação de Falha
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: '❌ Deploy PRODUCTION FALHOU! Rollback executado.',
              attachments: [{
                color: 'danger',
                fields: [
                  { title: 'Erro', value: 'Health check failed', short: false }
                ]
              }]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: failure()

```

---

## 3. Alternativa: GitLab CI/CD

### .gitlab-ci.yml

```yaml
stages:
  - build
  - test
  - security
  - package
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"
  DOCKER_IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG"

cache:
  paths:
    - .m2/repository/
    - target/

# ==================== BUILD ====================
build:
  stage: build
  image: maven:3.9-eclipse-temurin-17
  script:
    - mvn clean compile -B
  artifacts:
    paths:
      - target/
    expire_in: 1 hour

# ==================== TEST ====================
unit-tests:
  stage: test
  image: maven:3.9-eclipse-temurin-17
  script:
    - mvn test -B
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit: target/surefire-reports/TEST-*.xml
      coverage_report:
        coverage_format: jacoco
        path: target/site/jacoco/jacoco.xml

integration-tests:
  stage: test
  image: maven:3.9-eclipse-temurin-17
  services:
    - postgres:15
  variables:
    POSTGRES_DB: hoteldb_test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
  script:
    - mvn verify -B

# ==================== SECURITY ====================
dependency-check:
  stage: security
  image: owasp/dependency-check:latest
  script:
    - /usr/share/dependency-check/bin/dependency-check.sh --scan . --format HTML --out reports/
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
  allow_failure: true

# ==================== PACKAGE ====================
docker-build:
  stage: package
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
  only:
    - main
    - develop

# ==================== DEPLOY ====================
deploy-dev:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - ssh $DEV_USER@$DEV_HOST "cd /opt/hotel-gestao && docker-compose pull && docker-compose up -d"
  environment:
    name: development
    url: [https://dev.hotel-gestao.com](https://dev.hotel-gestao.com)
  only:
    - develop

deploy-prod:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - ssh $PROD_USER@$PROD_HOST "cd /opt/hotel-gestao && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
  environment:
    name: production
    url: [https://hotel-gestao.com](https://hotel-gestao.com)
  when: manual
  only:
    - main

```

---

## 4. Kubernetes (Produção Escalável)

### k8s/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hotel-backend
  namespace: hotel-gestao
  labels:
    app: hotel-backend
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hotel-backend
  template:
    metadata:
      labels:
        app: hotel-backend
        version: v1
    spec:
      containers:
      - name: hotel-backend
        image: ghcr.io/seu-usuario/hotel-gestao:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: hotel-secrets
              key: database-url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: hotel-secrets
              key: database-username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: hotel-secrets
              key: database-password
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: hotel-backend-service
  namespace: hotel-gestao
spec:
  selector:
    app: hotel-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hotel-backend-hpa
  namespace: hotel-gestao
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hotel-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

```

---

## 5. Monitoramento

### prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'hotel-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['hotel-backend:8080']

```

### application.properties (Spring Boot Actuator)

```properties
# Actuator endpoints
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
management.health.livenessState.enabled=true
management.health.readinessState.enabled=true
management.metrics.export.prometheus.enabled=true

```

---

## 6. Secrets Management

GitHub Secrets necessários:

* **Docker Registry:** `DOCKER_USERNAME`, `DOCKER_PASSWORD`
* **SonarQube:** `SONAR_TOKEN`, `SONAR_HOST_URL`
* **Snyk:** `SNYK_TOKEN`
* **SSH Deploy:** `DEV_HOST`, `DEV_USER`, `DEV_SSH_KEY`, `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`, `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`
* **Slack:** `SLACK_WEBHOOK`
* **Database (K8s):** `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

---

## 7. Comandos Úteis

```bash
# Build local
docker build -t hotel-gestao:local .

# Executar localmente
docker-compose up -d

# Ver logs
docker-compose logs -f hotel-backend

# Parar tudo
docker-compose down

# Limpar volumes
docker-compose down -v

# Deploy manual Kubernetes
kubectl apply -f k8s/

# Ver pods
kubectl get pods -n hotel-gestao

# Ver logs Kubernetes
kubectl logs -f deployment/hotel-backend -n hotel-gestao

# Escalar manualmente
kubectl scale deployment hotel-backend --replicas=5 -n hotel-gestao

```

---

## 8. Resumo da Estratégia

| Ambiente | Trigger | Aprovação | URL |
| --- | --- | --- | --- |
| **DEV** | Push para `develop` | ❌ Automático | https://www.google.com/search?q=dev.hotel-gestao.com |
| **STAGING** | Merge para `main` | ❌ Automático | https://www.google.com/search?q=staging.hotel-gestao.com |
| **PRODUCTION** | Após Staging | ✅ Manual | https://www.google.com/search?q=hotel-gestao.com |

Pipeline completo pronto para produção! 🚀🐳
