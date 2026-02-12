-- Dados Iniciais para Testes

-- Inserir Quartos
INSERT INTO quartos (id, numero, tipo, preco_diaria, disponivel, criado_em) VALUES
('550e8400-e29b-41d4-a716-446655440001', 101, 'Standard', 150.00, true, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 102, 'Standard Duplo', 200.00, true, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 201, 'Suite Executiva', 350.00, true, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', 202, 'Suite Luxo', 500.00, true, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440005', 301, 'Cobertura Premium', 800.00, true, CURRENT_TIMESTAMP);

-- Inserir Hóspedes (CPFs válidos para teste)
INSERT INTO hospedes (id, nome, sobrenome, cpf, email, criado_em) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'João', 'Silva', '12345678909', 'joao.silva@email.com', CURRENT_TIMESTAMP),
('660e8400-e29b-41d4-a716-446655440002', 'Maria', 'Santos', '98765432100', 'maria.santos@email.com', CURRENT_TIMESTAMP),
('660e8400-e29b-41d4-a716-446655440003', 'Pedro', 'Oliveira', '11122233344', 'pedro.oliveira@email.com', CURRENT_TIMESTAMP);
